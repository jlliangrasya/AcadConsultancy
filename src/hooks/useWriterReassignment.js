import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function useWriterAssignments(clientId) {
  return useQuery({
    queryKey: ['writerAssignments', clientId],
    enabled: !!clientId,
    queryFn: () => {
      const db = getMockDB()
      return db.writerAssignments
        .filter((a) => a.client_id === clientId)
        .sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at))
    },
  })
}

export function useReassignWriter() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ clientId, newWriterId, reason }) => {
      const db = getMockDB()
      const client = db.clients.find((c) => c.id === clientId)
      if (!client) throw new Error('Client not found')

      const newWriter = db.writers.find((w) => w.id === newWriterId)
      if (!newWriter) throw new Error('New writer not found')

      // Close current assignment
      const current = db.writerAssignments.find(
        (a) => a.client_id === clientId && a.unassigned_at === null
      )
      if (current) {
        // Calc amount the old writer already received
        const releasedPayroll = db.payroll.filter(
          (p) => p.client_id === clientId && p.writer_id === current.writer_id && p.first_release_status === 'Released'
        )
        const amountReceived = releasedPayroll.reduce((sum, p) => sum + Number(p.first_release), 0)

        current.unassigned_at = new Date().toISOString()
        current.reason = reason
        current.amount_received = amountReceived
        current.unassigned_by = user?.id
      }

      // Update unreleased payroll rows to the new writer
      db.payroll.forEach((p) => {
        if (p.client_id === clientId && p.first_release_status === 'Pending') {
          p.writer_id = newWriterId
          p.writers = { name: newWriter.name }
        }
      })

      // Update client's writer reference
      client.writer_id = newWriterId
      client.writers = { name: newWriter.name }

      // Create new assignment record
      const newAssignment = {
        id: uuid(),
        client_id: clientId,
        writer_id: newWriterId,
        writer_name: newWriter.name,
        assigned_at: new Date().toISOString(),
        unassigned_at: null,
        reason: null,
        amount_received: 0,
        assigned_by: user?.id,
        unassigned_by: null,
      }
      db.writerAssignments.push(newAssignment)

      db.auditLogs.unshift({
        id: uuid(), action: 'reassign_writer', entity: 'client', entity_id: clientId,
        description: `Reassigned writer for ${client.name}: ${current?.writer_name || 'N/A'} → ${newWriter.name}. Reason: ${reason}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })

      return newAssignment
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['writerAssignments', clientId] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}
