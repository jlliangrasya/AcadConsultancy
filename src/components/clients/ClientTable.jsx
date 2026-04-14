import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { Pencil, Trash2, Eye, Copy, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'

function ClientCard({ client, onEdit, onDelete, onView }) {
  const role = useAppStore((s) => s.role)
  const isPackage = client.type === 'Package'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
            <Badge>{client.type}</Badge>
            <Badge>{client.status}</Badge>
            {client.is_carry_over && <Badge color="purple">CO</Badge>}
          </div>
          <p className="text-sm text-gray-500 truncate mt-0.5">{client.project_name}</p>
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button onClick={() => onView(client)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View details">
            <Eye size={16} />
          </button>
          {canDo(role, 'edit_client') && (
            <button onClick={() => onEdit(client)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
              <Pencil size={16} />
            </button>
          )}
          {canDo(role, 'delete_client') && (
            <button onClick={() => onDelete(client)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Archive">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-gray-400 block">Amount</span>
          <span className="font-semibold text-gray-800">{formatCurrency(client.total_amount)}</span>
        </div>
        <div>
          <span className="text-gray-400 block">Gives</span>
          <span className="text-gray-700">{client.gives}</span>
        </div>
        <div>
          <span className="text-gray-400 block">Writer</span>
          <span className="text-gray-700">{client.writers?.name || '—'}</span>
        </div>
        <div>
          <span className="text-gray-400 block">Deadline</span>
          <span className="text-gray-700">{client.latest_deadline || formatDate(client.due_date) || '—'}</span>
        </div>
      </div>

      {/* Level & Program */}
      {(client.level || client.program) && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3 text-xs">
          {client.level && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{client.level}</span>}
          {client.program && <span className="text-gray-500 truncate">{client.program}</span>}
          {client.school && <span className="text-gray-400">({client.school})</span>}
          {client.referred_by && <span className="text-orange-600">Referred by: {client.referred_by}</span>}
        </div>
      )}

      {/* Package inclusions preview or Service availed */}
      {isPackage && client.package_inclusions?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {client.package_inclusions.slice(0, 4).map((inc) => (
              <span key={inc} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{inc}</span>
            ))}
            {client.package_inclusions.length > 4 && (
              <span className="text-xs text-gray-400">+{client.package_inclusions.length - 4} more</span>
            )}
          </div>
        </div>
      )}
      {!isPackage && client.service_availed && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          Service: <span className="text-gray-700">{client.service_availed}</span>
        </div>
      )}
    </div>
  )
}

export default function ClientTable({ clients, onEdit, onDelete, onView, totalCount }) {
  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <p className="text-gray-400">No clients found. Add your first client to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clients.map((c) => (
          <ClientCard key={c.id} client={c} onEdit={onEdit} onDelete={onDelete} onView={onView} />
        ))}
      </div>
      {totalCount > 0 && (
        <div className="mt-3 text-sm text-gray-500 text-right">
          Showing {clients.length} of {totalCount} clients
        </div>
      )}
    </>
  )
}
