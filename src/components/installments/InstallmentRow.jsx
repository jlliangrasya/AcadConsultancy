import { Td } from '../ui/Table'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'

export default function InstallmentRow({ installment, onRecordPayment }) {
  const role = useAppStore((s) => s.role)
  const remaining = Number(installment.amount_due) - Number(installment.amount_paid)
  const pctPaid = Number(installment.amount_due) > 0
    ? ((Number(installment.amount_paid) / Number(installment.amount_due)) * 100).toFixed(0)
    : 0

  return (
    <tr className="hover:bg-gray-50">
      <Td className="font-medium text-gray-900">{installment.clients?.name}</Td>
      <Td>{installment.clients?.project_name}</Td>
      <Td><Badge>{installment.clients?.type}</Badge></Td>
      <Td>Give {installment.give_number}</Td>
      <Td>{formatCurrency(installment.amount_due)}</Td>
      <Td>
        <div>
          {formatCurrency(installment.amount_paid)}
          <span className="text-xs text-gray-400 ml-1">({pctPaid}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className={`h-1.5 rounded-full ${
              Number(pctPaid) >= 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(pctPaid, 100)}%` }}
          />
        </div>
      </Td>
      <Td>{formatCurrency(remaining)}</Td>
      <Td>{formatDate(installment.date_paid)}</Td>
      <Td><Badge>{installment.status}</Badge></Td>
      <Td>
        {canDo(role, 'record_payment') && installment.status !== 'Paid' && (
          <Button size="sm" onClick={() => onRecordPayment(installment)}>
            Record
          </Button>
        )}
      </Td>
    </tr>
  )
}
