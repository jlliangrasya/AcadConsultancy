import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function useWriters() {
  return useQuery({
    queryKey: ['writers'],
    queryFn: () => {
      const db = getMockDB()
      return [...db.writers].sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export function useActiveWriters() {
  return useQuery({
    queryKey: ['writers', 'active'],
    queryFn: () => {
      const db = getMockDB()
      return db.writers.filter((w) => w.status === 'active').sort((a, b) => a.name.localeCompare(b.name))
    },
  })
}

export function useCreateWriter() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (writer) => {
      const db = getMockDB()
      const newWriter = { id: uuid(), ...writer, status: 'active', created_at: new Date().toISOString() }
      db.writers.push(newWriter)
      db.auditLogs.unshift({
        id: uuid(), action: 'create', entity: 'writer', entity_id: newWriter.id,
        description: `Added writer: ${newWriter.name}`,
        old_value: null, new_value: newWriter, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return newWriter
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['writers'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useUpdateWriter() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const db = getMockDB()
      const idx = db.writers.findIndex((w) => w.id === id)
      if (idx === -1) throw new Error('Writer not found')
      db.writers[idx] = { ...db.writers[idx], ...updates }
      db.auditLogs.unshift({
        id: uuid(), action: 'update', entity: 'writer', entity_id: id,
        description: `Updated writer: ${db.writers[idx].name}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return db.writers[idx]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['writers'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}
