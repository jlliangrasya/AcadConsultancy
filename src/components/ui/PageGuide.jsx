import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, X } from 'lucide-react'

export default function PageGuide({ id, title, steps }) {
  const storageKey = `guide-dismissed-${id}`
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true')
  const [collapsed, setCollapsed] = useState(false)

  if (dismissed) {
    return (
      <button
        onClick={() => { setDismissed(false); localStorage.removeItem(storageKey) }}
        className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 mb-4 transition-colors"
      >
        <HelpCircle size={14} />
        Show guide
      </button>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl mb-5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 text-sm font-semibold text-blue-800">
          <HelpCircle size={16} />
          {title}
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          onClick={() => { setDismissed(true); localStorage.setItem(storageKey, 'true') }}
          className="p-1 rounded text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition-colors"
          title="Dismiss guide"
        >
          <X size={14} />
        </button>
      </div>
      {!collapsed && (
        <div className="px-4 pb-4">
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-blue-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
