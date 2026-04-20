import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Select from '../ui/Select'
import Input from '../ui/Input'
import Badge from '../ui/Badge'
import { useWriterAssignments, useReassignWriter } from '../../hooks/useWriterReassignment'
import { useActiveWriters } from '../../hooks/useWriters'
import { useToast } from '../ui/Toast'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function WriterReassignModal({ client, open, onClose }) {
  const toast = useToast()
  const { data: assignments } = useWriterAssignments(client?.id)
  const { data: writers } = useActiveWriters()
  const reassign = useReassignWriter()

  const [newWriterId, setNewWriterId] = useState('')
  const [reason, setReason] = useState('')

  const availableWriters = (writers || []).filter((w) => w.id !== client?.writer_id)

  const handleSubmit = async () => {
    if (!newWriterId || !reason.trim()) {
      toast.warning('Please select a new writer and provide a reason')
      return
    }
    try {
      await reassign.mutateAsync({ clientId: client.id, newWriterId, reason: reason.trim() })
      toast.success('Writer reassigned. Unreleased payroll moved to new writer.')
      setNewWriterId('')
      setReason('')
      onClose()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reassign Writer" size="lg">
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p><strong>Important:</strong> The old writer keeps any already-released payments. Only unreleased payroll (first-release or retention still Pending) will be transferred to the new writer.</p>
        </div>

        {/* Assignment history */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Assignment History</h4>
          {(!assignments || assignments.length === 0) ? (
            <p className="text-xs text-gray-400 italic">No assignment history</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{a.writer_name}</span>
                      {a.unassigned_at === null && <Badge color="green" className="ml-2">Current</Badge>}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(a.assigned_at)}
                      {a.unassigned_at && ` → ${formatDateTime(a.unassigned_at)}`}
                    </span>
                  </div>
                  {a.reason && <p className="text-xs text-gray-600 mt-1">Reason: {a.reason}</p>}
                  {a.unassigned_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Received: {formatCurrency(a.amount_received)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reassign form */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Assign to New Writer</h4>
          <div className="space-y-3">
            <Select
              label="New Writer *"
              value={newWriterId}
              onChange={(e) => setNewWriterId(e.target.value)}
              placeholder="Select writer"
              options={availableWriters.map((w) => ({ value: w.id, label: w.name }))}
            />
            <Input
              label="Reason for reassignment *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Previous writer unavailable, quality issues, client request"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={handleSubmit} loading={reassign.isPending}>
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
