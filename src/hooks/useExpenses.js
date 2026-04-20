import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export const EXPENSE_CATEGORIES = [
  'Software / Tools',
  'Subscriptions',
  'Office Supplies',
  'Utilities',
  'Marketing',
  'Transportation',
  'Food & Meals',
  'Training',
  'Other',
]

export function useExpenses(filters = {}) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => {
      const db = getMockDB()
      let results = [...db.expenses]
      if (filters.category) results = results.filter((e) => e.category === filters.category)
      if (filters.from) results = results.filter((e) => e.date >= filters.from)
      if (filters.to) results = results.filter((e) => e.date <= filters.to)
      return results.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (expense) => {
      const db = getMockDB()
      const newExpense = {
        id: uuid(),
        ...expense,
        amount: Number(expense.amount),
        recorded_by: user?.id,
        recorded_by_name: user?.full_name || 'System',
        created_at: new Date().toISOString(),
      }
      db.expenses.push(newExpense)
      db.auditLogs.unshift({
        id: uuid(), action: 'create', entity: 'expense', entity_id: newExpense.id,
        description: `Recorded expense: ${expense.category} — ₱${Number(expense.amount).toLocaleString()}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return newExpense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['ownerAnalytics'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (id) => {
      const db = getMockDB()
      const idx = db.expenses.findIndex((e) => e.id === id)
      if (idx !== -1) {
        const [removed] = db.expenses.splice(idx, 1)
        db.auditLogs.unshift({
          id: uuid(), action: 'delete', entity: 'expense', entity_id: id,
          description: `Deleted expense: ${removed.category} — ₱${Number(removed.amount).toLocaleString()}`,
          old_value: null, new_value: null, performed_by: user?.id,
          created_at: new Date().toISOString(),
          user_profiles: { full_name: user?.full_name || 'System' },
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['ownerAnalytics'] })
    },
  })
}
