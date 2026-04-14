import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMockDB } from '../../lib/mockData'
import Modal from '../ui/Modal'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import PaperReleaseCell from './PaperReleaseCell'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { formatClientForCopy } from '../../utils/clientCopyFormatter'
import { Copy, Check } from 'lucide-react'

function DetailRow({ label, value, className = '' }) {
  if (!value) return null
  return (
    <div className={className}>
      <span className="text-xs text-gray-400 block">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

export default function ClientDetailModal({ client, open, onClose }) {
  const [copied, setCopied] = useState(false)

  const { data: installment } = useQuery({
    queryKey: ['clientInstallment', client?.id],
    enabled: !!client?.id && open,
    queryFn: () => {
      const db = getMockDB()
      return db.installments.find((i) => i.client_id === client.id) || null
    },
  })

  if (!client) return null

  const isPackage = client.type === 'Package'

  const handleCopy = async () => {
    const text = formatClientForCopy(client, installment)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Client Details" size="lg">
      <div className="space-y-5">
        {/* Header with copy */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{client.name}</h2>
            <p className="text-sm text-gray-500">{client.project_name}</p>
          </div>
          <Button variant={copied ? 'success' : 'primary'} onClick={handleCopy}>
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Details</>}
          </Button>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge>{client.type}</Badge>
          <Badge>{client.status}</Badge>
          {client.is_carry_over && <Badge color="purple">Carry-over</Badge>}
          {client.level && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{client.level}</span>}
        </div>

        {/* Client Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Client Information</h4>
          <div className="grid grid-cols-3 gap-4">
            <DetailRow label="FB Name / Contact" value={client.name} />
            <DetailRow label="Contact" value={client.contact} />
            <DetailRow label="Level" value={client.level} />
            <DetailRow label="Program / Course" value={client.program} />
            <DetailRow label="School" value={client.school} />
            <DetailRow label="Referred by" value={client.referred_by} />
            <DetailRow label="Referral Source" value={client.referral_source} />
          </div>
        </div>

        {/* Financials */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Financials</h4>
          <div className="grid grid-cols-4 gap-4">
            <DetailRow label="Total Amount" value={formatCurrency(client.total_amount)} />
            <DetailRow label="Gives" value={`${client.gives} give${client.gives > 1 ? 's' : ''}`} />
            <DetailRow label="Per Give" value={formatCurrency(client.total_amount / client.gives)} />
            <DetailRow label="Financing" value={client.gives > 1 ? `${Math.round(100 / client.gives)}% DP` : 'Full payment'} />
          </div>
          {installment && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Collected: <strong className="text-green-700">{formatCurrency(installment.total_paid)}</strong></span>
                <span className="text-gray-500">Remaining: <strong className="text-red-600">{formatCurrency(installment.total_amount - installment.total_paid)}</strong></span>
                <Badge>{installment.status}</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Service / Package details */}
        {isPackage && client.package_inclusions?.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-blue-600 uppercase mb-3">Package Inclusions</h4>
            <div className="flex flex-wrap gap-2">
              {client.package_inclusions.map((inc) => (
                <span key={inc} className="bg-white border border-blue-200 text-blue-800 text-sm px-3 py-1 rounded-lg">
                  {inc === 'Validator' && client.validator_count > 1 ? `${client.validator_count} Validators` :
                   inc === 'Extra RRLs' && client.extra_rrls_count > 1 ? `${client.extra_rrls_count} Extra RRLs` :
                   inc === 'Validator' ? `${client.validator_count || 1} Validator` :
                   inc === 'Extra RRLs' ? `${client.extra_rrls_count || 1} Extra RRLs` :
                   inc}
                </span>
              ))}
            </div>
            {client.revision_notes && (
              <div className="mt-3 text-sm text-blue-700">Revisions: {client.revision_notes}</div>
            )}
          </div>
        )}
        {!isPackage && client.service_availed && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-green-600 uppercase mb-2">Service Availed</h4>
            <p className="text-sm text-green-800">{client.service_availed}</p>
          </div>
        )}

        {/* Schedule & Assignment */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Schedule & Assignment</h4>
          <div className="grid grid-cols-4 gap-4">
            <DetailRow label="Writer" value={client.writers?.name} />
            <DetailRow label="Sales Agent" value={client.sales_agents?.name} />
            <DetailRow label="Start Date" value={formatDate(client.start_date)} />
            <DetailRow label="Due Date" value={formatDate(client.due_date)} />
            <DetailRow label="Latest Deadline" value={client.latest_deadline} />
            <DetailRow label="Year / Batch" value={client.year_batch} />
          </div>
        </div>

        {/* Paper releases */}
        {client.paper_releases?.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Paper releases:</span>
            <PaperReleaseCell clientId={client.id} releases={client.paper_releases} />
          </div>
        )}

        {/* Notes */}
        {client.notes && (
          <div className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">
            <span className="text-xs text-gray-400 block mb-1">Notes</span>
            {client.notes}
          </div>
        )}
      </div>
    </Modal>
  )
}
