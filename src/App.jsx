import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAppStore from './store/useAppStore'
import { ROLES } from './utils/constants'

import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Installments from './pages/Installments'
import Payroll from './pages/Payroll'
import FMReport from './pages/FMReport'
import SalesAgents from './pages/SalesAgents'
import Writers from './pages/Writers'
import OwnerDashboard from './pages/OwnerDashboard'
import AuditLog from './pages/AuditLog'

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}

export default function App() {
  const { user } = useAppStore()
  const location = useLocation()

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  if (location.pathname === '/login') {
    if (user) return <Navigate to="/" replace />
    return <Login />
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/clients" element={<Clients />} />
        <Route
          path="/installments"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FM, ROLES.OWNER]}>
              <Installments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FM, ROLES.OWNER]}>
              <Payroll />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fm-report"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FM, ROLES.OWNER]}>
              <FMReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales-agents"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FM, ROLES.OWNER]}>
              <SalesAgents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/writers"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FM, ROLES.OWNER, ROLES.OPS]}>
              <Writers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-log"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FM, ROLES.OWNER]}>
              <AuditLog />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}
