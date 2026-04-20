import { getMockDB } from './mockData'

export function checkAndFlagOverdue() {
  const db = getMockDB()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  db.clients.forEach((client) => {
    if (client.status !== 'Active') return
    if (!client.due_date) return

    const dueDate = new Date(client.due_date)
    dueDate.setHours(0, 0, 0, 0)

    if (today > dueDate) {
      client.status = 'Overdue'
    }
  })
}
