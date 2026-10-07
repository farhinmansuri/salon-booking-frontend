import { Link } from 'react-router-dom'
import ServiceCard from '../components/ServiceCard'
import LoadingSpinner from '../components/LoadingSpinner'
import useApi from '../hooks/useApi'

export default function HomePage() {
  const { data, loading, error } = useApi('/services')
  const services = data?.services?.slice(0, 3) || []
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy"><span className="eyebrow">YOUR NEIGHBORHOOD SALON · EST. 2014</span><h1>Good hair days<br /><em>start here.</em></h1><p>Considered cuts, beautiful color, and a little time that’s just for you.</p><div className="hero-actions"><Link className="button button-dark" to="/services">Explore services <span>↗</span></Link><span className="hero-note">Thoughtfully yours, every time.</span></div></div>
        <div className="hero-art" role="img" aria-label="A softly lit, elegant salon interior"><div className="hero-art-ring" /><div className="hero-art-caption"><span>THE ART OF A GOOD CUT</span><span>01 / 04</span></div><span className="hero-art-serif">elle</span></div>
        <div className="hero-vertical">A LITTLE MORE YOU — SINCE 2014</div>
      </section>
      <section className="intro-strip"><span className="eyebrow">A SALON THAT LISTENS</span><p>From the first consultation to the final finish, we make space for your style, your pace, and the person you’re becoming.</p><Link to="/services" className="arrow-link">Get to know our services <span>↗</span></Link></section>
      <section className="section-wrap featured-section"><div className="section-heading"><div><span className="eyebrow">THE STUDIO MENU</span><h2>Made for your<br /><em>kind of beautiful.</em></h2></div><Link className="arrow-link" to="/services">View all services <span>↗</span></Link></div>
        {loading ? <LoadingSpinner label="Loading services…" /> : error ? <div className="notice notice-error">{error}</div> : services.length ? <div className="service-grid">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div> : <div className="empty-state"><h3>Our menu is being refreshed.</h3><p>Check back soon for available salon services.</p></div>}
      </section>
      <section className="quote-band"><span className="eyebrow">GOOD HAIR, GOOD ENERGY</span><p>“You should leave feeling like the most <em>you</em> version of yourself.”</p><span className="quote-credit">THE STUDIO ELLE PROMISE</span></section>
    </>
  )
}
