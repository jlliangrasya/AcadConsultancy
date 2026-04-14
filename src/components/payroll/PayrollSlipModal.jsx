import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { generatePayrollSlipPDF } from './PayrollSlipPDF'

export default function PayrollSlipModal({ row, open, onClose }) {
  if (!row) return null

  const handleDownload = () => {
    generatePayrollSlipPDF(row)
  }

  return (
    <Modal open={open} onClose={onClose} title="Payroll Slip" size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Client</span>
            <strong>{row.clients?.name}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Project</span>
            <span>{row.clients?.project_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Writer</span>
            <span>{row.writers?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Period</span>
            <span>Period {row.period}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between">
            <span className="text-gray-500">Gross Amount</span>
            <span>{formatCurrency(row.gross_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Penalty</span>
            <span className={Number(row.penalty_pct) > 0 ? 'text-red-600' : ''}>
              {formatPercent(row.penalty_pct)}
              {row.penalty_reason && ` — ${row.penalty_reason}`}
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-gray-500">Net Receivable</span>
            <span>{formatCurrency(row.net_receivable)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between">
            <span className="text-gray-500">First Release (90%)</span>
            <span>{formatCurrency(row.first_release)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Retained (10%)</span>
            <span>{formatCurrency(row.retained_amount)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={handleDownload}>Download PDF</Button>
        </div>
      </div>
    </Modal>
  )
}
