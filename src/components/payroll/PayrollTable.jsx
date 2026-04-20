import { Table, Thead, Tbody, Th, EmptyRow } from '../ui/Table'
import PayrollRow from './PayrollRow'

export default function PayrollTable({
  payroll,
  onSetPenalty,
  onApprove,
  onReleaseFirst,
  onToggleFeedback,
  onToggleRevision,
  onReleaseRetention,
  onViewSlip,
  onViewPenaltyHistory,
}) {
  return (
    <Table>
      <Thead>
        <tr>
          <Th>Client</Th>
          <Th>Project</Th>
          <Th>Writer</Th>
          <Th>Type</Th>
          <Th>Period</Th>
          <Th>Gross</Th>
          <Th>Penalty</Th>
          <Th>Net</Th>
          <Th>1st Release</Th>
          <Th>Retained</Th>
          <Th>Trigger</Th>
          <Th>Approved</Th>
          <Th>1st Status</Th>
          <Th>FB/Rev</Th>
          <Th>Retention</Th>
          <Th>Slip</Th>
        </tr>
      </Thead>
      <Tbody>
        {(!payroll || payroll.length === 0) ? (
          <EmptyRow colSpan={16} message="No payroll entries found" />
        ) : (
          payroll.map((row) => (
            <PayrollRow
              key={row.id}
              row={row}
              onSetPenalty={onSetPenalty}
              onApprove={onApprove}
              onReleaseFirst={onReleaseFirst}
              onToggleFeedback={onToggleFeedback}
              onToggleRevision={onToggleRevision}
              onReleaseRetention={onReleaseRetention}
              onViewSlip={onViewSlip}
              onViewPenaltyHistory={onViewPenaltyHistory}
            />
          ))
        )}
      </Tbody>
    </Table>
  )
}
