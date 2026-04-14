import PageHeader from '../components/layout/PageHeader'
import OwnerAnalytics from '../components/dashboard/OwnerAnalytics'

export default function OwnerDashboard() {
  return (
    <div>
      <PageHeader
        title="Owner Analytics"
        description="Revenue, P&L, writer and agent performance"
      />
      <OwnerAnalytics />
    </div>
  )
}
