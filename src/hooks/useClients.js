import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function useClients(filters = {}) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => {
      const db = getMockDB()
      let results = [...db.clients]

      if (filters.status) results = results.filter((c) => c.status === filters.status)
      if (filters.type) results = results.filter((c) => c.type === filters.type)
      if (filters.year_batch) results = results.filter((c) => c.year_batch === Number(filters.year_batch))
      if (filters.writer_id) results = results.filter((c) => c.writer_id === filters.writer_id)
      if (filters.sales_agent_id) results = results.filter((c) => c.sales_agent_id === filters.sales_agent_id)
      if (filters.level) results = results.filter((c) => c.level === filters.level)
      if (filters.is_carry_over === 'true') results = results.filter((c) => c.is_carry_over)
      if (filters.is_carry_over === 'false') results = results.filter((c) => !c.is_carry_over)
      if (filters.search) {
        const s = filters.search.toLowerCase()
        results = results.filter((c) => c.name.toLowerCase().includes(s) || c.project_name.toLowerCase().includes(s))
      }

      // Re-attach latest paper_releases
      results = results.map((c) => ({
        ...c,
        paper_releases: db.paperReleases.filter((pr) => pr.client_id === c.id),
      }))

      return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (clientData) => {
      const db = getMockDB()
      const clientId = uuid()
      const writer = db.writers.find((w) => w.id === clientData.writer_id) || null
      const agent = clientData.sales_agent_id ? db.salesAgents.find((a) => a.id === clientData.sales_agent_id) : null

      const client = {
        id: clientId,
        ...clientData,
        is_carry_over: clientData.is_carry_over || false,
        referral_source: clientData.referral_source || null,
        notes: clientData.notes || null,
        added_by: user?.id,
        completed_at: null,
        created_at: new Date().toISOString(),
        writers: writer ? { name: writer.name } : null,
        sales_agents: agent ? { name: agent.name } : null,
        paper_releases: [],
      }

      // Auto-generate ONE installment row per client
      db.installments.push({
        id: uuid(),
        client_id: clientId,
        total_amount: clientData.total_amount,
        total_paid: 0,
        gives: clientData.gives,
        current_give: 0,
        status: 'Pending',
        updated_at: new Date().toISOString(),
        payments: [],
        clients: { name: clientData.name, project_name: clientData.project_name, type: clientData.type, total_amount: clientData.total_amount, status: 'Active', writer_id: clientData.writer_id, writers: writer ? { name: writer.name } : null },
      })

      // Auto-generate payroll
      const periods = clientData.type === 'Package' ? 2 : 1
      const gross = (clientData.total_amount * 0.30) / periods
      for (let p = 1; p <= periods; p++) {
        db.payroll.push({
          id: uuid(), client_id: clientId, writer_id: clientData.writer_id, period: p,
          gross_amount: gross, penalty_pct: 0, penalty_reason: null,
          penalty_set_by: null, penalty_set_at: null,
          net_receivable: gross, first_release: gross * 0.90, retained_amount: gross * 0.10,
          trigger_met: false, admin_approved: false, approved_by: null, approved_at: null,
          first_release_status: 'Pending', first_released_at: null, first_released_by: null,
          retention_status: 'Holding', retention_released_at: null, retention_released_by: null,
          feedback_submitted: false, revision_done: false, fm_report_id: null,
          created_at: new Date().toISOString(),
          clients: { name: clientData.name, project_name: clientData.project_name, type: clientData.type, total_amount: clientData.total_amount, status: 'Active' },
          writers: writer ? { name: writer.name } : null,
        })
      }

      // Auto-generate paper releases
      for (let p = 1; p <= periods; p++) {
        const pr = { id: uuid(), client_id: clientId, period: p, released: false, released_at: null, released_by: null }
        db.paperReleases.push(pr)
        client.paper_releases.push(pr)
      }

      // Auto-generate agent cut
      if (clientData.sales_agent_id) {
        db.salesAgentCuts.push({
          id: uuid(), client_id: clientId, agent_id: clientData.sales_agent_id,
          cut_amount: 0, cut_notes: null, set_by: user?.id, set_at: new Date().toISOString(),
          paid: false, paid_at: null, paid_by: null, fm_report_id: null,
          clients: { name: clientData.name, project_name: clientData.project_name, type: clientData.type, status: 'Active' },
          sales_agents: agent ? { name: agent.name } : null,
        })
      }

      db.clients.push(client)

      db.auditLogs.unshift({
        id: uuid(), action: 'create', entity: 'client', entity_id: clientId,
        description: `Added client: ${clientData.name} — ${clientData.project_name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })

      return client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['installments'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const db = getMockDB()
      const idx = db.clients.findIndex((c) => c.id === id)
      if (idx === -1) throw new Error('Client not found')

      // Update joined relations if writer/agent changed
      if (updates.writer_id) {
        const w = db.writers.find((w) => w.id === updates.writer_id)
        updates.writers = w ? { name: w.name } : null
      }
      if (updates.sales_agent_id !== undefined) {
        const a = db.salesAgents.find((a) => a.id === updates.sales_agent_id)
        updates.sales_agents = a ? { name: a.name } : null
      }

      db.clients[idx] = { ...db.clients[idx], ...updates }
      db.auditLogs.unshift({
        id: uuid(), action: 'update', entity: 'client', entity_id: id,
        description: `Updated client: ${db.clients[idx].name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return db.clients[idx]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (client) => {
      const db = getMockDB()
      const idx = db.clients.findIndex((c) => c.id === client.id)
      if (idx !== -1) db.clients[idx].status = 'Completed'
      db.auditLogs.unshift({
        id: uuid(), action: 'archive', entity: 'client', entity_id: client.id,
        description: `Archived client: ${client.name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] })
    },
  })
}

export function useReleasePaper() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ clientId, period }) => {
      const db = getMockDB()
      const pr = db.paperReleases.find((p) => p.client_id === clientId && p.period === period)
      if (!pr) throw new Error('Paper release not found')
      pr.released = true
      pr.released_at = new Date().toISOString()
      pr.released_by = user?.id
      db.auditLogs.unshift({
        id: uuid(), action: 'release_paper', entity: 'paper_release', entity_id: pr.id,
        description: `Released paper period ${period}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return pr
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}
