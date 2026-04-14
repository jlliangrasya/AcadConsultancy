import { useAgentEarnings } from '../../hooks/useSalesAgents'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import { formatCurrency } from '../../utils/formatters'

export default function AgentSalesModal({ agent, open, onClose }) {
  const { data: cuts, isLoading } = useAgentEarnings(agent?.id)

  const totalEarned = cuts?.filter((c) => c.paid).reduce((sum, c) => sum + Number(c.cut_amount), 0) || 0
  const totalPending = cuts?.filter((c) => !c.paid && c.cut_amount > 0).reduce((sum, c) => sum + Number(c.cut_amount), 0) || 0

  return (
    <Modal open={open} onClose={onClose} title={`Sales — ${agent?.name}`} size="lg">
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total Clients</p>
              <p className="text-lg font-bold text-gray-900">{cuts?.length || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total Earned</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(totalEarned)}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
            </div>
          </div>

          <Table>
            <Thead>
              <tr>
                <Th>Client</Th>
                <Th>Project</Th>
                <Th>Cut Amount</Th>
                <Th>Notes</Th>
                <Th>Paid</Th>
              </tr>
            </Thead>
            <Tbody>
              {(!cuts || cuts.length === 0) ? (
                <EmptyRow colSpan={5} message="No clients assigned" />
              ) : (
                cuts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <Td className="font-medium">{c.clients?.name}</Td>
                    <Td>{c.clients?.project_name}</Td>
                    <Td>{formatCurrency(c.cut_amount)}</Td>
                    <Td className="max-w-[200px] truncate">{c.cut_notes || '—'}</Td>
                    <Td><Badge>{c.paid ? 'Paid' : 'Pending'}</Badge></Td>
                  </tr>
                ))
              )}
            </Tbody>
          </Table>
        </>
      )}
    </Modal>
  )
}
