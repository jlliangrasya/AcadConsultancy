import PageHeader from '../components/layout/PageHeader'
import KPICards from '../components/dashboard/KPICards'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import ActivityLog from '../components/dashboard/ActivityLog'

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of operations and key metrics" />

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
