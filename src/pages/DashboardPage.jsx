import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'
import AppointmentCard from '../components/AppointmentCard'
import { formatDate } from '../utils/format'

function CustomerDashboard({ user }) {
  const { data, loading, error } = useApi('/appointments/my')
  const appointments = data?.appointments || []
  const upcoming = appointments.filter((item) => ['pending', 'confirmed'].includes(item.status)).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0]
  return <section className="page-wrap dashboard-wrap"><div className="dashboard-greeting"><div><span className="eyebrow">YOUR STUDIO SPACE</span><h1>Good morning, <em>{user.name.split(' ')[0]}.</em></h1><p>Everything for your next great hair day, all in one place.</p></div><Link className="button button-primary" to="/book">Book an appointment <span>↗</span></Link></div>
    <div className="dashboard-stats"><div><span>YOUR APPOINTMENTS</span><strong>{loading ? '—' : appointments.length}</strong></div><div><span>NEXT VISIT</span><strong>{upcoming ? formatDate(upcoming.appointmentDate) : 'Not booked yet'}</strong></div></div>
    <div className="content-section-heading"><div><span className="eyebrow">ON YOUR CALENDAR</span><h2>Coming up</h2></div><Link className="arrow-link" to="/appointments">All appointments ↗</Link></div>
    {loading ? <LoadingSpinner /> : error ? <div className="notice notice-error">{error}</div> : upcoming ? <AppointmentCard appointment={upcoming} /> : <div className="empty-state"><h3>Your next visit starts here.</h3><p>Choose a service and find a time that suits you.</p><Link className="text-link" to="/services">Browse the service menu ↗</Link></div>}
  </section>
}

function AdminDashboard({ user }) {
  const { data, loading, error } = useApi('/appointments')
  const appointments = data?.appointments || []
  const pending = appointments.filter((item) => item.status === 'pending')
  return <section className="page-wrap dashboard-wrap"><div className="dashboard-greeting"><div><span className="eyebrow">STUDIO OVERVIEW</span><h1>Welcome in, <em>{user.name.split(' ')[0]}.</em></h1><p>Here’s what’s happening at the studio.</p></div><Link className="button button-primary" to="/admin/services">Manage services <span>↗</span></Link></div>
    {loading ? <LoadingSpinner /> : error ? <div className="notice notice-error">{error}</div> : <div className="dashboard-stats"><div><span>ALL APPOINTMENTS</span><strong>{appointments.length}</strong></div><div><span>NEEDS YOUR ATTENTION</span><strong>{pending.length}</strong></div><div><span>UPCOMING / CONFIRMED</span><strong>{appointments.filter((item) => item.status === 'confirmed').length}</strong></div></div>}
    <div className="content-section-heading"><div><span className="eyebrow">NEXT STEPS</span><h2>Studio tools</h2></div></div><div className="tool-grid"><Link to="/admin/appointments" className="tool-card"><span className="tool-index">01</span><div><h3>Appointments</h3><p>Review requests and update visit statuses.</p></div><span>↗</span></Link><Link to="/admin/services" className="tool-card"><span className="tool-index">02</span><div><h3>Services</h3><p>Keep the live service menu up to date.</p></div><span>↗</span></Link><Link to="/admin/availability" className="tool-card"><span className="tool-index">03</span><div><h3>Salon availability</h3><p>Manage weekly opening hours and breaks.</p></div><span>↗</span></Link></div>
  </section>
}

export default function DashboardPage() {
  const { user } = useAuth()
  return user.role === 'admin' ? <AdminDashboard user={user} /> : <CustomerDashboard user={user} />
}
