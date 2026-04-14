import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function usePayroll(filters = {}) {
  return useQuery({
    queryKey: ['payroll', filters],
    queryFn: () => {
      const db = getMockDB()
      let results = [...db.payroll]
      if (filters.trigger_met !== undefined) results = results.filter((p) => p.trigger_met === filters.trigger_met)
      if (filters.first_release_status) results = results.filter((p) => p.first_release_status === filters.first_release_status)
      return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
  })
}

function recalcPayrollAmounts(row) {
  const net = row.gross_amount - (row.gross_amount * row.penalty_pct / 100)
  row.net_receivable = net
  row.first_release = net * 0.90
  row.retained_amount = net * 0.10
}

export function useSetPenalty() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, penalty_pct, penalty_reason }) => {
      const db = getMockDB()
      const row = db.payroll.find((p) => p.id === id)
      if (!row) throw new Error('Payroll entry not found')
      row.penalty_pct = penalty_pct
      row.penalty_reason = penalty_reason
      row.penalty_set_by = user?.id
      row.penalty_set_at = new Date().toISOString()
      recalcPayrollAmounts(row)
      db.auditLogs.unshift({
        id: uuid(), action: 'set_penalty', entity: 'payroll', entity_id: id,
        description: `Set penalty ${penalty_pct}% — ${penalty_reason || 'no reason'}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return row
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useApprovePayroll() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (id) => {
      const db = getMockDB()
      const row = db.payroll.find((p) => p.id === id)
      if (!row) throw new Error('Payroll entry not found')
      row.admin_approved = true
      row.approved_by = user?.id
      row.approved_at = new Date().toISOString()
      db.auditLogs.unshift({
        id: uuid(), action: 'approve_payroll', entity: 'payroll', entity_id: id,
        description: 'Owner approved payroll for release',
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return row
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['eligiblePayroll'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useReleaseFirstPayment() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (id) => {
      const db = getMockDB()
      const row = db.payroll.find((p) => p.id === id)
      if (!row) throw new Error('Payroll entry not found')
      row.first_release_status = 'Released'
      row.first_released_at = new Date().toISOString()
      row.first_released_by = user?.id
      db.auditLogs.unshift({
        id: uuid(), action: 'release_first_payment', entity: 'payroll', entity_id: id,
        description: 'First release payment issued',
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return row
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useMarkFeedbackRevision() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, field, value }) => {
      const db = getMockDB()
      const row = db.payroll.find((p) => p.id === id)
      if (!row) throw new Error('Payroll entry not found')
      row[field] = value
      db.auditLogs.unshift({
        id: uuid(), action: `mark_${field}`, entity: 'payroll', entity_id: id,
        description: `Marked ${field} = ${value}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return row
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}

export function useReleaseRetention() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async (id) => {
      const db = getMockDB()
      const row = db.payroll.find((p) => p.id === id)
      if (!row) throw new Error('Payroll entry not found')
      row.retention_status = 'Released'
      row.retention_released_at = new Date().toISOString()
      row.retention_released_by = user?.id
      db.auditLogs.unshift({
        id: uuid(), action: 'release_retention', entity: 'payroll', entity_id: id,
        description: 'Retention released after feedback + revision confirmed',
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return row
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}
