import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useCommunicationLogs, useAddCommunicationLog } from '../../hooks/useCommunicationLogs'
import { useToast } from '../ui/Toast'
import Button from '../ui/Button'
import { formatDateTime } from '../../utils/formatters'

export default function CommunicationLog({ clientId }) {
  const { data: logs } = useCommunicationLogs(clientId)
  const addLog = useAddCommunicationLog()
  const toast = useToast()
  const [message, setMessage] = useState('')

  const handleAdd = async () => {
    if (!message.trim()) return
    try {
      await addLog.mutateAsync({ clientId, message: message.trim() })
      setMessage('')
      toast.success('Note added')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
        <MessageSquare size={12} />
        Communication Log
      </h4>

      <div className="flex gap-2 mb-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Log a call, message, or commitment... (e.g. Called client, they said they'll pay Friday)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <Button onClick={handleAdd} loading={addLog.isPending} disabled={!message.trim()}>
          <Send size={14} />
        </Button>
      </div>

      {(!logs || logs.length === 0) ? (
        <p className="text-xs text-gray-400 italic">No communication logged yet.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-800">{log.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {log.logged_by_name} — {formatDateTime(log.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
