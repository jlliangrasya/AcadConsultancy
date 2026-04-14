import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import Badge from '../ui/Badge'
import { Pencil, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'

export default function AgentTable({ agents, onEdit, onToggleStatus, onViewSales }) {
  const role = useAppStore((s) => s.role)

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Contact</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </tr>
      </Thead>
      <Tbody>
        {(!agents || agents.length === 0) ? (
          <EmptyRow colSpan={5} message="No sales agents found" />
        ) : (
          agents.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <Td className="font-medium text-gray-900">{a.name}</Td>
              <Td>{a.email || '—'}</Td>
              <Td>{a.contact || '—'}</Td>
              <Td><Badge>{a.status}</Badge></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewSales(a)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View clients & earnings"
                  >
                    <Eye size={16} />
                  </button>
                  {canDo(role, 'manage_agents') && (
                    <>
                      <button
                        onClick={() => onEdit(a)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onToggleStatus(a)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        title={a.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {a.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </Td>
            </tr>
          ))
        )}
      </Tbody>
    </Table>
  )
}
