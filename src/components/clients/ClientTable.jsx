import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../ui/Table'
import Badge from '../ui/Badge'
import PaperReleaseCell from './PaperReleaseCell'
import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'

export default function ClientTable({ clients, onEdit, onDelete, page, pageSize, totalCount }) {
  const role = useAppStore((s) => s.role)

  return (
    <>
      <Table>
        <Thead>
          <tr>
            <Th>Client</Th>
            <Th>Project</Th>
            <Th>Type</Th>
            <Th>Amount</Th>
            <Th>Gives</Th>
            <Th>Writer</Th>
            <Th>Agent</Th>
            <Th>Paper</Th>
            <Th>Status</Th>
            <Th>Due</Th>
            <Th>Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {(!clients || clients.length === 0) ? (
            <EmptyRow colSpan={11} message="No clients found. Add your first client to get started." />
          ) : (
            clients.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <Td className="font-medium text-gray-900">
                  <div>
                    {c.name}
                    {c.is_carry_over && (
                      <span className="ml-1 text-xs text-purple-600">(CO)</span>
                    )}
                  </div>
                  {c.school && (
                    <div className="text-xs text-gray-400">{c.school}</div>
                  )}
                </Td>
                <Td>
                  <div className="max-w-[180px] truncate" title={c.project_name}>
                    {c.project_name}
                  </div>
                  {c.subject && (
                    <div className="text-xs text-gray-400">{c.subject}</div>
                  )}
                </Td>
                <Td><Badge>{c.type}</Badge></Td>
                <Td>{formatCurrency(c.total_amount)}</Td>
                <Td>{c.gives}</Td>
                <Td>{c.writers?.name || '—'}</Td>
                <Td>{c.sales_agents?.name || '—'}</Td>
                <Td>
                  <PaperReleaseCell clientId={c.id} releases={c.paper_releases} />
                </Td>
                <Td><Badge>{c.status}</Badge></Td>
                <Td>{formatDate(c.due_date)}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {canDo(role, 'edit_client') && (
                      <button
                        onClick={() => onEdit(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {canDo(role, 'delete_client') && (
                      <button
                        onClick={() => onDelete(c)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Archive"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))
          )}
        </Tbody>
      </Table>
      {totalCount > 0 && (
        <div className="mt-3 text-sm text-gray-500 text-right">
          Showing {clients?.length || 0} of {totalCount} clients
        </div>
      )}
    </>
  )
}
