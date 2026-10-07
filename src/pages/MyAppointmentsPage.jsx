import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import useApi from '../hooks/useApi'
import api from '../services/api'
import AppointmentCard from '../components/AppointmentCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getErrorMessage } from '../utils/format'

export default function MyAppointmentsPage() {
  const { data, loading, error, reload } = useApi('/appointments/my')
  const location = useLocation()
  const [actionError, setActionError] = useState('')
  const appointments = data?.appointments || []

  async function cancel(appointment) {
    setActionError('')
    try { await api.patch(`/appointments/${appointment._id}/cancel`); await reload() }
    catch (requestError) { setActionError(getErrorMessage(requestError, 'Unable to cancel this appointment.')) }
  }

  return <section className="page-wrap dashboard-wrap"><div className="page-hero page-hero-small"><span className="eyebrow">YOUR STUDIO SPACE</span><h1>Your <em>appointments.</em></h1><p>Every visit, all in one place. Times are shown in Asia/Kolkata.</p></div>
    {location.state?.notice && <div className="notice notice-success">{location.state.notice}</div>}{(error || actionError) && <div className="notice notice-error">{actionError || error}</div>}
    {loading ? <LoadingSpinner label="Loading your appointments…" /> : appointments.length ? <div className="appointment-list">{appointments.map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} onCancel={cancel} />)}</div> : <div className="empty-state"><h3>No appointments yet.</h3><p>Your next visit is just around the corner.</p><Link className="text-link" to="/services">Explore the service menu ↗</Link></div>}
  </section>
}
