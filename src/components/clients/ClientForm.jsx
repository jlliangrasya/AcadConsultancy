import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { CLIENT_TYPES, REGULAR_GIVES, PACKAGE_GIVES, CLIENT_STATUSES } from '../../utils/constants'
import { useActiveWriters } from '../../hooks/useWriters'
import { useActiveSalesAgents } from '../../hooks/useSalesAgents'

const defaultForm = {
  name: '',
  contact: '',
  type: 'Regular',
  project_name: '',
  subject: '',
  school: '',
  total_amount: '',
  gives: 1,
  writer_id: '',
  sales_agent_id: '',
  year_batch: new Date().getFullYear(),
  start_date: '',
  due_date: '',
  is_carry_over: false,
  referral_source: '',
  notes: '',
  status: 'Active',
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
        type: client.type || 'Regular',
        project_name: client.project_name || '',
        subject: client.subject || '',
        school: client.school || '',
        total_amount: client.total_amount || '',
        gives: client.gives || 1,
        writer_id: client.writer_id || '',
        sales_agent_id: client.sales_agent_id || '',
        year_batch: client.year_batch || new Date().getFullYear(),
        start_date: client.start_date || '',
        due_date: client.due_date || '',
        is_carry_over: client.is_carry_over || false,
        referral_source: client.referral_source || '',
        notes: client.notes || '',
        status: client.status || 'Active',
      })
    }
  }, [client])

  const givesOptions = form.type === 'Package' ? PACKAGE_GIVES : REGULAR_GIVES

  const handleChange = (field, value) => {
    const updates = { [field]: value }
    if (field === 'type') {
      updates.gives = 1
    }
    setForm((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      total_amount: Number(form.total_amount),
      gives: Number(form.gives),
      year_batch: Number(form.year_batch),
      sales_agent_id: form.sales_agent_id || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Client Name *"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
        <Input
          label="Contact"
          value={form.contact}
          onChange={(e) => handleChange('contact', e.target.value)}
          placeholder="09XX-XXX-XXXX"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Client Type *"
          value={form.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={CLIENT_TYPES.map((t) => ({ value: t, label: t }))}
        />
        <Select
          label="Number of Gives *"
          value={form.gives}
          onChange={(e) => handleChange('gives', e.target.value)}
          options={givesOptions.map((g) => ({ value: g, label: `${g} give${g > 1 ? 's' : ''}` }))}
        />
      </div>

      <Input
        label="Project/Paper Name *"
        value={form.project_name}
        onChange={(e) => handleChange('project_name', e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Subject/Course"
          value={form.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
        />
        <Input
          label="School/University"
          value={form.school}
          onChange={(e) => handleChange('school', e.target.value)}
        />
      </div>

      <Input
        label="Total Contract Amount (₱) *"
        type="number"
        min="1"
        value={form.total_amount}
        onChange={(e) => handleChange('total_amount', e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Assigned Writer *"
          value={form.writer_id}
          onChange={(e) => handleChange('writer_id', e.target.value)}
          placeholder="Select writer"
          options={(writers || []).map((w) => ({ value: w.id, label: w.name }))}
          required
        />
        <Select
          label="Sales Agent (optional)"
          value={form.sales_agent_id}
          onChange={(e) => handleChange('sales_agent_id', e.target.value)}
          placeholder="No agent"
          options={(agents || []).map((a) => ({ value: a.id, label: a.name }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Year/Batch"
          type="number"
          value={form.year_batch}
          onChange={(e) => handleChange('year_batch', e.target.value)}
        />
        <Input
          label="Start Date"
          type="date"
          value={form.start_date}
          onChange={(e) => handleChange('start_date', e.target.value)}
        />
        <Input
          label="Due Date"
          type="date"
          value={form.due_date}
          onChange={(e) => handleChange('due_date', e.target.value)}
        />
      </div>

      {client && (
        <Select
          label="Status"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={CLIENT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="carry-over"
          checked={form.is_carry_over}
          onChange={(e) => handleChange('is_carry_over', e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="carry-over" className="text-sm text-gray-700">
          Carry-over client (Period 1 completed in prior year)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Referral Source"
          value={form.referral_source}
          onChange={(e) => handleChange('referral_source', e.target.value)}
        />
        <Input
          label="Notes"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {client ? 'Update Client' : 'Add Client'}
        </Button>
      </div>
    </form>
  )
}
