import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { computeGiveBreakdown } from '../../hooks/useInstallments'

export default function PaymentHistoryModal({ installment, open, onClose }) {
  if (!installment) return null

  const remaining = Number(installment.total_amount) - Number(installment.total_paid)
  const pctPaid = Number(installment.total_amount) > 0
    ? ((Number(installment.total_paid) / Number(installment.total_amount)) * 100).toFixed(1)
    : 0

  const breakdown = computeGiveBreakdown(installment)
  const sortedPayments = [...(installment.payments || [])].sort(
    (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
  )

  return (
    <Modal open={open} onClose={onClose} title={`Payment History — ${installment.clients?.name}`} size="lg">
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-bold">{formatCurrency(installment.total_amount)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-sm font-bold text-green-700">{formatCurrency(installment.total_paid)}</p>
          </div>
          <div className={`rounded-lg p-3 text-center ${remaining > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-xs text-gray-500">Remaining</p>
            <p className={`text-sm font-bold ${remaining > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{pctPaid}% collected</span>
            <span>{installment.current_give} of {installment.gives} gives fully paid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${Number(pctPaid) >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(pctPaid, 100)}%` }}
            />
          </div>
        </div>

        {/* Per-give breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Per-Give Status</h4>
          <div className="grid grid-cols-2 gap-2">
            {breakdown.map((b) => (
              <div key={b.give} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Give {b.give}</span>
                  <Badge>{b.status}</Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {formatCurrency(b.paid)} / {formatCurrency(b.due)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${b.status === 'Fully Paid' ? 'bg-green-500' : b.status === 'Partial' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                    style={{ width: `${Math.min((b.paid / b.due) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment records */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Records</h4>
          <Table>
            <Thead>
              <tr>
                <Th>Give</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th>Notes</Th>
                <Th>Recorded By</Th>
              </tr>
            </Thead>
            <Tbody>
              {sortedPayments.length === 0 ? (
                <EmptyRow colSpan={5} message="No payments recorded yet" />
              ) : (
                sortedPayments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-gray-50">
                    <Td>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {pmt.give_number}
                      </span>
                    </Td>
                    <Td className="font-medium">{formatCurrency(pmt.amount)}</Td>
                    <Td>{formatDate(pmt.date_paid)}</Td>
                    <Td className="text-xs text-gray-500 italic max-w-50 truncate" title={pmt.notes}>{pmt.notes || '—'}</Td>
                    <Td className="text-xs">{pmt.recorded_by_name || '—'}</Td>
                  </tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>
      </div>
    </Modal>
  )
}
