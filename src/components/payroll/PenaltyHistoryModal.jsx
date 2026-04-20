import Modal from '../ui/Modal'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { usePenaltyHistory } from '../../hooks/usePayroll'
import { formatDateTime, formatPercent } from '../../utils/formatters'

export default function PenaltyHistoryModal({ payrollRow, open, onClose }) {
  const { data: history } = usePenaltyHistory(payrollRow?.id)

  if (!payrollRow) return null

  return (
    <Modal open={open} onClose={onClose} title={`Penalty History — ${payrollRow.clients?.name}`} size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <p><span className="text-gray-500">Project:</span> <strong>{payrollRow.clients?.project_name}</strong></p>
          <p><span className="text-gray-500">Period:</span> {payrollRow.period}</p>
          <p><span className="text-gray-500">Current Penalty:</span> <strong>{formatPercent(payrollRow.penalty_pct)}</strong></p>
          {payrollRow.penalty_reason && (
            <p><span className="text-gray-500">Current Reason:</span> {payrollRow.penalty_reason}</p>
          )}
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Changed At</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Reason</Th>
              <Th>Changed By</Th>
            </tr>
          </Thead>
          <Tbody>
            {(!history || history.length === 0) ? (
              <EmptyRow colSpan={5} message="No penalty changes recorded" />
            ) : (
              history.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <Td className="text-xs">{formatDateTime(h.changed_at)}</Td>
                  <Td>{formatPercent(h.old_pct)}</Td>
                  <Td className="font-semibold">{formatPercent(h.new_pct)}</Td>
                  <Td className="text-xs">{h.reason || '—'}</Td>
                  <Td className="text-xs">{h.changed_by_name || '—'}</Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>
    </Modal>
  )
}
