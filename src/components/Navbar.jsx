import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { dashboardPath } from '../utils/auth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const close = () => setOpen(false)

  function signOut() {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" to="/" onClick={close}><span className="brand-mark">S</span><span>STUDIO <i>ELLE</i></span></Link>
        <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
        <nav className={`main-nav ${open ? 'is-open' : ''}`}>
          <NavLink to="/services" onClick={close}>Services</NavLink>
          {user ? <>
            <NavLink to={dashboardPath(user)} onClick={close}>Dashboard</NavLink>
            {user.role === 'customer' && <NavLink to="/appointments" onClick={close}>My appointments</NavLink>}
            {user.role === 'admin' && <NavLink to="/admin/appointments" onClick={close}>Appointments</NavLink>}
            {user.role === 'admin' && <NavLink to="/admin/services" onClick={close}>Manage services</NavLink>}
            {user.role === 'admin' && <NavLink to="/admin/availability" onClick={close}>Salon hours</NavLink>}
            <span className="nav-user-name">Hi, {user.name}</span>
            <NavLink to="/profile" onClick={close}>Profile</NavLink>
            <button className="nav-signout" onClick={signOut}>Sign out</button>
          </> : <>
            <NavLink to="/login" onClick={close}>Log in</NavLink>
            <Link className="button button-primary nav-cta" to="/register" onClick={close}>Book a visit</Link>
          </>}
        </nav>
      </div>
    </header>
  )
}
