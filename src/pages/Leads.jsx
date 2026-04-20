import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, LEAD_STATUSES, isLeadQualified } from '../hooks/useLeads'
import { useToast } from '../components/ui/Toast'
import { LEVELS } from '../utils/constants'
import { formatDate } from '../utils/formatters'
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react'

function LeadForm({ lead, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: lead?.name || '',
    contact: lead?.contact || '',
    level: lead?.level || '',
    program: lead?.program || '',
    school: lead?.school || '',
    service_interest: lead?.service_interest || '',
    source: lead?.source || '',
    referred_by: lead?.referred_by || '',
    notes: lead?.notes || '',
    status: lead?.status || 'New',
    follow_up_date: lead?.follow_up_date || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const qualified = isLeadQualified(form)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${qualified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        {qualified ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        {qualified
          ? 'This lead meets qualification requirements.'
          : 'Qualification needs: name, contact, level, program, service interest, and status beyond "New".'}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Contact Number *" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required placeholder="09XX-XXX-XXXX" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Select label="Level *" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Select" options={LEVELS.map((l) => ({ value: l, label: l }))} required />
        <Input label="Program *" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} required placeholder="e.g. MA Psychology" />
        <Input label="School" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
      </div>

      <Input label="Service of Interest *" value={form.service_interest} onChange={(e) => setForm({ ...form, service_interest: e.target.value })} required placeholder="e.g. Package — Full thesis, or Regular — RRLs" />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. YTWmain, FB Page" />
        <Input label="Referred by (client name)" value={form.referred_by} onChange={(e) => setForm({ ...form, referred_by: e.target.value })} placeholder="If referred by existing client" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))} />
        <Input label="Follow-up Date" type="date" value={form.follow_up_date || ''} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
      </div>

      <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Budget, constraints, context..." />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{lead ? 'Update Lead' : 'Add Lead'}</Button>
      </div>
    </form>
  )
}

function LeadCard({ lead, onEdit, onDelete }) {
  const qualified = isLeadQualified(lead)
  const statusColors = {
    New: 'blue',
    Contacted: 'yellow',
    Qualified: 'green',
    Converted: 'purple',
    Lost: 'gray',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{lead.name}</h3>
            <Badge color={statusColors[lead.status]}>{lead.status}</Badge>
            {qualified && <Badge color="green">Qualified</Badge>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{lead.contact}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(lead)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(lead)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
        {lead.level && <div><span className="text-gray-400">Level: </span>{lead.level}</div>}
        {lead.program && <div className="truncate"><span className="text-gray-400">Program: </span>{lead.program}</div>}
        {lead.school && <div><span className="text-gray-400">School: </span>{lead.school}</div>}
        {lead.follow_up_date && <div><span className="text-gray-400">Follow-up: </span>{formatDate(lead.follow_up_date)}</div>}
      </div>

      {lead.service_interest && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-400">Interested in: </span>
          <span className="text-gray-700">{lead.service_interest}</span>
        </div>
      )}

      {(lead.source || lead.referred_by) && (
        <div className="mt-1 text-xs">
          {lead.source && <span className="text-gray-400">Source: <span className="text-gray-600">{lead.source}</span></span>}
          {lead.source && lead.referred_by && <span className="mx-1 text-gray-300">•</span>}
          {lead.referred_by && <span className="text-orange-600">Referred by: {lead.referred_by}</span>}
        </div>
      )}

      {lead.notes && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 italic truncate">
          {lead.notes}
        </div>
      )}
    </div>
  )
}

export default function Leads() {
  const toast = useToast()
  const [filters, setFilters] = useState({ status: '', search: '' })
  const { data: leads } = useLeads(filters)
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const total = leads?.length || 0
  const qualified = (leads || []).filter(isLeadQualified).length
  const converted = (leads || []).filter((l) => l.status === 'Converted').length
  const lost = (leads || []).filter((l) => l.status === 'Lost').length

  const handleAdd = async (form) => {
    try {
      await createLead.mutateAsync(form)
      toast.success('Lead added')
      setShowForm(false)
    } catch (err) { toast.error(err.message) }
  }

  const handleEdit = async (form) => {
    try {
      await updateLead.mutateAsync({ id: editing.id, ...form })
      toast.success('Lead updated')
      setEditing(null)
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(confirmDelete.id)
      toast.success('Lead deleted')
      setConfirmDelete(null)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <PageHeader title="Leads" description="Track prospects before they become clients">
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Lead
        </Button>
      </PageHeader>

      <PageGuide
        id="leads"
        title="How Lead Tracking works"
        steps={[
          'A lead is a potential client who has inquired but hasn\'t paid yet. Add them as soon as they message.',
          'Lead statuses flow: New → Contacted → Qualified → Converted (or Lost). Update as you follow up.',
          'A lead is Qualified when it has: name, contact, level, program, service interest, AND has been at least Contacted.',
          'Record source (where they came from) and referrer (if an existing client referred them) — useful for tracking what channels work.',
          'Set a follow-up date so you don\'t forget to check in. Qualified leads are your hottest prospects.',
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Leads" value={total} icon={Users} color="blue" />
        <StatCard label="Qualified" value={qualified} icon={UserCheck} color="green" />
        <StatCard label="Converted" value={converted} icon={UserPlus} color="purple" />
        <StatCard label="Lost" value={lost} icon={UserX} color="red" />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Search leads..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          placeholder="All statuses"
          options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </div>

      {(!leads || leads.length === 0) ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
          No leads yet. Click "Add Lead" to start tracking prospects.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onEdit={setEditing} onDelete={setConfirmDelete} />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Lead" size="lg">
        <LeadForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} loading={createLead.isPending} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Lead" size="lg">
        <LeadForm lead={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} loading={updateLead.isPending} />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Lead" size="sm">
        <p className="text-sm text-gray-600 mb-4">Delete lead <strong>{confirmDelete?.name}</strong>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteLead.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
