import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMockDB } from '../lib/mockData'
import PageHeader from '../components/layout/PageHeader'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import { formatDateTime } from '../utils/formatters'

export default function AuditLog() {
  const [filters, setFilters] = useState({ action: '', search: '' })

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => {
      const db = getMockDB()
      let results = [...db.auditLogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      if (filters.action) results = results.filter((l) => l.action === filters.action)
      if (filters.search) {
        const s = filters.search.toLowerCase()
        results = results.filter((l) => l.description?.toLowerCase().includes(s))
      }
      return results.slice(0, 200)
    },
  })

  const actionOptions = [
    'create', 'update', 'archive', 'record_payment', 'set_penalty',
    'approve_payroll', 'release_first_payment', 'release_retention',
    'mark_feedback_submitted', 'mark_revision_done', 'release_paper',
    'submit_fm_report', 'approve_fm_report', 'reject_fm_report',
  ].map((a) => ({ value: a, label: a.replace(/_/g, ' ') }))

  return (
    <div>
      <PageHeader title="Audit Log" description="Complete history of all system actions" />
      <div className="flex gap-3 mb-4">
        <Input placeholder="Search descriptions..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-64" />
        <Select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} placeholder="All actions" options={actionOptions} />
      </div>
      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <Table>
          <Thead>
            <tr><Th>Timestamp</Th><Th>Action</Th><Th>Entity</Th><Th>Description</Th><Th>Performed By</Th></tr>
          </Thead>
          <Tbody>
            {(!logs || logs.length === 0) ? (
              <EmptyRow colSpan={5} message="No audit logs found" />
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <Td className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</Td>
                  <Td><Badge color="blue">{log.action.replace(/_/g, ' ')}</Badge></Td>
                  <Td className="text-xs">{log.entity}</Td>
                  <Td className="max-w-xs truncate">{log.description || '—'}</Td>
                  <Td>{log.user_profiles?.full_name || 'System'}</Td>
                </tr>
              ))
            )}
          </Tbody>
        </Table>
      )}
    </div>
  )
}
