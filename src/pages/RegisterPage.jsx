import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import useAuth from '../hooks/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'
import { getErrorMessage } from '../utils/format'
import { dashboardPath } from '../utils/auth'
import LoadingSpinner from '../components/LoadingSpinner'

export default function RegisterPage() {
  const { user, ready, register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, control, formState: { errors } } = useForm()
  const password = useWatch({ control, name: 'password' })
  if (!ready) return <LoadingSpinner label="Checking your session…" />
  if (user) return <Navigate to={dashboardPath(user)} replace />

  async function submit(values) {
    setBusy(true); setError('')
    try {
      const newUser = await createAccount({ name: values.name, email: values.email, password: values.password })
      navigate(dashboardPath(newUser), { replace: true })
    }
    catch (requestError) { setError(getErrorMessage(requestError, 'Unable to create your account.')) }
    finally { setBusy(false) }
  }

  return <section className="auth-layout"><div className="auth-aside"><span className="eyebrow">YOUR CHAIR IS WAITING</span><p>A little ritual.<br /><em>A lot of you.</em></p><span className="quote-credit">STUDIO ELLE · YOUR TIME, YOUR STYLE</span></div><div className="auth-form-wrap"><span className="eyebrow">JOIN THE STUDIO</span><h1>Let’s get acquainted.</h1><p className="muted">Create an account to book and manage visits.</p>
    {error && <div className="notice notice-error">{error}</div>}
    <form className="stack-form" onSubmit={handleSubmit(submit)} noValidate>
      <Input label="Your name" autoComplete="name" placeholder="Full name" error={errors.name?.message} {...register('name', { required: 'Name is required.' })} />
      <Input label="Email address" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email', { required: 'Email is required.' })} />
      <Input label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password', { required: 'Password is required.', minLength: { value: 8, message: 'Use at least 8 characters.' } })} />
      <Input label="Confirm password" type="password" autoComplete="new-password" placeholder="Enter it once more" error={errors.confirm?.message} {...register('confirm', { validate: (value) => value === password || 'Passwords do not match.' })} />
      <Button type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span>↗</span></Button>
    </form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </div></section>
}
