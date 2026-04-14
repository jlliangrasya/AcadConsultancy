import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function useSalesAgents() {
  return useQuery({
    queryKey: ['salesAgents'],
    queryFn: () => {
      const db = getMockDB()
      return [...db.salesAgents].sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export function useActiveSalesAgents() {
  return useQuery({
    queryKey: ['salesAgents', 'active'],
    queryFn: () => {
      const db = getMockDB()
      return db.salesAgents.filter((a) => a.status === 'active').sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export function useCreateSalesAgent() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (agent) => {
      const db = getMockDB()
      const newAgent = { id: uuid(), ...agent, status: 'active', created_at: new Date().toISOString() }
      db.salesAgents.push(newAgent)
      db.auditLogs.unshift({
        id: uuid(), action: 'create', entity: 'sales_agent', entity_id: newAgent.id,
        description: `Added sales agent: ${newAgent.name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return newAgent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesAgents'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useUpdateSalesAgent() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const db = getMockDB()
      const idx = db.salesAgents.findIndex((a) => a.id === id)
      if (idx === -1) throw new Error('Agent not found')
      db.salesAgents[idx] = { ...db.salesAgents[idx], ...updates }
      db.auditLogs.unshift({
        id: uuid(), action: 'update', entity: 'sales_agent', entity_id: id,
        description: `Updated sales agent: ${db.salesAgents[idx].name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return db.salesAgents[idx]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesAgents'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useAgentEarnings(agentId) {
  return useQuery({
    queryKey: ['agentEarnings', agentId],
    enabled: !!agentId,
    queryFn: () => {
      const db = getMockDB()
      return db.salesAgentCuts.filter((c) => c.agent_id === agentId)
    },
  })
}
