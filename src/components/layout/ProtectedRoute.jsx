import { Navigate } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role } = useAppStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
