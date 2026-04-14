import jsPDF from 'jspdf'

export function generateFMReportPDF(report, entries) {
  const doc = new jsPDF()
  let y = 20

  // Header
  doc.setFontSize(18)
  doc.text('Acad Consultation', 14, y)
  y += 8
  doc.setFontSize(14)
  doc.text(`Payroll Run #${report.run_number}`, 14, y)
  y += 7
  doc.setFontSize(10)
  doc.text(`Payout Date: ${report.payout_date}`, 14, y)
  y += 12

  // Summary
  doc.setFontSize(10)
  doc.setFillColor(245, 245, 245)
  doc.rect(14, y - 4, 182, 28, 'F')
  doc.text(`Writers Paid: ${report.writer_count}`, 18, y + 2)
  doc.text(`Projects: ${report.project_count}`, 80, y + 2)
  doc.text(`Total Release: ₱${Number(report.total_release).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 18, y + 10)
  doc.text(`Retention Held: ₱${Number(report.total_retention_held || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 18, y + 18)
  y += 34

  // Writer entries grouped by writer
  const byWriter = {}
  entries.forEach((e) => {
    const wName = e.writers?.name || 'Unknown'
    if (!byWriter[wName]) byWriter[wName] = []
    byWriter[wName].push(e)
  })

  doc.setFontSize(12)
  doc.text('SECTION 1: WRITER PAYOUTS', 14, y)
  y += 8

  Object.entries(byWriter).forEach(([writerName, rows]) => {
    if (y > 260) { doc.addPage(); y = 20 }

    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`Writer: ${writerName}`, 14, y)
    doc.setFont(undefined, 'normal')
    y += 6

    // Table header
    doc.setFontSize(8)
    doc.text('Client', 18, y)
    doc.text('Project', 60, y)
    doc.text('Period', 110, y)
    doc.text('Gross', 128, y)
    doc.text('Penalty', 150, y)
    doc.text('1st Release', 170, y)
    y += 5

    let subtotal = 0
    rows.forEach((r) => {
      if (y > 275) { doc.addPage(); y = 20 }
      doc.text(r.client_name.substring(0, 20), 18, y)
      doc.text(r.project_name.substring(0, 25), 60, y)
      doc.text(`P${r.period}`, 110, y)
      doc.text(`₱${Number(r.gross_amount).toLocaleString()}`, 128, y)
      doc.text(`${r.penalty_pct}%`, 150, y)
      doc.text(`₱${Number(r.first_release).toLocaleString()}`, 170, y)
      subtotal += Number(r.first_release)
      y += 5
    })

    doc.setFont(undefined, 'bold')
    doc.text(`Subtotal: ₱${subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 150, y)
    doc.setFont(undefined, 'normal')
    y += 10
  })

  // Grand total
  if (y > 250) { doc.addPage(); y = 20 }
  y += 5
  doc.setFillColor(30, 30, 30)
  doc.rect(14, y - 4, 182, 16, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.text('GRAND TOTAL', 18, y + 2)
  doc.text(`₱${Number(report.total_release).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 150, y + 2)
  doc.setFontSize(8)
  doc.text(`Retention held: ₱${Number(report.total_retention_held || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 18, y + 9)
  doc.setTextColor(0, 0, 0)
  y += 24

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(128)
    doc.text('CONFIDENTIAL — Acad Consultation', 14, 288)
    doc.text(`Page ${i} of ${pageCount}`, 180, 288)
  }

  doc.save(`payroll-run-${report.run_number}-${report.payout_date}.pdf`)
}
