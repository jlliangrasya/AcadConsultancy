import { useQuery } from '@tanstack/react-query'
import { getMockDB } from '../../lib/mockData'
import StatCard from '../ui/StatCard'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { formatCurrency } from '../../utils/formatters'
import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react'

export default function OwnerAnalytics() {
  const { data: analytics } = useQuery({
    queryKey: ['ownerAnalytics'],
    queryFn: () => {
      const db = getMockDB()
      const totalRevenue = db.clients.reduce((s, c) => s + Number(c.total_amount), 0)
      const totalCollected = db.installments.reduce((s, i) => s + Number(i.total_paid), 0)
      const totalPayouts = db.payroll.filter((p) => p.first_release_status === 'Released').reduce((s, p) => s + Number(p.first_release), 0)
      const totalAgentPaid = db.salesAgentCuts.filter((c) => c.paid).reduce((s, c) => s + Number(c.cut_amount), 0)
      const totalExpenses = db.expenses.reduce((s, e) => s + Number(e.amount), 0)
      const netProfit = totalCollected - totalPayouts - totalAgentPaid - totalExpenses

      const writerMap = {}
      db.payroll.forEach((p) => {
        const name = p.writers?.name || 'Unknown'
        if (!writerMap[name]) writerMap[name] = { name, projects: 0, totalPaid: 0 }
        writerMap[name].projects++
        if (p.first_release_status === 'Released') writerMap[name].totalPaid += Number(p.first_release)
      })
      const writerPerf = Object.values(writerMap).sort((a, b) => b.projects - a.projects)

      const agentMap = {}
      db.salesAgentCuts.forEach((c) => {
        const name = c.sales_agents?.name || 'Unknown'
        if (!agentMap[name]) agentMap[name] = { name, clients: 0, totalEarned: 0 }
        agentMap[name].clients++
        if (c.paid) agentMap[name].totalEarned += Number(c.cut_amount)
      })
      const agentPerf = Object.values(agentMap).sort((a, b) => b.clients - a.clients)

      return { totalRevenue, totalCollected, totalPayouts, totalAgentPaid, totalExpenses, netProfit, writerPerf, agentPerf }
    },
  })

  if (!analytics) return <div className="text-gray-500">Loading analytics...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(analytics.totalRevenue)} icon={TrendingUp} color="blue" />
        <StatCard label="Total Collected" value={formatCurrency(analytics.totalCollected)} icon={Target} color="green" />
        <StatCard label="Total Payouts" value={formatCurrency(analytics.totalPayouts + analytics.totalAgentPaid)} icon={TrendingDown} color="red" />
        <StatCard label="Net Profit" value={formatCurrency(analytics.netProfit)} icon={BarChart3} color={analytics.netProfit >= 0 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Writer Performance</h3>
          <Table>
            <Thead><tr><Th>Writer</Th><Th>Projects</Th><Th>Total Paid</Th></tr></Thead>
            <Tbody>
              {analytics.writerPerf.length === 0 ? <EmptyRow colSpan={3} /> : analytics.writerPerf.map((w) => (
                <tr key={w.name}><Td className="font-medium">{w.name}</Td><Td>{w.projects}</Td><Td>{formatCurrency(w.totalPaid)}</Td></tr>
              ))}
            </Tbody>
          </Table>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sales Agent Performance</h3>
          <Table>
            <Thead><tr><Th>Agent</Th><Th>Clients</Th><Th>Total Earned</Th></tr></Thead>
            <Tbody>
              {analytics.agentPerf.length === 0 ? <EmptyRow colSpan={3} /> : analytics.agentPerf.map((a) => (
                <tr key={a.name}><Td className="font-medium">{a.name}</Td><Td>{a.clients}</Td><Td>{formatCurrency(a.totalEarned)}</Td></tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">P&L Summary</h3>
        <div className="space-y-2 text-sm max-w-md">
          <div className="flex justify-between"><span className="text-gray-500">Total Collected</span><span className="font-medium">{formatCurrency(analytics.totalCollected)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Writer Payouts</span><span className="text-red-600">-{formatCurrency(analytics.totalPayouts)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Agent Commissions</span><span className="text-red-600">-{formatCurrency(analytics.totalAgentPaid)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Expenses</span><span className="text-red-600">-{formatCurrency(analytics.totalExpenses)}</span></div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-base font-bold">
            <span>Net Profit</span>
            <span className={analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(analytics.netProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
