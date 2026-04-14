import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockDB, uuid } from '../lib/mockData'
import useAppStore from '../store/useAppStore'

export function useInstallments(filters = {}) {
  return useQuery({
    queryKey: ['installments', filters],
    queryFn: () => {
      const db = getMockDB()
      let results = [...db.installments]
      if (filters.status) results = results.filter((i) => i.status === filters.status)
      return results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    },
  })
}

function recalcPayrollTriggers(db, clientId) {
  const client = db.clients.find((c) => c.id === clientId)
  if (!client) return
  const totalCollected = db.installments
    .filter((i) => i.client_id === clientId)
    .reduce((s, i) => s + Number(i.amount_paid), 0)

  db.payroll.forEach((p) => {
    if (p.client_id !== clientId) return
    if (client.type === 'Regular') {
      p.trigger_met = totalCollected >= client.total_amount
    } else if (p.period === 1) {
      p.trigger_met = totalCollected >= client.total_amount * 0.50
    } else {
      p.trigger_met = totalCollected >= client.total_amount
    }
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, amount_paid, date_paid }) => {
      const db = getMockDB()
      const inst = db.installments.find((i) => i.id === id)
      if (!inst) throw new Error('Installment not found')

      const newPaid = Number(inst.amount_paid) + Number(amount_paid)
      inst.amount_paid = newPaid
      inst.date_paid = date_paid || new Date().toISOString().split('T')[0]
      inst.status = newPaid >= Number(inst.amount_due) ? 'Paid' : 'Pending'
      inst.recorded_by = user?.id
      inst.updated_at = new Date().toISOString()

      // Recalculate payroll triggers (mimics DB trigger T5)
      recalcPayrollTriggers(db, inst.client_id)

      db.auditLogs.unshift({
        id: uuid(), action: 'record_payment', entity: 'installment', entity_id: id,
        description: `Recorded payment of ₱${Number(amount_paid).toLocaleString()} for give #${inst.give_number}`,
        old_value: null, new_value: null, performed_by: user?.id,
        created_at: new Date().toISOString(),
        user_profiles: { full_name: user?.full_name || 'System' },
      })
      return inst
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardKPIs'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}
