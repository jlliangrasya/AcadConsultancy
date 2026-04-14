import { useState, useEffect } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function WriterForm({ writer, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contact: '',
  })

  useEffect(() => {
    if (writer) {
      setForm({
        name: writer.name || '',
        email: writer.email || '',
        contact: writer.contact || '',
      })
    }
  }, [writer])

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
        placeholder="Writer full name"
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="writer@email.com"
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
          {writer ? 'Update' : 'Add Writer'}
        </Button>
      </div>
    </form>
  )
}
