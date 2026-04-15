import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import KPICards from '../components/dashboard/KPICards'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import ActivityLog from '../components/dashboard/ActivityLog'

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of operations and key metrics" />

      <PageGuide
        id="dashboard"
        title="How to use the Dashboard"
        steps={[
          'The top cards show real-time KPIs — active clients, total collected, pending payments, and payroll status.',
          'Alerts highlight items that need attention: payroll waiting for approval, unreleased papers, pending agent commissions.',
          'The activity feed shows the latest actions taken across the system by all users.',
          'Use the sidebar to navigate to specific modules like Clients, Installments, or Payroll.',
        ]}
      />

      <div className="space-y-6">
        <KPICards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsPanel />
          <ActivityLog />
        </div>
      </div>
    </div>
  )
}
