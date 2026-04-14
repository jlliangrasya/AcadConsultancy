import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import FMReportBuilder from '../components/fm-report/FMReportBuilder'
import FMReportHistory from '../components/fm-report/FMReportHistory'
import OwnerApprovalPanel from '../components/fm-report/OwnerApprovalPanel'
import Modal from '../components/ui/Modal'
import { Table, Thead, Tbody, Th, Td } from '../components/ui/Table'
import { formatCurrency } from '../utils/formatters'
import { useFMReportEntries } from '../hooks/useFMReports'
import { generateFMReportPDF } from '../components/fm-report/FMReportPDF'
import Button from '../components/ui/Button'
import { canDo } from '../utils/roleGuards'
import useAppStore from '../store/useAppStore'
import { ROLES } from '../utils/constants'

function ReportDetailModal({ report, open, onClose }) {
  const { data: entries } = useFMReportEntries(report?.id)

  if (!report) return null

  return (
    <Modal open={open} onClose={onClose} title={`Report #${report.run_number}`} size="xl">
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500">Payout Date</p><p className="font-medium">{report.payout_date}</p></div>
          <div><p className="text-gray-500">Total Release</p><p className="font-bold">{formatCurrency(report.total_release)}</p></div>
          <div><p className="text-gray-500">Retention Held</p><p className="font-medium">{formatCurrency(report.total_retention_held)}</p></div>
          <div><p className="text-gray-500">Status</p><p><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            report.status === 'released' ? 'bg-green-100 text-green-800' :
            report.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>{report.status}</span></p></div>
        </div>

        {entries && entries.length > 0 && (
          <Table>
            <Thead>
              <tr>
                <Th>Writer</Th>
                <Th>Client</Th>
                <Th>Project</Th>
                <Th>Period</Th>
                <Th>Gross</Th>
                <Th>Penalty</Th>
                <Th>1st Release</Th>
              </tr>
            </Thead>
            <Tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <Td>{e.writers?.name}</Td>
                  <Td>{e.client_name}</Td>
                  <Td>{e.project_name}</Td>
                  <Td>P{e.period}</Td>
                  <Td>{formatCurrency(e.gross_amount)}</Td>
                  <Td>{e.penalty_pct}%</Td>
                  <Td>{formatCurrency(e.first_release)}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        )}

        <div className="flex justify-end">
          <Button onClick={() => generateFMReportPDF(report, entries || [])}>
            Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function FMReport() {
  const role = useAppStore((s) => s.role)
  const [viewingReport, setViewingReport] = useState(null)
  const [tab, setTab] = useState(role === ROLES.OWNER ? 'approval' : 'builder')

  return (
    <div>
      <PageHeader title="FM Payout Report" description="Create, review, and approve payout reports" />

      <div className="flex gap-2 mb-6">
        {canDo(role, 'create_fm_report') && (
          <button
            onClick={() => setTab('builder')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'builder' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Create Report
          </button>
        )}
        {canDo(role, 'approve_fm_report') && (
          <button
            onClick={() => setTab('approval')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'approval' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pending Approval
          </button>
        )}
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          History
        </button>
      </div>

      {tab === 'builder' && canDo(role, 'create_fm_report') && <FMReportBuilder />}
      {tab === 'approval' && canDo(role, 'approve_fm_report') && <OwnerApprovalPanel />}
      {tab === 'history' && <FMReportHistory onViewReport={setViewingReport} />}

      <ReportDetailModal
        report={viewingReport}
        open={!!viewingReport}
        onClose={() => setViewingReport(null)}
      />
    </div>
  )
}
