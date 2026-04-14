import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function AgentForm({ agent, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
  })

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name || '',
        email: agent.email || '',
        contact: agent.contact || '',
      })
    }
  }, [agent])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name *"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        placeholder="Agent full name"
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="agent@email.com"
      />
      <Input
        label="Contact"
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
        placeholder="09XX-XXX-XXXX"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {agent ? 'Update' : 'Add Agent'}
        </Button>
      </div>
    </form>
  )
}
