import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

// A lead qualifies when:
// - Has name, contact, level, program
// - Has at least one follow-up attempt logged OR is in Qualified/Converted status
export function isLeadQualified(lead) {
  const hasCoreInfo = lead.name && lead.contact && lead.level && lead.program && lead.service_interest
  const hasEngagement = lead.status === 'Qualified' || lead.status === 'Converted' || lead.status === 'Contacted'
  return hasCoreInfo && hasEngagement
}

export function useLeads(filters = {}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => {
      const db = getMockDB()
      let results = [...db.leads]
      if (filters.status) results = results.filter((l) => l.status === filters.status)
      if (filters.search) {
        const s = filters.search.toLowerCase()
        results = results.filter((l) =>
          l.name?.toLowerCase().includes(s) ||
          l.contact?.toLowerCase().includes(s) ||
          l.program?.toLowerCase().includes(s)
        )
      }
      return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (lead) => {
      const db = getMockDB()
      const newLead = {
        id: uuid(),
        ...lead,
        status: lead.status || 'New',
        created_by: user?.id,
        created_by_name: user?.full_name || 'System',
        created_at: new Date().toISOString(),
      }
      db.leads.push(newLead)
      db.auditLogs.unshift({
        id: uuid(), action: 'create', entity: 'lead', entity_id: newLead.id,
        description: `Added lead: ${newLead.name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return newLead
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const db = getMockDB()
      const idx = db.leads.findIndex((l) => l.id === id)
      if (idx === -1) throw new Error('Lead not found')
      db.leads[idx] = { ...db.leads[idx], ...updates }
      db.auditLogs.unshift({
        id: uuid(), action: 'update', entity: 'lead', entity_id: id,
        description: `Updated lead: ${db.leads[idx].name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return db.leads[idx]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      const db = getMockDB()
      const idx = db.leads.findIndex((l) => l.id === id)
      if (idx !== -1) db.leads.splice(idx, 1)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })
}
