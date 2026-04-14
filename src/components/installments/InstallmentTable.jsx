import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatters'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'

export default function InstallmentTable({ installments, onRecordPayment, onViewHistory }) {
  const role = useAppStore((s) => s.role)

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Client</Th>
          <Th>Project</Th>
          <Th>Type</Th>
          <Th>Total Amount</Th>
          <Th>Gives</Th>
          <Th>Paid</Th>
          <Th>Remaining</Th>
          <Th>Progress</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </tr>
      </Thead>
      <Tbody>
        {(!installments || installments.length === 0) ? (
          <EmptyRow colSpan={10} message="No installments found" />
        ) : (
          installments.map((inst) => {
            const remaining = Number(inst.total_amount) - Number(inst.total_paid)
            const pctPaid = Number(inst.total_amount) > 0
              ? ((Number(inst.total_paid) / Number(inst.total_amount)) * 100).toFixed(0)
              : 0
            const giveLabel = `${inst.current_give} of ${inst.gives}`

            return (
              <tr
                key={inst.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewHistory(inst)}
              >
                <Td className="font-medium text-gray-900">{inst.clients?.name}</Td>
                <Td>{inst.clients?.project_name}</Td>
                <Td><Badge>{inst.clients?.type}</Badge></Td>
                <Td>{formatCurrency(inst.total_amount)}</Td>
                <Td>
                  <span className="text-sm">{giveLabel}</span>
                </Td>
                <Td>
                  <span className="font-medium">{formatCurrency(inst.total_paid)}</span>
                </Td>
                <Td>
                  <span className={remaining > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {formatCurrency(remaining)}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-2 min-w-30">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          Number(pctPaid) >= 100 ? 'bg-green-500' : Number(pctPaid) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(pctPaid, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{pctPaid}%</span>
                  </div>
                </Td>
                <Td><Badge>{inst.status}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {canDo(role, 'record_payment') && inst.status !== 'Fully Paid' && (
                      <Button size="sm" onClick={() => onRecordPayment(inst)}>
                        Record Give {inst.current_give + 1}
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            )
          })
        )}
      </Tbody>
    </Table>
  )
}
