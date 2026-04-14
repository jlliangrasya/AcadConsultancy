import { useState } from 'react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { usePendingReport, useFMReportEntries, useActionFMReport } from '../../hooks/useFMReports'
import { useToast } from '../ui/Toast'
import { generateFMReportPDF } from './FMReportPDF'

export default function OwnerApprovalPanel() {
  const toast = useToast()
  const { data: pending, isLoading } = usePendingReport()
  const { data: entries } = useFMReportEntries(pending?.id)
  const actionReport = useActionFMReport()
  const [ownerNote, setOwnerNote] = useState('')

  if (isLoading) return <div className="text-gray-500">Loading...</div>
  if (!pending) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
        No pending reports to review.
      </div>
    )
  }

  const handleAction = async (action) => {
    try {
      await actionReport.mutateAsync({ reportId: pending.id, action, ownerNote })
      toast.success(`Report ${action === 'approve' ? 'approved and released' : 'returned to FM'}`)
      setOwnerNote('')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Pending Report — Run #{pending.run_number}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Payout Date</p>
            <p className="font-medium">{formatDate(pending.payout_date)}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Release</p>
            <p className="font-bold text-lg">{formatCurrency(pending.total_release)}</p>
          </div>
          <div>
            <p className="text-gray-500">Retention Held</p>
            <p className="font-medium">{formatCurrency(pending.total_retention_held)}</p>
          </div>
          <div>
            <p className="text-gray-500">Writers / Projects</p>
            <p className="font-medium">{pending.writer_count} / {pending.project_count}</p>
          </div>
        </div>
        {pending.fm_notes && (
          <div className="mt-3">
            <p className="text-gray-500 text-sm">FM Notes:</p>
            <p className="text-sm">{pending.fm_notes}</p>
          </div>
        )}
      </div>

      {entries && entries.length > 0 && (
        <Table>
          <Thead>
            <tr>
              <Th>Writer</Th>
              <Th>Client</Th>
              <Th>Project</Th>
              <Th>Type</Th>
              <Th>Period</Th>
              <Th>Gross</Th>
              <Th>Penalty</Th>
              <Th>Net</Th>
              <Th>1st Release</Th>
              <Th>Retained</Th>
            </tr>
          </Thead>
          <Tbody>
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <Td className="font-medium">{e.writers?.name}</Td>
                <Td>{e.client_name}</Td>
                <Td>{e.project_name}</Td>
                <Td><Badge>{e.client_type}</Badge></Td>
                <Td>P{e.period}</Td>
                <Td>{formatCurrency(e.gross_amount)}</Td>
                <Td className={Number(e.penalty_pct) > 0 ? 'text-red-600' : ''}>{e.penalty_pct}%</Td>
                <Td>{formatCurrency(e.net_receivable)}</Td>
                <Td>{formatCurrency(e.first_release)}</Td>
                <Td>{formatCurrency(e.retained_amount)}</Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      )}

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Note</label>
          <textarea
            value={ownerNote}
            onChange={(e) => setOwnerNote(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={2}
            placeholder="Optional note..."
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => pending && generateFMReportPDF(pending, entries || [])}
          >
            Download PDF
          </Button>
          <Button
            variant="danger"
            onClick={() => handleAction('reject')}
            loading={actionReport.isPending}
          >
            Return to FM
          </Button>
          <Button
            variant="success"
            onClick={() => handleAction('approve')}
            loading={actionReport.isPending}
          >
            Approve & Release
          </Button>
        </div>
      </div>
    </div>
  )
}
