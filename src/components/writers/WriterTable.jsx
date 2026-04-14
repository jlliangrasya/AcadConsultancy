import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { Pencil, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'

export default function WriterTable({ writers, onEdit, onToggleStatus, onViewProjects }) {
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
        {(!writers || writers.length === 0) ? (
          <EmptyRow colSpan={5} message="No writers found" />
        ) : (
          writers.map((w) => (
            <tr key={w.id} className="hover:bg-gray-50">
              <Td className="font-medium text-gray-900">{w.name}</Td>
              <Td>{w.email || '—'}</Td>
              <Td>{w.contact || '—'}</Td>
              <Td><Badge>{w.status}</Badge></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewProjects(w)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View projects"
                  >
                    <Eye size={16} />
                  </button>
                  {canDo(role, 'manage_writers') && (
                    <>
                      <button
                        onClick={() => onEdit(w)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onToggleStatus(w)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        title={w.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {w.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
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
