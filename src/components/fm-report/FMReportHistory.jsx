import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import Badge from '../ui/Badge'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useFMReports } from '../../hooks/useFMReports'

export default function FMReportHistory({ onViewReport }) {
  const { data: reports, isLoading } = useFMReports()

  if (isLoading) return <div className="text-gray-500">Loading reports...</div>

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Run #</Th>
          <Th>Payout Date</Th>
          <Th>Submitted By</Th>
          <Th>Submitted</Th>
          <Th>Writers</Th>
          <Th>Projects</Th>
          <Th>Total Release</Th>
          <Th>Status</Th>
          <Th>Action</Th>
        </tr>
      </Thead>
      <Tbody>
        {(!reports || reports.length === 0) ? (
          <EmptyRow colSpan={9} message="No payout reports yet" />
        ) : (
          reports.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <Td className="font-medium">#{r.run_number}</Td>
              <Td>{formatDate(r.payout_date)}</Td>
              <Td>{r.user_profiles?.full_name || '—'}</Td>
              <Td>{formatDate(r.submitted_at)}</Td>
              <Td>{r.writer_count}</Td>
              <Td>{r.project_count}</Td>
              <Td className="font-medium">{formatCurrency(r.total_release)}</Td>
              <Td><Badge>{r.status}</Badge></Td>
              <Td>
                <button
                  onClick={() => onViewReport(r)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </button>
              </Td>
            </tr>
          ))
        )}
      </Tbody>
    </Table>
  )
}
