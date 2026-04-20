import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function useCommunicationLogs(clientId) {
  return useQuery({
    queryKey: ['communicationLogs', clientId],
    enabled: !!clientId,
    queryFn: () => {
      const db = getMockDB()
      return db.communicationLogs
        .filter((l) => l.client_id === clientId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
  })
}

export function useAddCommunicationLog() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ clientId, message }) => {
      const db = getMockDB()
      const log = {
        id: uuid(),
        client_id: clientId,
        message,
        logged_by: user?.id,
        logged_by_name: user?.full_name || 'System',
        created_at: new Date().toISOString(),
      }
      db.communicationLogs.push(log)
      return log
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['communicationLogs', clientId] })
    },
  })
}
