import { useQuery } from '@tanstack/react-query'
import { getMockDB } from '../../lib/mockData'
import { formatDateTime } from '../../utils/formatters'

export default function ActivityLog() {
  const { data: logs } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => {
      const db = getMockDB()
      return [...db.auditLogs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20)
    },
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
      {(!logs || logs.length === 0) ? (
        <p className="text-sm text-gray-400">No activity yet</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <div className="flex-1">
                <p className="text-gray-800">{log.description || log.action}</p>
                <p className="text-xs text-gray-400">
                  {log.user_profiles?.full_name || 'System'} — {formatDateTime(log.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
