import { useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { getClientCompletionChecklist, getClientCompletionSummary, useCompleteClient } from '../../hooks/useClients'
import { useToast } from '../ui/Toast'
import { formatCurrency } from '../../utils/formatters'

function CheckItem({ ok, label, detail }) {
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg ${ok ? 'bg-green-50' : 'bg-red-50'}`}>
      {ok ? <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" /> : <XCircle size={18} className="text-red-600 mt-0.5 shrink-0" />}
      <div className="flex-1">
        <p className={`text-sm font-medium ${ok ? 'text-green-800' : 'text-red-800'}`}>{label}</p>
        {detail && <p className="text-xs text-gray-600 mt-0.5">{detail}</p>}
      </div>
    </div>
  )
}

export default function CompleteClientModal({ client, open, onClose }) {
  const toast = useToast()
  const complete = useCompleteClient()
  const [overrideReason, setOverrideReason] = useState('')

  if (!client) return null

  const checklist = getClientCompletionChecklist(client.id)
  const summary = getClientCompletionSummary(client.id)

  const handleComplete = async (override = false) => {
    if (override && !overrideReason.trim()) {
      toast.warning('Override requires a reason')
      return
    }
    try {
      await complete.mutateAsync({ clientId: client.id, override, reason: overrideReason })
      toast.success('Client marked as Completed')
      onClose()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Complete Client — ${client.name}`} size="lg">
      <div className="space-y-5">
        {/* Checklist */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Completion Checklist</h4>
          <div className="space-y-2">
            <CheckItem
              ok={checklist?.allPaid}
              label="All installments fully paid"
              detail={`Collected ${formatCurrency(checklist?.details.totalCollected)} of ${formatCurrency(checklist?.details.totalAmount)}`}
            />
            <CheckItem
              ok={checklist?.allPapersReleased}
              label="All papers released"
              detail={`${checklist?.details.papersPending} paper period${checklist?.details.papersPending !== 1 ? 's' : ''} still pending`}
            />
            <CheckItem
              ok={checklist?.allPayrollReleased}
              label="All writer payroll fully released (first release + retention)"
              detail={`${checklist?.details.payrollPending} payroll entr${checklist?.details.payrollPending !== 1 ? 'ies' : 'y'} incomplete`}
            />
            <CheckItem
              ok={checklist?.allAgentCutsPaid}
              label="All sales agent commissions paid"
              detail={`${checklist?.details.agentCutsPending} agent cut${checklist?.details.agentCutsPending !== 1 ? 's' : ''} still pending`}
            />
          </div>
        </div>

        {/* Completion summary */}
        {summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-blue-700 uppercase mb-3">Project Financials</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Collected:</span>
                <span className="font-semibold text-green-700">{formatCurrency(summary.totalCollected)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid to Writer:</span>
                <span className="font-semibold text-red-700">-{formatCurrency(summary.totalPaidToWriter)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid to Agent:</span>
                <span className="font-semibold text-red-700">-{formatCurrency(summary.totalPaidToAgent)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold text-gray-700">Net Margin:</span>
                <span className={`font-bold ${summary.netMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(summary.netMargin)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action */}
        {checklist?.canComplete ? (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="success" onClick={() => handleComplete(false)} loading={complete.isPending}>
              <CheckCircle2 size={16} /> Mark as Completed
            </Button>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Checklist is not complete</p>
                <p className="text-xs text-yellow-700 mt-1">You can still force-complete this client, but it requires a reason for audit purposes.</p>
              </div>
            </div>
            <Input
              label="Override reason"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Client refused final payment, writing off bad debt"
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="danger" onClick={() => handleComplete(true)} loading={complete.isPending} disabled={!overrideReason.trim()}>
                Force Complete (Override)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
