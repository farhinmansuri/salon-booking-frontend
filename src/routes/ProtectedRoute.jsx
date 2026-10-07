import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'
import { dashboardPath } from '../utils/auth'

export default function ProtectedRoute({ roles }) {
  const { user, ready, sessionExpired } = useAuth()
  const location = useLocation()
  if (!ready) return <LoadingSpinner label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location, sessionExpired }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={dashboardPath(user)} replace />
  return <Outlet />
}
