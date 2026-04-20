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

// Recompute current_give based on cumulative total_paid vs per-give amount
function recomputeCurrentGive(inst) {
  const perGive = Number(inst.total_amount) / Number(inst.gives)
  // current_give = number of completed gives (fully paid gives)
  const completed = Math.floor((inst.total_paid + 0.001) / perGive)
  inst.current_give = Math.min(completed, inst.gives)
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  const user = useAppStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ installmentId, amount, datePaid, giveNumber, notes }) => {
      const db = getMockDB()
      const inst = db.installments.find((i) => i.id === installmentId)
      if (!inst) throw new Error('Installment not found')

      const remaining = Number(inst.total_amount) - Number(inst.total_paid)
      if (Number(amount) > remaining + 0.001) {
        throw new Error(`Amount exceeds remaining balance of ₱${remaining.toLocaleString()}`)
      }
      if (Number(amount) <= 0) {
        throw new Error('Amount must be greater than 0')
      }

      // Determine which give this payment applies to
      // If caller specifies giveNumber, use it; else, use the next give that isn't fully paid
      const perGive = Number(inst.total_amount) / Number(inst.gives)
      let targetGive = giveNumber
      if (!targetGive) {
        // Find the first give that isn't fully paid
        const paidByGive = {}
        inst.payments.forEach((p) => {
          paidByGive[p.give_number] = (paidByGive[p.give_number] || 0) + Number(p.amount)
        })
        for (let g = 1; g <= inst.gives; g++) {
          if ((paidByGive[g] || 0) < perGive - 0.001) {
            targetGive = g
            break
          }
        }
        if (!targetGive) targetGive = inst.gives
      }

      // Add payment record
      const payment = {
        id: uuid(),
        installment_id: installmentId,
        give_number: Number(targetGive),
        amount: Number(amount),
        date_paid: datePaid || new Date().toISOString().split('T')[0],
        notes: notes || '',
        recorded_by: user?.id,
        recorded_by_name: user?.full_name || 'System',
        recorded_at: new Date().toISOString(),
      }
      inst.payments.push(payment)

      // Update totals
      inst.total_paid = Number(inst.total_paid) + Number(amount)
      recomputeCurrentGive(inst)
      inst.status = inst.total_paid >= inst.total_amount - 0.001 ? 'Fully Paid' : (inst.total_paid > 0 ? 'Partial' : 'Pending')
      inst.updated_at = new Date().toISOString()

      // Recalculate payroll triggers
      recalcPayrollTriggers(db, inst.client_id)

      db.auditLogs.unshift({
        id: uuid(), action: 'record_payment', entity: 'installment', entity_id: installmentId,
        description: `Recorded payment of ₱${Number(amount).toLocaleString()} toward Give ${targetGive} for ${inst.clients?.name}`,
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

// Helper: compute per-give paid amounts
export function computeGiveBreakdown(inst) {
  if (!inst) return []
  const perGive = Number(inst.total_amount) / Number(inst.gives)
  const paidByGive = {}
  inst.payments.forEach((p) => {
    paidByGive[p.give_number] = (paidByGive[p.give_number] || 0) + Number(p.amount)
  })
  const result = []
  for (let g = 1; g <= inst.gives; g++) {
    const paid = paidByGive[g] || 0
    result.push({
      give: g,
      due: perGive,
      paid,
      remaining: Math.max(perGive - paid, 0),
      status: paid >= perGive - 0.001 ? 'Fully Paid' : paid > 0 ? 'Partial' : 'Pending',
    })
  }
  return result
}
