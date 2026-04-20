import { useState } from 'react'
import jsPDF from 'jspdf'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { getMockDB } from '../../lib/mockData'
import { formatCurrency } from '../../utils/formatters'
import { useToast } from '../ui/Toast'

function computePLForRange(from, to) {
  const db = getMockDB()
  const fromDate = new Date(from)
  const toDate = new Date(to)
  toDate.setHours(23, 59, 59, 999)

  // Revenue = total payments recorded in range
  let totalCollected = 0
  db.installments.forEach((inst) => {
    inst.payments.forEach((p) => {
      const d = new Date(p.date_paid)
      if (d >= fromDate && d <= toDate) totalCollected += Number(p.amount)
    })
  })

  // Writer payouts = payroll first_release + retention released in range
  let totalWriter = 0
  db.payroll.forEach((p) => {
    if (p.first_release_status === 'Released' && p.first_released_at) {
      const d = new Date(p.first_released_at)
      if (d >= fromDate && d <= toDate) totalWriter += Number(p.first_release)
    }
    if (p.retention_status === 'Released' && p.retention_released_at) {
      const d = new Date(p.retention_released_at)
      if (d >= fromDate && d <= toDate) totalWriter += Number(p.retained_amount)
    }
  })

  // Agent commissions paid in range
  let totalAgent = 0
  db.salesAgentCuts.forEach((c) => {
    if (c.paid && c.paid_at) {
      const d = new Date(c.paid_at)
      if (d >= fromDate && d <= toDate) totalAgent += Number(c.cut_amount)
    }
  })

  // Expenses in range
  let totalExpenses = 0
  const expenseBreakdown = {}
  db.expenses.forEach((e) => {
    const d = new Date(e.date)
    if (d >= fromDate && d <= toDate) {
      totalExpenses += Number(e.amount)
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + Number(e.amount)
    }
  })

  const netProfit = totalCollected - totalWriter - totalAgent - totalExpenses
  return { totalCollected, totalWriter, totalAgent, totalExpenses, netProfit, expenseBreakdown }
}

function generatePLPDF(from, to, pl) {
  const doc = new jsPDF()
  let y = 20

  doc.setFontSize(18)
  doc.text('YTW Writes', 14, y)
  y += 8
  doc.setFontSize(14)
  doc.text('Profit & Loss Statement', 14, y)
  y += 7
  doc.setFontSize(10)
  doc.text(`Period: ${from} to ${to}`, 14, y)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, y)
  y += 14

  // Revenue
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('REVENUE', 14, y)
  y += 7
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.text('Total Collected (Client Payments)', 18, y)
  doc.text(`P${Number(pl.totalCollected).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' })
  y += 10

  // Expenses
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('EXPENSES', 14, y)
  y += 7
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)

  doc.text('Writer Payouts', 18, y)
  doc.text(`P${Number(pl.totalWriter).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' })
  y += 6
  doc.text('Sales Agent Commissions', 18, y)
  doc.text(`P${Number(pl.totalAgent).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' })
  y += 6

  // Operating expenses breakdown
  if (Object.keys(pl.expenseBreakdown).length > 0) {
    doc.text('Operating Expenses:', 18, y)
    y += 5
    Object.entries(pl.expenseBreakdown).forEach(([cat, amt]) => {
      doc.text(`  ${cat}`, 22, y)
      doc.text(`P${Number(amt).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' })
      y += 5
    })
    doc.text('Total Operating Expenses', 18, y)
    doc.text(`P${Number(pl.totalExpenses).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' })
    y += 6
  } else {
    doc.text('Operating Expenses', 18, y)
    doc.text('P0.00', 170, y, { align: 'right' })
    y += 6
  }

  y += 4
  doc.setDrawColor(120)
  doc.line(14, y, 196, y)
  y += 6

  // Net profit
  doc.setFillColor(pl.netProfit >= 0 ? 230 : 250, pl.netProfit >= 0 ? 245 : 230, pl.netProfit >= 0 ? 230 : 230)
  doc.rect(14, y - 4, 182, 12, 'F')
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('NET PROFIT', 18, y + 3)
  doc.text(`P${Number(pl.netProfit).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 170, y + 3, { align: 'right' })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.setFont(undefined, 'normal')
  doc.text('CONFIDENTIAL — YTW Writes', 14, 288)

  doc.save(`PL-${from}-to-${to}.pdf`)
}

export default function PLExportModal({ open, onClose }) {
  const toast = useToast()
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = new Date()
  firstOfMonth.setDate(1)
  const [from, setFrom] = useState(firstOfMonth.toISOString().split('T')[0])
  const [to, setTo] = useState(today)

  const preview = from && to ? computePLForRange(from, to) : null

  const handleExport = () => {
    if (!preview) return
    generatePLPDF(from, to, preview)
    toast.success('P&L PDF downloaded')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Export P&L Statement" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Select a date range to generate a Profit & Loss PDF.</p>

        <div className="grid grid-cols-2 gap-4">
          <Input label="From *" type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
          <Input label="To *" type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
        </div>

        {preview && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-semibold text-gray-700 mb-2">Preview:</p>
            <div className="flex justify-between"><span className="text-gray-600">Revenue (Collected)</span><span className="text-green-700 font-medium">{formatCurrency(preview.totalCollected)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Writer Payouts</span><span className="text-red-600">-{formatCurrency(preview.totalWriter)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Agent Commissions</span><span className="text-red-600">-{formatCurrency(preview.totalAgent)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Operating Expenses</span><span className="text-red-600">-{formatCurrency(preview.totalExpenses)}</span></div>
            <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
              <span>Net Profit</span>
              <span className={preview.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}>{formatCurrency(preview.netProfit)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport}>Download PDF</Button>
        </div>
      </div>
    </Modal>
  )
}
