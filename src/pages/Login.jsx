import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import { USERS } from '../lib/mockData'

const DEMO_ACCOUNTS = [
  { key: 'owner', label: 'Owner', description: 'Full access — approve reports, analytics, P&L', color: 'blue' },
  { key: 'fm', label: 'Financial Manager', description: 'Payments, payroll, penalties, FM reports', color: 'green' },
  { key: 'ops', label: 'Operations Manager', description: 'Add/edit/delete clients, assign writers', color: 'purple' },
]

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)

  const handleLogin = (roleKey) => {
    setLoading(true)
    const user = USERS[roleKey]
    // Simulate brief loading
    setTimeout(() => {
      login(
        { id: user.id, email: user.email, full_name: user.full_name },
        user.role
      )
      setLoading(false)
      navigate('/')
    }, 300)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Acad Consultation
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Management System
            </p>
            <div className="mt-3 inline-block bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
              Demo Mode — No backend required
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center mb-5">
            Select a role to explore the system:
          </p>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.key}
                onClick={() => handleLogin(account.key)}
                disabled={loading}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md disabled:opacity-50
                  ${account.color === 'blue' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' : ''}
                  ${account.color === 'green' ? 'border-green-200 hover:border-green-400 hover:bg-green-50' : ''}
                  ${account.color === 'purple' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{account.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{account.description}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                    ${account.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                    ${account.color === 'green' ? 'bg-green-100 text-green-700' : ''}
                    ${account.color === 'purple' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    {account.key}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            All data is stored in-memory. Changes reset on page refresh.
          </p>
        </div>
      </div>
    </div>
  )
}
