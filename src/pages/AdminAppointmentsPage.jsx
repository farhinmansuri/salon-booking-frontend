import { useState } from 'react'
import useApi from '../hooks/useApi'
import api from '../services/api'
import AppointmentCard from '../components/AppointmentCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getErrorMessage } from '../utils/format'

const filters = ['all', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed']

export default function AdminAppointmentsPage() {
  const { data, loading, error, reload } = useApi('/appointments')
  const [filter, setFilter] = useState('all')
  const [actionError, setActionError] = useState('')
  const appointments = data?.appointments || []
  const visible = filter === 'all' ? appointments : appointments.filter((item) => item.status === filter)

  async function updateStatus(appointment, status) {
    setActionError('')
    try { await api.patch(`/appointments/${appointment._id}/status`, { status }); await reload() }
    catch (requestError) { setActionError(getErrorMessage(requestError, 'Unable to update this appointment.')) }
  }

  return <section className="page-wrap dashboard-wrap"><div className="page-hero page-hero-small"><span className="eyebrow">STUDIO MANAGEMENT</span><h1>Appointment <em>book.</em></h1><p>Review incoming requests and keep visits moving.</p></div>
    <div className="filter-tabs" role="tablist" aria-label="Filter appointments by status">{filters.map((status) => <button key={status} role="tab" aria-selected={filter === status} className={filter === status ? 'is-active' : ''} onClick={() => setFilter(status)}>{status === 'all' ? 'All' : status}</button>)}</div>
    {(error || actionError) && <div className="notice notice-error">{actionError || error}</div>}
    {loading ? <LoadingSpinner label="Loading appointments…" /> : visible.length ? <div className="appointment-list">{visible.map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} onStatus={updateStatus} />)}</div> : <div className="empty-state"><h3>{filter === 'all' ? 'No appointments yet.' : `No ${filter} appointments.`}</h3><p>New appointment requests from customers will appear here.</p></div>}
  </section>
}
