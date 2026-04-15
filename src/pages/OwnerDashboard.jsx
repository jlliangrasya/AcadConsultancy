import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import OwnerAnalytics from '../components/dashboard/OwnerAnalytics'

export default function OwnerDashboard() {
  return (
    <div>
      <PageHeader
        title="Owner Analytics"
        description="Revenue, P&L, writer and agent performance"
      />

      <PageGuide
        id="owner-analytics"
        title="Understanding Owner Analytics"
        steps={[
          'Top cards show total revenue (all contracts), total collected (actual payments received), total payouts (writers + agents), and net profit.',
          'Writer Performance shows how many projects each writer handles and how much they\'ve been paid.',
          'Sales Agent Performance shows each agent\'s client referrals and total commission earned.',
          'The P&L Summary breaks down collected revenue minus writer payouts, agent commissions, and expenses.',
        ]}
      />

      <OwnerAnalytics />
    </div>
  )
}
