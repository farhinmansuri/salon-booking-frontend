import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/format'

export default function ServiceCard({ service, onEdit, onDelete, manage = false }) {
  return (
    <article className="service-card">
      <div className="service-image" style={service.image ? { backgroundImage: `url("${service.image}")` } : undefined}>
        {!service.image && <span className="service-image-monogram">{service.name?.slice(0, 1) || 'S'}</span>}
        <span className="service-duration">{service.duration} min</span>
      </div>
      <div className="service-card-body">
        <div className="service-card-title"><h3>{service.name}</h3><span>{formatPrice(service.price)}</span></div>
        <p>{service.description || 'A considered approach, tailored to you.'}</p>
        {manage ? <div className="card-actions"><button className="text-button" onClick={() => onEdit(service)}>Edit details</button><button className="text-button text-danger" onClick={() => onDelete(service)}>Delete</button></div> : <Link className="service-link" to={`/book?service=${service._id}`}>Book this service <span>↗</span></Link>}
      </div>
    </article>
  )
}
