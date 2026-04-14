import { useState } from 'react'
import { Check, X } from 'lucide-react'

export default function AgentCutInput({ currentAmount, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentAmount || 0)

  const handleSave = () => {
    onSave(Number(value))
    setEditing(false)
  }

  if (!editing) {
    return (
      <span
        className="cursor-pointer text-blue-600 hover:underline"
        onClick={() => { setValue(currentAmount || 0); setEditing(true) }}
      >
        ₱{Number(currentAmount || 0).toLocaleString()}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        min="0"
        autoFocus
      />
      <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
        <Check size={14} />
      </button>
      <button onClick={() => setEditing(false)} className="p-1 text-red-600 hover:bg-red-50 rounded">
        <X size={14} />
      </button>
    </div>
  )
}
