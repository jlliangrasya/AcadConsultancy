import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import InstallmentTable from '../components/installments/InstallmentTable'
import RecordPaymentModal from '../components/installments/RecordPaymentModal'
import PaymentHistoryModal from '../components/installments/PaymentHistoryModal'
import { useInstallments, useRecordPayment } from '../hooks/useInstallments'
import { useToast } from '../components/ui/Toast'

export default function Installments() {
  const toast = useToast()
  const [filters, setFilters] = useState({ status: '', search: '' })
  const { data: installments, isLoading } = useInstallments(filters)
  const recordPayment = useRecordPayment()
  const [recording, setRecording] = useState(null)
  const [viewingHistory, setViewingHistory] = useState(null)

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
      <PageHeader title="Installments" description="Track client payments — click a row to see payment history">
        <Input
          placeholder="Search clients..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-48"
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          placeholder="All statuses"
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'Partial', label: 'Partial' },
            { value: 'Fully Paid', label: 'Fully Paid' },
          ]}
        />
      </PageHeader>

      <PageGuide
        id="installments"
        title="How Installments work"
        steps={[
          'Each client has one row showing their total amount, how much has been paid, and how many gives have been recorded.',
          'Click "Record Give X" to log a payment. The system auto-assigns the next give number — you just enter the amount and date.',
          'Click any row to open the payment history showing all recorded gives with amounts and dates.',
          'The progress bar shows collection progress. Status changes from Pending → Partial → Fully Paid automatically.',
          'When enough is collected, the writer\'s payroll trigger updates automatically (50% unlocks Period 1 for Package clients, 100% unlocks Regular).',
        ]}
      />

      <InstallmentTable
        installments={installments}
        onRecordPayment={setRecording}
        onViewHistory={setViewingHistory}
      />

      {installments?.length > 0 && (
        <div className="mt-3 text-sm text-gray-500 text-right">
          Showing {installments.length} client{installments.length !== 1 ? 's' : ''}
        </div>
      )}

      <RecordPaymentModal
        installment={recording}
        open={!!recording}
        onClose={() => setRecording(null)}
        onSubmit={handleRecordPayment}
        loading={recordPayment.isPending}
      />

      <PaymentHistoryModal
        installment={viewingHistory}
        open={!!viewingHistory}
        onClose={() => setViewingHistory(null)}
      />
    </div>
  )
}
