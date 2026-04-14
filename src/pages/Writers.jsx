import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import WriterTable from '../components/writers/WriterTable'
import WriterForm from '../components/writers/WriterForm'
import WriterProjectsModal from '../components/writers/WriterProjectsModal'
import { useWriters, useCreateWriter, useUpdateWriter } from '../hooks/useWriters'
import { useToast } from '../components/ui/Toast'
import { canDo } from '../utils/roleGuards'
import useAppStore from '../store/useAppStore'

export default function Writers() {
  const role = useAppStore((s) => s.role)
  const { data: writers, isLoading } = useWriters()
  const createWriter = useCreateWriter()
  const updateWriter = useUpdateWriter()
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewingProjects, setViewingProjects] = useState(null)

  const handleAdd = async (form) => {
    try {
      await createWriter.mutateAsync(form)
      toast.success('Writer added successfully')
      setShowForm(false)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEdit = async (form) => {
    try {
      await updateWriter.mutateAsync({ id: editing.id, ...form })
      toast.success('Writer updated successfully')
      setEditing(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleStatus = async (writer) => {
    const newStatus = writer.status === 'active' ? 'inactive' : 'active'
    try {
      await updateWriter.mutateAsync({ id: writer.id, status: newStatus })
      toast.success(`Writer ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading writers...</div>
  }

  return (
    <div>
      <PageHeader title="Writers" description="Manage writers assigned to client projects">
        {canDo(role, 'manage_writers') && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Writer
          </Button>
        )}
      </PageHeader>

      <WriterTable
        writers={writers}
        onEdit={setEditing}
        onToggleStatus={handleToggleStatus}
        onViewProjects={setViewingProjects}
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Writer">
        <WriterForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          loading={createWriter.isPending}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Writer">
        <WriterForm
          writer={editing}
          onSubmit={handleEdit}
          onCancel={() => setEditing(null)}
          loading={updateWriter.isPending}
        />
      </Modal>

      <WriterProjectsModal
        writer={viewingProjects}
        open={!!viewingProjects}
        onClose={() => setViewingProjects(null)}
      />
    </div>
  )
}
