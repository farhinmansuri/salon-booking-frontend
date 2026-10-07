import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import useAuth from '../hooks/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'
import { getErrorMessage } from '../utils/format'
import { dashboardPath } from '../utils/auth'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const { user, ready, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()
  if (!ready) return <LoadingSpinner label="Checking your session…" />
  if (user) return <Navigate to={dashboardPath(user)} replace />

  async function submit(values) {
    setBusy(true); setError('')
    try {
      const authenticatedUser = await login(values)
      const destination = location.state?.from
      navigate(destination ? { pathname: destination.pathname, search: destination.search, hash: destination.hash } : dashboardPath(authenticatedUser), { replace: true })
    } catch (requestError) { setError(getErrorMessage(requestError, 'Unable to sign in.')) }
    finally { setBusy(false) }
  }

  return <section className="auth-layout"><div className="auth-aside"><span className="eyebrow">WELCOME BACK</span><p>Come in as you are.<br /><em>Leave feeling like you.</em></p><span className="quote-credit">STUDIO ELLE · YOUR TIME, YOUR STYLE</span></div><div className="auth-form-wrap"><span className="eyebrow">YOUR STUDIO ACCOUNT</span><h1>Good to see you.</h1><p className="muted">Sign in to manage your appointments.</p>
    {error && <div className="notice notice-error">{error}</div>}
    {location.state?.sessionExpired && <div className="notice notice-error" role="alert">Your session expired. Sign in again to continue.</div>}
    <form className="stack-form" onSubmit={handleSubmit(submit)} noValidate>
      <Input label="Email address" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email', { required: 'Email is required.' })} />
      <Input label="Password" type="password" autoComplete="current-password" placeholder="Your password" error={errors.password?.message} {...register('password', { required: 'Password is required.' })} />
      <Button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span>↗</span></Button>
    </form><p className="auth-switch">New to Studio Elle? <Link to="/register">Create an account</Link></p>
  </div></section>
}
