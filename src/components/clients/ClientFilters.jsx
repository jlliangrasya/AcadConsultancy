import Input from '../ui/Input'
import Select from '../ui/Select'
import { CLIENT_TYPES, CLIENT_STATUSES, LEVELS } from '../../utils/constants'
import { useActiveWriters } from '../../hooks/useWriters'
import { useActiveSalesAgents } from '../../hooks/useSalesAgents'

export default function ClientFilters({ filters, onChange }) {
  const { data: writers } = useActiveWriters()
  const { data: agents } = useActiveSalesAgents()

  const update = (field, value) => {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Input
          placeholder="Search clients..."
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
        />
        <Select
          value={filters.type || ''}
          onChange={(e) => update('type', e.target.value)}
          placeholder="All types"
          options={CLIENT_TYPES.map((t) => ({ value: t, label: t }))}
        />
        <Select
          value={filters.status || ''}
          onChange={(e) => update('status', e.target.value)}
          placeholder="All statuses"
          options={CLIENT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          value={filters.level || ''}
          onChange={(e) => update('level', e.target.value)}
          placeholder="All levels"
          options={LEVELS.map((l) => ({ value: l, label: l }))}
        />
        <Select
          value={filters.writer_id || ''}
          onChange={(e) => update('writer_id', e.target.value)}
          placeholder="All writers"
          options={(writers || []).map((w) => ({ value: w.id, label: w.name }))}
        />
        <Select
          value={filters.sales_agent_id || ''}
          onChange={(e) => update('sales_agent_id', e.target.value)}
          placeholder="All agents"
          options={(agents || []).map((a) => ({ value: a.id, label: a.name }))}
        />
      </div>
    </div>
  )
}
