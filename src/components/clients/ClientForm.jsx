import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import {
  CLIENT_TYPES, REGULAR_GIVES, PACKAGE_GIVES, CLIENT_STATUSES,
  LEVELS, PACKAGE_INCLUSIONS,
} from '../../utils/constants'
import { useActiveWriters } from '../../hooks/useWriters'
import { useActiveSalesAgents } from '../../hooks/useSalesAgents'

const defaultForm = {
  name: '',
  contact: '',
  type: 'Package',
  project_name: '',
  level: '',
  program: '',
  school: '',
  total_amount: '',
  gives: 1,
  writer_id: '',
  sales_agent_id: '',
  year_batch: new Date().getFullYear(),
  start_date: '',
  due_date: '',
  latest_deadline: '',
  is_carry_over: false,
  referral_source: '',
  referred_by: '',
  notes: '',
  status: 'Active',
  // Package-specific
  package_inclusions: [],
  validator_count: 1,
  extra_rrls_count: 1,
  revision_notes: '',
  // Regular-specific
  service_availed: '',
}

function SectionHeader({ title }) {
  return (
    <div className="border-b border-gray-200 pb-1 mb-3 mt-5 first:mt-0">
      <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
    </div>
  )
}

export default function ClientForm({ client, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(defaultForm)
  const { data: writers } = useActiveWriters()
  const { data: agents } = useActiveSalesAgents()

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        contact: client.contact || '',
        type: client.type || 'Package',
        project_name: client.project_name || '',
        level: client.level || '',
        program: client.program || '',
        school: client.school || '',
        total_amount: client.total_amount || '',
        gives: client.gives || 1,
        writer_id: client.writer_id || '',
        sales_agent_id: client.sales_agent_id || '',
        year_batch: client.year_batch || new Date().getFullYear(),
        start_date: client.start_date || '',
        due_date: client.due_date || '',
        latest_deadline: client.latest_deadline || '',
        is_carry_over: client.is_carry_over || false,
        referral_source: client.referral_source || '',
        referred_by: client.referred_by || '',
        notes: client.notes || '',
        status: client.status || 'Active',
        package_inclusions: client.package_inclusions || [],
        validator_count: client.validator_count || 1,
        extra_rrls_count: client.extra_rrls_count || 1,
        revision_notes: client.revision_notes || '',
        service_availed: client.service_availed || '',
      })
    }
  }, [client])

  const givesOptions = form.type === 'Package' ? PACKAGE_GIVES : REGULAR_GIVES
  const isPackage = form.type === 'Package'

  const handleChange = (field, value) => {
    const updates = { [field]: value }
    if (field === 'type') {
      updates.gives = 1
      if (value === 'Regular') {
        updates.package_inclusions = []
        updates.validator_count = 1
        updates.extra_rrls_count = 1
      } else {
        updates.service_availed = ''
      }
    }
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const toggleInclusion = (item) => {
    setForm((prev) => {
      const current = prev.package_inclusions
      const next = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item]
      return { ...prev, package_inclusions: next }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      total_amount: Number(form.total_amount),
      gives: Number(form.gives),
      year_batch: Number(form.year_batch),
      validator_count: Number(form.validator_count),
      extra_rrls_count: Number(form.extra_rrls_count),
      sales_agent_id: form.sales_agent_id || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {/* ---- CLIENT INFO ---- */}
      <SectionHeader title="Client Information" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Client Name / FB Name *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="e.g. Anne Bautista" />
        <Input label="Contact Number" value={form.contact} onChange={(e) => handleChange('contact', e.target.value)} placeholder="09XX-XXX-XXXX" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Select label="Level *" value={form.level} onChange={(e) => handleChange('level', e.target.value)} placeholder="Select level" options={LEVELS.map((l) => ({ value: l, label: l }))} required />
        <Input label="Program / Course *" value={form.program} onChange={(e) => handleChange('program', e.target.value)} required placeholder="e.g. PhD in Biological Education" />
        <Input label="School / University" value={form.school} onChange={(e) => handleChange('school', e.target.value)} placeholder="e.g. PUP" />
      </div>

      {/* ---- PROJECT DETAILS ---- */}
      <SectionHeader title="Project Details" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Client Type *" value={form.type} onChange={(e) => handleChange('type', e.target.value)} options={CLIENT_TYPES.map((t) => ({ value: t, label: t }))} />
        <Input label="Project / Paper Name *" value={form.project_name} onChange={(e) => handleChange('project_name', e.target.value)} required placeholder="e.g. Thesis - Educational Psychology" />
      </div>

      {/* Package-specific: Inclusions */}
      {isPackage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-blue-800">Package Inclusions</p>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGE_INCLUSIONS.map((item) => {
              const checked = form.package_inclusions.includes(item)
              const hasCount = item === 'Validator' || item === 'Extra RRLs'
              return (
                <div key={item} className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleInclusion(item)}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    {item}
                  </label>
                  {hasCount && checked && (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={item === 'Validator' ? form.validator_count : form.extra_rrls_count}
                      onChange={(e) => handleChange(item === 'Validator' ? 'validator_count' : 'extra_rrls_count', e.target.value)}
                      className="w-14 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                    />
                  )}
                </div>
              )
            })}
          </div>
          <Input label="Revisions" value={form.revision_notes} onChange={(e) => handleChange('revision_notes', e.target.value)} placeholder="e.g. minor revisions" />
        </div>
      )}

      {/* Regular-specific: Service Availed */}
      {!isPackage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <Input label="Service Availed *" value={form.service_availed} onChange={(e) => handleChange('service_availed', e.target.value)} required placeholder="e.g. RRLs, revision, etc." />
        </div>
      )}

      {/* ---- FINANCIALS ---- */}
      <SectionHeader title="Financials" />
      <div className="grid grid-cols-3 gap-4">
        <Input label="Total Amount (₱) *" type="number" min="1" value={form.total_amount} onChange={(e) => handleChange('total_amount', e.target.value)} required />
        <Select label="Number of Gives *" value={form.gives} onChange={(e) => handleChange('gives', e.target.value)} options={givesOptions.map((g) => ({ value: g, label: `${g} give${g > 1 ? 's' : ''}` }))} />
        <Input label="Page / Referral Source" value={form.referral_source} onChange={(e) => handleChange('referral_source', e.target.value)} placeholder="e.g. YTWmain" />
      </div>
      <Input label="Referred by" value={form.referred_by} onChange={(e) => handleChange('referred_by', e.target.value)} placeholder="Name of the client who referred this person (if any)" />

      {/* ---- ASSIGNMENT ---- */}
      <SectionHeader title="Assignment" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Assigned Writer *" value={form.writer_id} onChange={(e) => handleChange('writer_id', e.target.value)} placeholder="Select writer" options={(writers || []).map((w) => ({ value: w.id, label: w.name }))} required />
        <Select label="Sales Agent (optional)" value={form.sales_agent_id} onChange={(e) => handleChange('sales_agent_id', e.target.value)} placeholder="No agent" options={(agents || []).map((a) => ({ value: a.id, label: a.name }))} />
      </div>

      {/* ---- SCHEDULE ---- */}
      <SectionHeader title="Schedule" />
      <div className="grid grid-cols-4 gap-4">
        <Input label="Year / Batch" type="number" value={form.year_batch} onChange={(e) => handleChange('year_batch', e.target.value)} />
        <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} />
        <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => handleChange('due_date', e.target.value)} />
        <Input label="Latest Deadline" value={form.latest_deadline} onChange={(e) => handleChange('latest_deadline', e.target.value)} placeholder="e.g. April 25" />
      </div>

      {client && (
        <Select label="Status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} options={CLIENT_STATUSES.map((s) => ({ value: s, label: s }))} />
      )}

      <div className="flex items-center gap-2 pt-1">
        <input type="checkbox" id="carry-over" checked={form.is_carry_over} onChange={(e) => handleChange('is_carry_over', e.target.checked)} className="rounded border-gray-300" />
        <label htmlFor="carry-over" className="text-sm text-gray-700">Carry-over client</label>
      </div>

      <Input label="Notes" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any additional notes..." />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{client ? 'Update Client' : 'Add Client'}</Button>
      </div>
    </form>
  )
}
