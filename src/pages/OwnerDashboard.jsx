import { useState } from 'react'
import { FileDown } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import Button from '../components/ui/Button'
import OwnerAnalytics from '../components/dashboard/OwnerAnalytics'
import PLExportModal from '../components/dashboard/PLExportModal'

export default function OwnerDashboard() {
  const [plOpen, setPlOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Owner Analytics"
        description="Revenue, P&L, writer and agent performance"
      >
        <Button onClick={() => setPlOpen(true)}>
          <FileDown size={16} /> Export P&L
        </Button>
      </PageHeader>

      <PageGuide
        id="owner-analytics"
        title="Understanding Owner Analytics"
        steps={[
          'Top cards show total revenue (all contracts), total collected (actual payments received), total payouts (writers + agents), and net profit.',
          'Writer Performance shows how many projects each writer handles and how much they\'ve been paid.',
          'Sales Agent Performance shows each agent\'s client referrals and total commission earned.',
          'The P&L Summary breaks down collected revenue minus writer payouts, agent commissions, and expenses.',
          'Click "Export P&L" to download a formatted PDF for any date range (e.g., monthly, quarterly).',
        ]}
      />

      <OwnerAnalytics />

      <PLExportModal open={plOpen} onClose={() => setPlOpen(false)} />
    </div>
  )
}
