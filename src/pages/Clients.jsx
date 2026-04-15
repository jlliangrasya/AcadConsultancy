import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ClientTable from '../components/clients/ClientTable'
import ClientForm from '../components/clients/ClientForm'
import ClientFilters from '../components/clients/ClientFilters'
import ClientDetailModal from '../components/clients/ClientDetailModal'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../hooks/useClients'
import { useToast } from '../components/ui/Toast'
import { canDo } from '../utils/roleGuards'
import useAppStore from '../store/useAppStore'

export default function Clients() {
  const role = useAppStore((s) => s.role)
  const toast = useToast()

  const [filters, setFilters] = useState({})
  const { data: clients, isLoading } = useClients(filters)
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleAdd = async (form) => {
    try {
      await createClient.mutateAsync(form)
      toast.success('Client added successfully')
      setShowForm(false)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEdit = async (form) => {
    try {
      await updateClient.mutateAsync({ id: editing.id, ...form })
      toast.success('Client updated successfully')
      setEditing(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteClient.mutateAsync(confirmDelete)
      toast.success('Client archived successfully')
      setConfirmDelete(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading clients...</div>
  }

  return (
    <div>
      <PageHeader title="Clients" description="Manage all client projects and assignments">
        {canDo(role, 'add_client') && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Client
          </Button>
        )}
      </PageHeader>

      <PageGuide
        id="clients"
        title="How to manage Clients"
        steps={[
          'Click "Add Client" to create a new project. Fill in client info, select Package or Regular, choose inclusions or service availed, and assign a writer.',
          'Use the filters above the cards to search by name, type, level, status, writer, or agent.',
          'Click the eye icon on any card to view full details and use the "Copy Details" button to copy formatted client info for messaging.',
          'Click the pencil icon to edit, or the trash icon to archive a client (financial history is preserved).',
          'Package clients show blue inclusion tags. Regular clients show the service availed.',
        ]}
      />

      <ClientFilters filters={filters} onChange={setFilters} />

      <ClientTable
        clients={clients}
        onEdit={setEditing}
        onDelete={setConfirmDelete}
        onView={setViewing}
        totalCount={clients?.length || 0}
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Client" size="xl">
        <ClientForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          loading={createClient.isPending}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Client" size="xl">
        <ClientForm
          client={editing}
          onSubmit={handleEdit}
          onCancel={() => setEditing(null)}
          loading={updateClient.isPending}
        />
      </Modal>

      <ClientDetailModal
        client={viewing}
        open={!!viewing}
        onClose={() => setViewing(null)}
      />

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Archive Client" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to archive <strong>{confirmDelete?.name}</strong>?
            This will set the client status to Completed. Financial history will be preserved.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteClient.isPending}>Archive</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
