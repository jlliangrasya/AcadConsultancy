import { useQuery } from '@tanstack/react-query'
import { getMockDB } from '../../lib/mockData'
import { checkAndFlagOverdue } from '../../lib/overdueChecker'
import { AlertTriangle, Clock, FileText, DollarSign, Calendar } from 'lucide-react'

export default function AlertsPanel() {
  const { data: alerts } = useQuery({
    queryKey: ['dashboardAlerts'],
    queryFn: () => {
      checkAndFlagOverdue()
      const db = getMockDB()
      const items = []

      // Overdue clients
      const overdue = db.clients.filter((c) => c.status === 'Overdue')
      if (overdue.length > 0) {
        items.push({ icon: AlertTriangle, color: 'text-red-600 bg-red-50', text: `${overdue.length} client${overdue.length !== 1 ? 's' : ''} overdue (past due date)` })
      }

      // Upcoming follow-ups on leads
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcomingLeadsFollowUp = db.leads.filter((l) => {
        if (!l.follow_up_date) return false
        const fd = new Date(l.follow_up_date)
        fd.setHours(0, 0, 0, 0)
        return fd <= today && (l.status === 'New' || l.status === 'Contacted' || l.status === 'Qualified')
      })
      if (upcomingLeadsFollowUp.length > 0) {
        items.push({ icon: Calendar, color: 'text-blue-600 bg-blue-50', text: `${upcomingLeadsFollowUp.length} lead${upcomingLeadsFollowUp.length !== 1 ? 's' : ''} due for follow-up` })
      }

      const pendingApproval = db.payroll.filter((p) => p.trigger_met && !p.admin_approved)
      if (pendingApproval.length > 0) {
        items.push({ icon: FileText, color: 'text-orange-600 bg-orange-50', text: `${pendingApproval.length} payroll entries pending approval` })
      }

      const pendingReport = db.fmPayoutReports.filter((r) => r.status === 'submitted')
      if (pendingReport.length > 0) {
        items.push({ icon: Clock, color: 'text-yellow-600 bg-yellow-50', text: `FM Report #${pendingReport[0].run_number} awaiting owner approval` })
      }

      const unreleased = db.paperReleases.filter((pr) => {
        const client = db.clients.find((c) => c.id === pr.client_id)
        return !pr.released && client?.status === 'Active'
      })
      if (unreleased.length > 0) {
        items.push({ icon: AlertTriangle, color: 'text-red-600 bg-red-50', text: `${unreleased.length} papers not yet released` })
      }

      const pendingCuts = db.salesAgentCuts.filter((c) => !c.paid && c.cut_amount > 0)
      if (pendingCuts.length > 0) {
        items.push({ icon: DollarSign, color: 'text-purple-600 bg-purple-50', text: `${pendingCuts.length} agent commissions pending payment` })
      }

      return items
    },
  })

  if (!alerts || alerts.length === 0) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Alerts</h3>
      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const Icon = alert.icon
          return (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className={`p-1.5 rounded-lg ${alert.color}`}><Icon size={14} /></div>
              <span className="text-gray-700">{alert.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
