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
      if (filters.search) {
        const s = filters.search.toLowerCase()
        results = results.filter((i) =>
          i.clients?.name.toLowerCase().includes(s) || i.clients?.project_name.toLowerCase().includes(s)
        )
      }
      return results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    },
  })
}

function recalcPayrollTriggers(db, clientId) {
  const client = db.clients.find((c) => c.id === clientId)
  if (!client) return
  const inst = db.installments.find((i) => i.client_id === clientId)
  const totalCollected = inst ? inst.total_paid : 0

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
    mutationFn: async ({ installmentId, amount, datePaid }) => {
      const db = getMockDB()
      const inst = db.installments.find((i) => i.id === installmentId)
      if (!inst) throw new Error('Installment not found')

      if (inst.total_paid >= inst.total_amount) {
        throw new Error('This client is already fully paid')
      }

      const nextGive = inst.current_give + 1
      if (nextGive > inst.gives) {
        throw new Error('All gives have been recorded')
      }

      // Add payment record
      const payment = {
        id: uuid(),
        installment_id: installmentId,
        give_number: nextGive,
        amount: Number(amount),
        date_paid: datePaid || new Date().toISOString().split('T')[0],
        recorded_by: user?.id,
        recorded_at: new Date().toISOString(),
      }
      inst.payments.push(payment)

      // Update totals
      inst.total_paid = Number(inst.total_paid) + Number(amount)
      inst.current_give = nextGive
      inst.status = inst.total_paid >= inst.total_amount ? 'Fully Paid' : 'Partial'
      inst.updated_at = new Date().toISOString()

      // Recalculate payroll triggers
      recalcPayrollTriggers(db, inst.client_id)

      db.auditLogs.unshift({
        id: uuid(), action: 'record_payment', entity: 'installment', entity_id: installmentId,
        description: `Recorded Give ${nextGive} payment of ₱${Number(amount).toLocaleString()} for ${inst.clients?.name}`,
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
      queryClient.invalidateQueries({ queryKey: ['dashboardAlerts'] })
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] })
    },
  })
}
