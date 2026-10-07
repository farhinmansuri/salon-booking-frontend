import { Link, Navigate, Route, Routes } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import { dashboardPath } from './utils/auth'
import SiteLayout from './layouts/SiteLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BookAppointmentPage from './pages/BookAppointmentPage'
import MyAppointmentsPage from './pages/MyAppointmentsPage'
import ProfilePage from './pages/ProfilePage'
import AdminServicesPage from './pages/AdminServicesPage'
import AdminAppointmentsPage from './pages/AdminAppointmentsPage'
import AdminAvailabilityPage from './pages/AdminAvailabilityPage'

function NotFoundPage() {
  return <section className="empty-state not-found"><span className="eyebrow">404 · WRONG TURN</span><h1>That page took<br /><em>a different route.</em></h1><Link className="text-link" to="/">Back to the studio ↗</Link></section>
}

function DashboardRedirect() {
  const { user } = useAuth()
  return <Navigate to={dashboardPath(user)} replace />
}

export default function App() {
  return <Routes>
    <Route element={<SiteLayout />}>
      <Route index element={<HomePage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardRedirect />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['customer']} />}>
        <Route path="customer/dashboard" element={<DashboardPage />} />
        <Route path="book" element={<BookAppointmentPage />} />
        <Route path="appointments" element={<MyAppointmentsPage />} />
      </Route>
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="admin/dashboard" element={<DashboardPage />} />
        <Route path="admin/services" element={<AdminServicesPage />} />
        <Route path="admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="admin/availability" element={<AdminAvailabilityPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
