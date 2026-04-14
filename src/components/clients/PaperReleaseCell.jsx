import { CheckCircle, Circle } from 'lucide-react'
import { useReleasePaper } from '../../hooks/useClients'
import { useToast } from '../ui/Toast'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'

export default function PaperReleaseCell({ clientId, releases }) {
  const role = useAppStore((s) => s.role)
  const releasePaper = useReleasePaper()
  const toast = useToast()

  if (!releases || releases.length === 0) return <span className="text-gray-400">—</span>

  const sorted = [...releases].sort((a, b) => a.period - b.period)

  const handleRelease = async (period) => {
    if (!canDo(role, 'release_payroll')) return
    try {
      await releasePaper.mutateAsync({ clientId, period })
      toast.success(`Paper period ${period} released`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {sorted.map((pr) => (
        <button
          key={pr.period}
          onClick={() => !pr.released && handleRelease(pr.period)}
          disabled={pr.released || !canDo(role, 'release_payroll')}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            pr.released
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
          title={pr.released ? `P${pr.period} released` : `Release P${pr.period}`}
        >
          {pr.released ? <CheckCircle size={12} /> : <Circle size={12} />}
          P{pr.period}
        </button>
      ))}
    </div>
  )
}
