import { useState, useEffect } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import { useClientAgentCut, useUpdateAgentCut } from '../../hooks/useSalesAgents'
import { useToast } from '../ui/Toast'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'
import { formatCurrency } from '../../utils/formatters'
import Badge from '../ui/Badge'

export default function AgentCutCell({ clientId }) {
  const role = useAppStore((s) => s.role)
  const { data: cut } = useClientAgentCut(clientId)
  const updateCut = useUpdateAgentCut()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (cut) {
      setAmount(cut.cut_amount || 0)
      setNotes(cut.cut_notes || '')
    }
  }, [cut])

  if (!cut) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sales Agent Commission</h4>
        <p className="text-xs text-gray-400 italic">No sales agent assigned to this client.</p>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      await updateCut.mutateAsync({ clientId, cutAmount: amount, cutNotes: notes })
      toast.success('Agent cut updated')
      setEditing(false)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Sales Agent Commission</h4>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="text-xs text-gray-400 block">Agent</span>
          <span className="text-sm text-gray-800">{cut.sales_agents?.name || '—'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">Status</span>
          <Badge>{cut.paid ? 'Paid' : 'Pending'}</Badge>
        </div>
      </div>

      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs text-gray-400 block">Commission Amount</span>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(cut.cut_amount || 0)}</span>
            {cut.cut_notes && <p className="text-xs text-gray-500 mt-1">{cut.cut_notes}</p>}
          </div>
          {canDo(role, 'set_agent_cut') && !cut.paid && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Edit commission"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Commission Amount (₱)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Special rate for PhD client"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setEditing(false); setAmount(cut.cut_amount || 0); setNotes(cut.cut_notes || '') }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={14} className="inline" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateCut.isPending}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={14} className="inline" /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
