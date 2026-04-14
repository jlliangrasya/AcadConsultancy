import { Table, Thead, Tbody, Th, EmptyRow } from '../ui/Table'
import InstallmentRow from './InstallmentRow'

export default function InstallmentTable({ installments, onRecordPayment }) {
  return (
    <Table>
      <Thead>
        <tr>
          <Th>Client</Th>
          <Th>Project</Th>
          <Th>Type</Th>
          <Th>Give</Th>
          <Th>Due</Th>
          <Th>Paid</Th>
          <Th>Remaining</Th>
          <Th>Date Paid</Th>
          <Th>Status</Th>
          <Th>Action</Th>
        </tr>
      </Thead>
      <Tbody>
        {(!installments || installments.length === 0) ? (
          <EmptyRow colSpan={10} message="No installments found" />
        ) : (
          installments.map((inst) => (
            <InstallmentRow
              key={inst.id}
              installment={inst}
              onRecordPayment={onRecordPayment}
            />
          ))
        )}
      </Tbody>
    </Table>
  )
}
