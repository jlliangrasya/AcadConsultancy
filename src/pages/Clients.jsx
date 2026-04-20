import { useState } from 'react'
import { Plus, Calendar } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ClientTable from '../components/clients/ClientTable'
import ClientForm from '../components/clients/ClientForm'
import ClientFilters from '../components/clients/ClientFilters'
import ClientDetailModal from '../components/clients/ClientDetailModal'
import CarryOverModal from '../components/clients/CarryOverModal'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, findDuplicateClients } from '../hooks/useClients'
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
  const [duplicateWarning, setDuplicateWarning] = useState(null)
  const [carryOverOpen, setCarryOverOpen] = useState(false)

  const performAdd = async (form) => {
    try {
      await createClient.mutateAsync(form)
      toast.success('Client added successfully')
      setShowForm(false)
      setDuplicateWarning(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleAdd = async (form) => {
    const duplicates = findDuplicateClients(form)
    if (duplicates.length > 0) {
      setDuplicateWarning({ form, duplicates })
      return
    }
    await performAdd(form)
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
        {canDo(role, 'edit_client') && (
          <Button variant="secondary" onClick={() => setCarryOverOpen(true)}>
            <Calendar size={16} /> Year-End Carry-over
          </Button>
        )}
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

      <CarryOverModal open={carryOverOpen} onClose={() => setCarryOverOpen(false)} />

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

      <Modal open={!!duplicateWarning} onClose={() => setDuplicateWarning(null)} title="Possible Duplicate Client" size="md">
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            A client with similar name and project/service already exists. Please review before adding:
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {duplicateWarning?.duplicates.map((d) => (
              <div key={d.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-900">{d.name}</p>
                <p className="text-gray-600">{d.project_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {d.type} • ₱{Number(d.total_amount).toLocaleString()} • {d.status}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDuplicateWarning(null)}>Go Back & Edit</Button>
            <Button variant="danger" onClick={() => performAdd(duplicateWarning.form)} loading={createClient.isPending}>
              Add Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
