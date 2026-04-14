import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Select from '../components/ui/Select'
import InstallmentTable from '../components/installments/InstallmentTable'
import RecordPaymentModal from '../components/installments/RecordPaymentModal'
import { useInstallments, useRecordPayment } from '../hooks/useInstallments'
import { useToast } from '../components/ui/Toast'

export default function Installments() {
  const toast = useToast()
  const [statusFilter, setStatusFilter] = useState('')
  const { data: installments, isLoading } = useInstallments({ status: statusFilter || undefined })
  const recordPayment = useRecordPayment()
  const [recording, setRecording] = useState(null)

  const handleRecordPayment = async (payload) => {
    try {
      await recordPayment.mutateAsync(payload)
      toast.success('Payment recorded successfully')
      setRecording(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading installments...</div>
  }

  return (
    <div>
      <PageHeader title="Installments" description="Track client payments and record new installments">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All statuses"
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'Paid', label: 'Paid' },
            { value: 'Overdue', label: 'Overdue' },
          ]}
        />
      </PageHeader>

      <InstallmentTable
        installments={installments}
        onRecordPayment={setRecording}
      />

      <RecordPaymentModal
        installment={recording}
        open={!!recording}
        onClose={() => setRecording(null)}
        onSubmit={handleRecordPayment}
        loading={recordPayment.isPending}
      />
    </div>
  )
}
