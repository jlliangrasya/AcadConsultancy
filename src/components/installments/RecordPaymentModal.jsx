import { useState, useMemo } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { formatCurrency } from '../../utils/formatters'
import { computeGiveBreakdown } from '../../hooks/useInstallments'

export default function RecordPaymentModal({ installment, open, onClose, onSubmit, loading }) {
  const [amount, setAmount] = useState('')
  const [datePaid, setDatePaid] = useState(new Date().toISOString().split('T')[0])
  const [giveNumber, setGiveNumber] = useState('auto')
  const [notes, setNotes] = useState('')

  const breakdown = useMemo(() => computeGiveBreakdown(installment), [installment])

  if (!installment) return null

  const remaining = Number(installment.total_amount) - Number(installment.total_paid)
  const perGive = Number(installment.total_amount) / Number(installment.gives)

  // Suggested next give (auto)
  const nextUnpaidGive = breakdown.find((b) => b.status !== 'Fully Paid')

  const targetGive = giveNumber === 'auto' ? nextUnpaidGive?.give : Number(giveNumber)
  const targetGiveInfo = breakdown.find((b) => b.give === targetGive)
  const suggestedAmount = targetGiveInfo ? targetGiveInfo.remaining : perGive

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Number(amount) <= 0) return
    onSubmit({
      installmentId: installment.id,
      amount: Number(amount),
      datePaid,
      giveNumber: giveNumber === 'auto' ? null : Number(giveNumber),
      notes,
    })
    setAmount('')
    setNotes('')
  }

  const giveOptions = [
    { value: 'auto', label: `Auto (next unpaid — Give ${nextUnpaidGive?.give || 1})` },
    ...breakdown.filter((b) => b.status !== 'Fully Paid').map((b) => ({
      value: b.give,
      label: `Give ${b.give} — ${b.status} (${formatCurrency(b.paid)} of ${formatCurrency(b.due)})`,
    })),
  ]

  return (
    <Modal open={open} onClose={onClose} title="Record Payment" size="md">
      <div className="mb-4 space-y-2 text-sm">
        <p><span className="text-gray-500">Client:</span> <strong>{installment.clients?.name}</strong></p>
        <p><span className="text-gray-500">Plan:</span> {installment.clients?.type} — {installment.gives} give{installment.gives > 1 ? 's' : ''}</p>
        <div className="border-t border-gray-100 pt-2 mt-2">
          <p><span className="text-gray-500">Total contract:</span> {formatCurrency(installment.total_amount)}</p>
          <p><span className="text-gray-500">Already paid:</span> {formatCurrency(installment.total_paid)}</p>
          <p><span className="text-gray-500">Remaining:</span> <strong className="text-red-600">{formatCurrency(remaining)}</strong></p>
        </div>
      </div>

      {/* Give breakdown table */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Per-give Breakdown</p>
        <div className="space-y-1">
          {breakdown.map((b) => (
            <div key={b.give} className="flex items-center justify-between text-xs">
              <span className="font-medium">Give {b.give}</span>
              <span className="text-gray-500">{formatCurrency(b.paid)} / {formatCurrency(b.due)}</span>
              <Badge>{b.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Apply to Give"
          value={giveNumber}
          onChange={(e) => setGiveNumber(e.target.value)}
          options={giveOptions}
        />

        {targetGiveInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
            Give {targetGiveInfo.give} needs <strong>{formatCurrency(targetGiveInfo.remaining)}</strong> more to be fully paid.
            You can record a partial or full amount.
          </div>
        )}

        <Input
          label="Amount (₱) — partial payments allowed"
          type="number"
          min="0.01"
          max={remaining}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={suggestedAmount.toFixed(2)}
          required
        />
        <Input
          label="Date Paid"
          type="date"
          value={datePaid}
          onChange={(e) => setDatePaid(e.target.value)}
          required
        />
        <Input
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Partial payment, balance promised by Friday"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Record Payment</Button>
        </div>
      </form>
    </Modal>
  )
}
