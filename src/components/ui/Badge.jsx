const colorMap = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
}

const statusColors = {
  Active: 'blue',
  Completed: 'green',
  Overdue: 'red',
  'On Hold': 'yellow',
  'Carry-over': 'purple',
  Pending: 'yellow',
  Paid: 'green',
  Released: 'green',
  Holding: 'orange',
  submitted: 'yellow',
  released: 'green',
  rejected: 'red',
  active: 'green',
  inactive: 'gray',
}

export default function Badge({ children, color, status }) {
  const resolvedColor = color || statusColors[children] || statusColors[status] || 'gray'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[resolvedColor]}`}>
      {children}
    </span>
  )
}
