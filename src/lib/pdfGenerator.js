import jsPDF from 'jspdf'

export function createPDFDocument(title) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(10)
  return doc
}

export function addPDFFooter(doc, pageCount) {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128)
    doc.text('CONFIDENTIAL — Acad Consultation', 14, 285)
    doc.text(`Page ${i} of ${pageCount}`, 180, 285)
  }
}
