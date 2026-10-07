import { formatDate } from '../utils/format'

export default function AppointmentCard({ appointment, onCancel, onStatus }) {
  const service = appointment.service
  const customer = appointment.customer
  return (
    <article className="appointment-card">
      <div className="appointment-date"><span>{formatDate(appointment.appointmentDate)}</span><strong>{appointment.startTime} – {appointment.endTime}</strong></div>
      <div className="appointment-details"><h3>{service?.name || 'Salon service'}</h3><p>{customer?.name ? `${customer.name} · ${customer.email}` : 'Appointment'}{appointment.notes ? ` · ${appointment.notes}` : ''}</p></div>
      <div className="appointment-actions"><span className={`status-pill status-${appointment.status}`}>{appointment.status}</span>
        {onCancel && ['pending', 'confirmed'].includes(appointment.status) && <button className="text-button text-danger" onClick={() => onCancel(appointment)}>Cancel</button>}
        {onStatus && appointment.status === 'pending' && <><button className="text-button" onClick={() => onStatus(appointment, 'confirmed')}>Confirm</button><button className="text-button text-danger" onClick={() => onStatus(appointment, 'rejected')}>Reject</button></>}
        {onStatus && appointment.status === 'confirmed' && <button className="text-button" onClick={() => onStatus(appointment, 'completed')}>Complete</button>}
      </div>
    </article>
  )
}
