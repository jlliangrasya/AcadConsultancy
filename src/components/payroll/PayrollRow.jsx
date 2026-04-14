import { Td } from '../ui/Table'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import PenaltyInput from './PenaltyInput'
import { formatCurrency } from '../../utils/formatters'
import { canDo } from '../../utils/roleGuards'
import useAppStore from '../../store/useAppStore'
import { CheckSquare, Square } from 'lucide-react'

export default function PayrollRow({
  row,
  onSetPenalty,
  onApprove,
  onReleaseFirst,
  onToggleFeedback,
  onToggleRevision,
  onReleaseRetention,
  onViewSlip,
}) {
  const role = useAppStore((s) => s.role)

  const canRetentionRelease =
    row.feedback_submitted && row.revision_done && row.retention_status === 'Holding'

  return (
    <tr className="hover:bg-gray-50">
      <Td className="font-medium text-gray-900">{row.clients?.name}</Td>
      <Td>{row.clients?.project_name}</Td>
      <Td>{row.writers?.name}</Td>
      <Td><Badge>{row.clients?.type}</Badge></Td>
      <Td>P{row.period}</Td>
      <Td>{formatCurrency(row.gross_amount)}</Td>
      <Td>
        {canDo(role, 'set_penalty') ? (
          <PenaltyInput
            currentPct={row.penalty_pct}
            currentReason={row.penalty_reason}
            onSave={(pct, reason) => onSetPenalty(row.id, pct, reason)}
          />
        ) : (
          <span className={Number(row.penalty_pct) > 0 ? 'text-red-600' : ''}>
            {row.penalty_pct}%
          </span>
        )}
      </Td>
      <Td>{formatCurrency(row.net_receivable)}</Td>
      <Td>{formatCurrency(row.first_release)}</Td>
      <Td>{formatCurrency(row.retained_amount)}</Td>
      <Td>
        <Badge color={row.trigger_met ? 'green' : 'gray'}>
          {row.trigger_met ? 'Met' : 'Not met'}
        </Badge>
      </Td>
      <Td>
        {!row.admin_approved && row.trigger_met && canDo(role, 'approve_payroll') ? (
          <Button size="sm" onClick={() => onApprove(row.id)}>Approve</Button>
        ) : (
          <Badge color={row.admin_approved ? 'green' : 'gray'}>
            {row.admin_approved ? 'Approved' : 'Pending'}
          </Badge>
        )}
      </Td>
      <Td>
        {row.first_release_status === 'Pending' && row.admin_approved && canDo(role, 'release_payroll') ? (
          <Button size="sm" variant="success" onClick={() => onReleaseFirst(row.id)}>Release</Button>
        ) : (
          <Badge>{row.first_release_status}</Badge>
        )}
      </Td>
      <Td>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => canDo(role, 'set_penalty') && onToggleFeedback(row.id, !row.feedback_submitted)}
            className="flex items-center gap-1 text-xs"
            disabled={!canDo(role, 'set_penalty')}
          >
            {row.feedback_submitted ? <CheckSquare size={14} className="text-green-600" /> : <Square size={14} className="text-gray-400" />}
            Feedback
          </button>
          <button
            onClick={() => canDo(role, 'set_penalty') && onToggleRevision(row.id, !row.revision_done)}
            className="flex items-center gap-1 text-xs"
            disabled={!canDo(role, 'set_penalty')}
          >
            {row.revision_done ? <CheckSquare size={14} className="text-green-600" /> : <Square size={14} className="text-gray-400" />}
            Revision
          </button>
        </div>
      </Td>
      <Td>
        {canRetentionRelease && canDo(role, 'release_payroll') ? (
          <Button size="sm" variant="success" onClick={() => onReleaseRetention(row.id)}>Release</Button>
        ) : (
          <Badge>{row.retention_status}</Badge>
        )}
      </Td>
      <Td>
        <button
          onClick={() => onViewSlip(row)}
          className="text-xs text-blue-600 hover:underline"
        >
          Slip
        </button>
      </Td>
    </tr>
  )
}
