import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  ClipboardList,
  UserCheck,
  PenTool,
  BarChart3,
  LogOut,
  ScrollText,
  UserPlus,
  Receipt,
} from 'lucide-react'
import useAppStore from '../../store/useAppStore'
import { canDo } from '../../utils/roleGuards'

const allNavItems = [
  { to: '/',              label: 'Dashboard',        icon: LayoutDashboard, permission: null },
  { to: '/owner-dashboard', label: 'Analytics',      icon: BarChart3,       permission: 'view_owner_dash' },
  { to: '/leads',        label: 'Leads',             icon: UserPlus,        permission: 'view_leads' },
  { to: '/clients',      label: 'Clients',           icon: Users,           permission: null },
  { to: '/installments', label: 'Installments',      icon: CreditCard,      permission: 'view_installments' },
  { to: '/payroll',      label: 'Payroll',           icon: FileText,        permission: 'view_payroll' },
  { to: '/fm-report',    label: 'FM Report',         icon: ClipboardList,   permission: 'view_payroll' },
  { to: '/sales-agents', label: 'Sales Agents',      icon: UserCheck,       permission: 'view_agents' },
  { to: '/writers',      label: 'Writers',           icon: PenTool,         permission: 'manage_writers' },
  { to: '/expenses',     label: 'Expenses',          icon: Receipt,         permission: 'view_expenses' },
  { to: '/audit-log',    label: 'Audit Log',         icon: ScrollText,      permission: 'view_payroll' },
]

export default function Navbar() {
  const { role, user } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  const visibleItems = allNavItems.filter(
    (item) => item.permission === null || canDo(role, item.permission)
  )

  const handleLogout = () => {
    useAppStore.getState().logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">YTW Writes</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.full_name}</p>
        <p className="text-xs text-gray-400 capitalize">{role}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
