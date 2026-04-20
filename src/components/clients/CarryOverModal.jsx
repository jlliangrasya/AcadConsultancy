import { useState, useMemo } from 'react'
import { Calendar, AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Select from '../ui/Select'
import Badge from '../ui/Badge'
import { getMockDB } from '../../lib/mockData'
import { useCarryOverBatch } from '../../hooks/useClients'
import { useToast } from '../ui/Toast'

export default function CarryOverModal({ open, onClose }) {
  const toast = useToast()
  const batchMutation = useCarryOverBatch()

  const currentYear = new Date().getFullYear()
  const [fromYear, setFromYear] = useState(String(currentYear - 1))
  const [toYear, setToYear] = useState(String(currentYear))

  const eligibleClients = useMemo(() => {
    if (!open) return []
    const db = getMockDB()
    return db.clients.filter(
      (c) => c.year_batch === Number(fromYear) && ['Active', 'On Hold', 'Overdue'].includes(c.status)
    )
  }, [fromYear, open])

  const yearOptions = []
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    yearOptions.push({ value: String(y), label: String(y) })
  }

  const handleBatch = async () => {
    if (Number(toYear) <= Number(fromYear)) {
      toast.warning('Target year must be after source year')
      return
    }
    try {
      const result = await batchMutation.mutateAsync({
        fromYear: Number(fromYear),
        toYear: Number(toYear),
      })
      toast.success(`Moved ${result.count} clients from ${result.fromYear} to ${result.toYear}`)
      onClose()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Year-End Carry-Over" size="lg">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
          <Calendar size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Batch Year Transition</p>
            <p className="text-xs mt-1">
              Moves all Active / On Hold / Overdue clients from one year batch to the next,
              marking them as "Carry-over" so you can track them separately from new clients.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="From Year" value={fromYear} onChange={(e) => setFromYear(e.target.value)} options={yearOptions} />
          <Select label="To Year" value={toYear} onChange={(e) => setToYear(e.target.value)} options={yearOptions} />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Eligible Clients ({eligibleClients.length})
          </h4>
          {eligibleClients.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No eligible clients for year {fromYear}</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {eligibleClients.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm bg-white rounded px-3 py-2">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{c.project_name}</span>
                  </div>
                  <Badge>{c.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {eligibleClients.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              This will update <strong>{eligibleClients.length} client{eligibleClients.length !== 1 ? 's' : ''}</strong>.
              All will be marked as "Carry-over" status with year_batch = {toYear}. This is logged in audit.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            onClick={handleBatch}
            loading={batchMutation.isPending}
            disabled={eligibleClients.length === 0}
          >
            Run Carry-Over Batch
          </Button>
        </div>
      </div>
    </Modal>
  )
}
