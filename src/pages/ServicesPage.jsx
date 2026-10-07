import { useState } from 'react'
import ServiceCard from '../components/ServiceCard'
import LoadingSpinner from '../components/LoadingSpinner'
import useApi from '../hooks/useApi'

export default function ServicesPage() {
  const [query, setQuery] = useState('')
  const { data, loading, error } = useApi('/services')
  const services = (data?.services || []).filter((service) => `${service.name} ${service.description}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="page-wrap">
      <div className="page-hero"><span className="eyebrow">THE STUDIO MENU</span><h1>Find your <em>feel-good.</em></h1><p>Every appointment begins with a conversation. We’ll make a plan that fits you.</p></div>
      <div className="list-toolbar"><span>{loading ? 'Loading menu' : `${services.length} ${services.length === 1 ? 'service' : 'services'}`}</span><input aria-label="Search services" placeholder="Find a service" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      {loading ? <LoadingSpinner label="Loading services…" /> : error ? <div className="notice notice-error">{error}</div> : services.length ? <div className="service-grid service-grid-large">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div> : <div className="empty-state"><h3>{query ? 'No matching services.' : 'No services are available right now.'}</h3><p>{query ? 'Try another search.' : 'Please check back soon.'}</p></div>}
    </section>
  )
}
