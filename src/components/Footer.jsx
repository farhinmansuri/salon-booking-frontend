import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner"><Link className="brand footer-brand" to="/"><span className="brand-mark">S</span><span>STUDIO <i>ELLE</i></span></Link><p>Thoughtful cuts. Beautifully you.</p><span>© {new Date().getFullYear()} Studio Elle</span></div>
    </footer>
  )
}
