import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import PayrollTable from '../components/payroll/PayrollTable'
import PayrollSlipModal from '../components/payroll/PayrollSlipModal'
import {
  usePayroll,
  useSetPenalty,
  useApprovePayroll,
  useReleaseFirstPayment,
  useMarkFeedbackRevision,
  useReleaseRetention,
} from '../hooks/usePayroll'
import { useToast } from '../components/ui/Toast'

export default function Payroll() {
  const toast = useToast()
  const { data: payroll, isLoading } = usePayroll()
  const setPenalty = useSetPenalty()
  const approvePayroll = useApprovePayroll()
  const releaseFirst = useReleaseFirstPayment()
  const markFR = useMarkFeedbackRevision()
  const releaseRetention = useReleaseRetention()
  const [viewingSlip, setViewingSlip] = useState(null)

  const handleSetPenalty = async (id, pct, reason) => {
    try {
      await setPenalty.mutateAsync({ id, penalty_pct: pct, penalty_reason: reason })
      toast.success('Penalty updated')
    } catch (err) { toast.error(err.message) }
  }

  const handleApprove = async (id) => {
    try {
      await approvePayroll.mutateAsync(id)
      toast.success('Payroll approved')
    } catch (err) { toast.error(err.message) }
  }

  const handleReleaseFirst = async (id) => {
    try {
      await releaseFirst.mutateAsync(id)
      toast.success('First payment released')
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleFeedback = async (id, value) => {
    try {
      await markFR.mutateAsync({ id, field: 'feedback_submitted', value })
      toast.success(`Feedback ${value ? 'submitted' : 'unmarked'}`)
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleRevision = async (id, value) => {
    try {
      await markFR.mutateAsync({ id, field: 'revision_done', value })
      toast.success(`Revision ${value ? 'done' : 'unmarked'}`)
    } catch (err) { toast.error(err.message) }
  }

  const handleReleaseRetention = async (id) => {
    try {
      await releaseRetention.mutateAsync(id)
      toast.success('Retention released')
    } catch (err) { toast.error(err.message) }
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading payroll...</div>
  }

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Manage writer payroll — penalties, approvals, releases, and retention"
      />

      <PayrollTable
        payroll={payroll}
        onSetPenalty={handleSetPenalty}
        onApprove={handleApprove}
        onReleaseFirst={handleReleaseFirst}
        onToggleFeedback={handleToggleFeedback}
        onToggleRevision={handleToggleRevision}
        onReleaseRetention={handleReleaseRetention}
        onViewSlip={setViewingSlip}
      />

      <PayrollSlipModal
        row={viewingSlip}
        open={!!viewingSlip}
        onClose={() => setViewingSlip(null)}
      />
    </div>
  )
}
