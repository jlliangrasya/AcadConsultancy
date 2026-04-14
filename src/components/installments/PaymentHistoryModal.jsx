import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function PaymentHistoryModal({ installment, open, onClose }) {
  if (!installment) return null

  const remaining = Number(installment.total_amount) - Number(installment.total_paid)
  const pctPaid = Number(installment.total_amount) > 0
    ? ((Number(installment.total_paid) / Number(installment.total_amount)) * 100).toFixed(1)
    : 0

  return (
    <Modal open={open} onClose={onClose} title={`Payment History — ${installment.clients?.name}`} size="md">
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Project</p>
            <p className="text-sm font-medium">{installment.clients?.project_name}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Plan</p>
            <p className="text-sm font-medium">{installment.clients?.type} — {installment.gives} give{installment.gives > 1 ? 's' : ''}</p>
          </div>
        </div>

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
            <span>{installment.current_give} of {installment.gives} gives recorded</span>
            <span>{pctPaid}% collected</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                Number(pctPaid) >= 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(pctPaid, 100)}%` }}
            />
          </div>
        </div>

        {/* Payment records table */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Records</h4>
          <Table>
            <Thead>
              <tr>
                <Th>Give #</Th>
                <Th>Amount</Th>
                <Th>Date Paid</Th>
              </tr>
            </Thead>
            <Tbody>
              {(!installment.payments || installment.payments.length === 0) ? (
                <EmptyRow colSpan={3} message="No payments recorded yet" />
              ) : (
                installment.payments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-gray-50">
                    <Td>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {pmt.give_number}
                      </span>
                    </Td>
                    <Td className="font-medium">{formatCurrency(pmt.amount)}</Td>
                    <Td>{formatDate(pmt.date_paid)}</Td>
                  </tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>

        {/* Upcoming gives */}
        {installment.current_give < installment.gives && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
            {installment.gives - installment.current_give} give{installment.gives - installment.current_give > 1 ? 's' : ''} remaining
            — next is Give {installment.current_give + 1}
          </div>
        )}
      </div>
    </Modal>
  )
}
