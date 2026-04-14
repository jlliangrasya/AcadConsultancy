import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatters'

export default function RecordPaymentModal({ installment, open, onClose, onSubmit, loading }) {
  const [amount, setAmount] = useState('')
  const [datePaid, setDatePaid] = useState(new Date().toISOString().split('T')[0])

  if (!installment) return null

  const remaining = Number(installment.total_amount) - Number(installment.total_paid)
  const nextGive = installment.current_give + 1
  const suggestedAmount = installment.total_amount / installment.gives

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Number(amount) <= 0) return
    onSubmit({
      installmentId: installment.id,
      amount: Number(amount),
      datePaid,
    })
    setAmount('')
  }

  return (
    <Modal open={open} onClose={onClose} title={`Record Payment — Give ${nextGive}`} size="sm">
      <div className="mb-4 space-y-2 text-sm">
        <p><span className="text-gray-500">Client:</span> <strong>{installment.clients?.name}</strong></p>
        <p><span className="text-gray-500">Project:</span> {installment.clients?.project_name}</p>
        <p><span className="text-gray-500">Plan:</span> {installment.clients?.type} — {installment.gives} give{installment.gives > 1 ? 's' : ''}</p>
        <div className="border-t border-gray-100 pt-2 mt-2">
          <p><span className="text-gray-500">Total contract:</span> {formatCurrency(installment.total_amount)}</p>
          <p><span className="text-gray-500">Already paid:</span> {formatCurrency(installment.total_paid)} ({installment.current_give} of {installment.gives} gives)</p>
          <p><span className="text-gray-500">Remaining:</span> <strong className="text-red-600">{formatCurrency(remaining)}</strong></p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-700">
          This will be recorded as <strong>Give {nextGive}</strong> of {installment.gives}
          {suggestedAmount > 0 && (
            <span> (suggested: {formatCurrency(suggestedAmount)} per give)</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount (₱)"
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
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Record Give {nextGive}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
