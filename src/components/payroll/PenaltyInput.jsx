import { useState } from 'react'
import { Check, X, Pencil } from 'lucide-react'
import { formatPercent } from '../../utils/formatters'

export default function PenaltyInput({ currentPct, currentReason, onSave }) {
  const [editing, setEditing] = useState(false)
  const [pct, setPct] = useState(currentPct || 0)
  const [reason, setReason] = useState(currentReason || '')

  const handleSave = () => {
    onSave(Number(pct), reason)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1">
        <span className={Number(currentPct) > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
          {formatPercent(currentPct)}
        </span>
        <button
          onClick={() => { setPct(currentPct || 0); setReason(currentReason || ''); setEditing(true) }}
          className="p-1 text-gray-400 hover:text-blue-600 rounded"
        >
          <Pencil size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={pct}
          onChange={(e) => setPct(e.target.value)}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          min="0"
          max="100"
          step="0.1"
          autoFocus
        />
        <span className="text-xs text-gray-400">%</span>
        <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
          <Check size={14} />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 text-red-600 hover:bg-red-50 rounded">
          <X size={14} />
        </button>
      </div>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        placeholder="Reason..."
      />
    </div>
  )
}
