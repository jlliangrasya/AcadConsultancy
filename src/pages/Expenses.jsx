import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import PageGuide from '../components/ui/PageGuide'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import { Table, Thead, Tbody, Th, Td, EmptyRow } from '../components/ui/Table'
import { useExpenses, useCreateExpense, useDeleteExpense, EXPENSE_CATEGORIES } from '../hooks/useExpenses'
import { useToast } from '../components/ui/Toast'
import { formatCurrency, formatDate } from '../utils/formatters'
import { TrendingDown, Calendar, Tag } from 'lucide-react'

function ExpenseForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Category *"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
        required
      />
      <Input
        label="Amount (₱) *"
        type="number"
        min="0.01"
        step="0.01"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />
      <Input
        label="Date *"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />
      <Input
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="e.g. Canva Pro subscription"
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Record Expense</Button>
      </div>
    </form>
  )
}

export default function Expenses() {
  const toast = useToast()
  const [filters, setFilters] = useState({ category: '', from: '', to: '' })
  const { data: expenses } = useExpenses(filters)
  const createExpense = useCreateExpense()
  const deleteExpense = useDeleteExpense()
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const total = (expenses || []).reduce((s, e) => s + Number(e.amount), 0)
  const byCategory = (expenses || []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

  const handleAdd = async (form) => {
    try {
      await createExpense.mutateAsync(form)
      toast.success('Expense recorded')
      setShowForm(false)
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async () => {
    try {
      await deleteExpense.mutateAsync(confirmDelete.id)
      toast.success('Expense deleted')
      setConfirmDelete(null)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <PageHeader title="Expenses" description="Track operational expenses for accurate P&L">
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Record Expense
        </Button>
      </PageHeader>

      <PageGuide
        id="expenses"
        title="How to track Expenses"
        steps={[
          'Record any operational expense: software subscriptions, office supplies, marketing, etc.',
          'Pick a category, enter the amount and date, and optionally add a description.',
          'The totals here feed directly into the Owner Analytics P&L — accurate expenses = accurate profit numbers.',
          'Use filters to narrow by category or date range. Useful for monthly or quarterly reviews.',
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Expenses" value={formatCurrency(total)} icon={TrendingDown} color="red" />
        <StatCard label="Entries" value={expenses?.length || 0} icon={Calendar} color="blue" />
        <StatCard label="Top Category" value={topCategory ? topCategory[0] : '—'} subtitle={topCategory ? formatCurrency(topCategory[1]) : ''} icon={Tag} color="purple" />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          placeholder="All categories"
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          placeholder="From"
        />
        <Input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          placeholder="To"
        />
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Date</Th>
            <Th>Category</Th>
            <Th>Description</Th>
            <Th>Amount</Th>
            <Th>Recorded By</Th>
            <Th>Actions</Th>
          </tr>
        </Thead>
        <Tbody>
          {(!expenses || expenses.length === 0) ? (
            <EmptyRow colSpan={6} message="No expenses recorded yet" />
          ) : (
            expenses.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <Td>{formatDate(e.date)}</Td>
                <Td><Badge color="purple">{e.category}</Badge></Td>
                <Td>{e.description || '—'}</Td>
                <Td className="font-medium">{formatCurrency(e.amount)}</Td>
                <Td>{e.recorded_by_name || '—'}</Td>
                <Td>
                  <button
                    onClick={() => setConfirmDelete(e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </Td>
              </tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Expense" size="sm">
        <ExpenseForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          loading={createExpense.isPending}
        />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Expense" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Delete <strong>{confirmDelete?.category}</strong> expense of <strong>{formatCurrency(confirmDelete?.amount)}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteExpense.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
