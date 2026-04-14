import { useQuery } from '@tanstack/react-query'
import { getMockDB } from '../../lib/mockData'
import StatCard from '../ui/StatCard'
import { formatCurrency } from '../../utils/formatters'
import { Users, CreditCard, FileText, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'

export default function KPICards() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardKPIs'],
    queryFn: () => {
      const db = getMockDB()
      const totalClients = db.clients.length
      const activeClients = db.clients.filter((c) => c.status === 'Active').length
      const totalCollected = db.installments.reduce((s, i) => s + Number(i.amount_paid), 0)
      const totalDue = db.installments.reduce((s, i) => s + Number(i.amount_due), 0)
      const pendingPayments = db.installments.filter((i) => i.status === 'Pending').length
      const payrollPendingApproval = db.payroll.filter((p) => p.trigger_met && !p.admin_approved).length
      const payrollReleased = db.payroll.filter((p) => p.first_release_status === 'Released').length
      const totalReleased = db.payroll
        .filter((p) => p.first_release_status === 'Released')
        .reduce((s, p) => s + Number(p.first_release), 0)

      return { totalClients, activeClients, totalCollected, totalDue, pendingPayments, payrollPendingApproval, payrollReleased, totalReleased }
    },
  })

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard label="Active Clients" value={stats.activeClients} subtitle={`${stats.totalClients} total`} icon={Users} color="blue" />
      <StatCard label="Total Collected" value={formatCurrency(stats.totalCollected)} subtitle={`of ${formatCurrency(stats.totalDue)} due`} icon={CreditCard} color="green" />
      <StatCard label="Pending Payments" value={stats.pendingPayments} icon={AlertTriangle} color="yellow" />
      <StatCard label="Payroll Pending Approval" value={stats.payrollPendingApproval} icon={FileText} color="orange" />
      <StatCard label="Payroll Released" value={stats.payrollReleased} icon={CheckCircle} color="green" />
      <StatCard label="Total Released" value={formatCurrency(stats.totalReleased)} icon={DollarSign} color="purple" />
    </div>
  )
}
