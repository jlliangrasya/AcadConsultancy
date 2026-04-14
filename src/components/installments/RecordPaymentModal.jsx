import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatters'

export default function RecordPaymentModal({ installment, open, onClose, onSubmit, loading }) {
  const [amount, setAmount] = useState('')
  const [datePaid, setDatePaid] = useState(new Date().toISOString().split('T')[0])

  if (!installment) return null

  const remaining = Number(installment.amount_due) - Number(installment.amount_paid)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Number(amount) <= 0) return
    onSubmit({
      id: installment.id,
      amount_paid: Number(amount),
      date_paid: datePaid,
    })
    setAmount('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Record Payment" size="sm">
      <div className="mb-4 space-y-1 text-sm">
        <p><span className="text-gray-500">Client:</span> <strong>{installment.clients?.name}</strong></p>
        <p><span className="text-gray-500">Give #{installment.give_number}:</span> {formatCurrency(installment.amount_due)}</p>
        <p><span className="text-gray-500">Already paid:</span> {formatCurrency(installment.amount_paid)}</p>
        <p><span className="text-gray-500">Remaining:</span> <strong className="text-red-600">{formatCurrency(remaining)}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount to record (₱)"
          type="number"
          min="0.01"
          max={remaining}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  )
}
