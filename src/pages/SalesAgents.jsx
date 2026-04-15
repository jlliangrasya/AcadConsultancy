import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import AgentTable from '../components/sales-agents/AgentTable'
import AgentForm from '../components/sales-agents/AgentForm'
import AgentSalesModal from '../components/sales-agents/AgentSalesModal'
import { useSalesAgents, useCreateSalesAgent, useUpdateSalesAgent } from '../hooks/useSalesAgents'
import { useToast } from '../components/ui/Toast'
import { canDo } from '../utils/roleGuards'
import useAppStore from '../store/useAppStore'

export default function SalesAgents() {
  const role = useAppStore((s) => s.role)
  const { data: agents, isLoading } = useSalesAgents()
  const createAgent = useCreateSalesAgent()
  const updateAgent = useUpdateSalesAgent()
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewingSales, setViewingSales] = useState(null)

  const handleAdd = async (form) => {
    try {
      await createAgent.mutateAsync(form)
      toast.success('Sales agent added successfully')
      setShowForm(false)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEdit = async (form) => {
    try {
      await updateAgent.mutateAsync({ id: editing.id, ...form })
      toast.success('Sales agent updated successfully')
      setEditing(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleStatus = async (agent) => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    try {
      await updateAgent.mutateAsync({ id: agent.id, status: newStatus })
      toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading sales agents...</div>
  }

  return (
    <div>
      <PageHeader title="Sales Agents" description="Manage sales agents and their commissions">
        {canDo(role, 'manage_agents') && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Agent
          </Button>
        )}
      </PageHeader>

      <PageGuide
        id="sales-agents"
        title="How Sales Agents work"
        steps={[
          'Sales agents are people who refer clients. They earn a flat peso commission per client, set manually by the FM.',
          'Click the eye icon to see an agent\'s full client list, total earned, and pending commissions.',
          'Agent commissions are included in the FM Payout Report alongside writer payments. They get paid when the Owner approves the report.',
          'The commission amount is NOT auto-computed — FM enters a custom amount per client.',
        ]}
      />

      <AgentTable
        agents={agents}
        onEdit={setEditing}
        onToggleStatus={handleToggleStatus}
        onViewSales={setViewingSales}
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Sales Agent">
        <AgentForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          loading={createAgent.isPending}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Sales Agent">
        <AgentForm
          agent={editing}
          onSubmit={handleEdit}
          onCancel={() => setEditing(null)}
          loading={updateAgent.isPending}
        />
      </Modal>

      <AgentSalesModal
        agent={viewingSales}
        open={!!viewingSales}
        onClose={() => setViewingSales(null)}
      />
    </div>
  )
}
