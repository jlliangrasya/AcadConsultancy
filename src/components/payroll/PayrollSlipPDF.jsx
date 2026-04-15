import jsPDF from 'jspdf'

export function generatePayrollSlipPDF(row) {
  const doc = new jsPDF()
  let y = 20

  // Header
  doc.setFontSize(16)
  doc.text('YTW Writes', 14, y)
  y += 8
  doc.setFontSize(12)
  doc.text('Payroll Slip', 14, y)
  y += 12

  // Details
  doc.setFontSize(10)
  const details = [
    ['Client', row.clients?.name || ''],
    ['Project', row.clients?.project_name || ''],
    ['Writer', row.writers?.name || ''],
    ['Type', row.clients?.type || ''],
    ['Period', `Period ${row.period}`],
    ['', ''],
    ['Gross Amount', `₱${Number(row.gross_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
    ['Penalty', `${row.penalty_pct}%${row.penalty_reason ? ` — ${row.penalty_reason}` : ''}`],
    ['Net Receivable', `₱${Number(row.net_receivable).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
    ['', ''],
    ['First Release (90%)', `₱${Number(row.first_release).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
    ['Retained (10%)', `₱${Number(row.retained_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`],
  ]

  details.forEach(([label, value]) => {
    if (label === '' && value === '') {
      y += 4
      return
    }
    doc.text(label, 14, y)
    doc.text(value, 100, y)
    y += 7
  })

  // Footer
  y += 10
  doc.setFontSize(8)
  doc.setTextColor(128)
  doc.text('CONFIDENTIAL — YTW Writes', 14, y)

  const clientName = (row.clients?.name || 'unknown').replace(/\s+/g, '-')
  doc.save(`payroll-slip-${clientName}-P${row.period}.pdf`)
}
