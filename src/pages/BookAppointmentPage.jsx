import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import useApi from '../hooks/useApi'
import api from '../services/api'
import Input from '../components/Input'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatPrice, getErrorMessage } from '../utils/format'

function salonDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

export default function BookAppointmentPage() {
  const { data, loading: servicesLoading, error: servicesError } = useApi('/services')
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [busy, setBusy] = useState(false)
  const [availability, setAvailability] = useState({ key: '', times: [], error: '' })
  const [availabilityRequest, setAvailabilityRequest] = useState(0)
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: { service: params.get('service') || '', appointmentDate: '', startTime: '', notes: '' },
  })
  const serviceId = useWatch({ control, name: 'service' })
  const appointmentDate = useWatch({ control, name: 'appointmentDate' })
  const services = data?.services || []
  const availabilityKey = serviceId && appointmentDate ? `${serviceId}:${appointmentDate}` : ''
  const availabilityIsCurrent = availability.key === availabilityKey
  const availabilityLoading = Boolean(availabilityKey) && !availabilityIsCurrent
  const availableTimes = availabilityIsCurrent ? availability.times : []
  const availabilityError = availabilityIsCurrent ? availability.error : ''

  useEffect(() => {
    if (!availabilityKey) return undefined
    const [service, date] = availabilityKey.split(':')
    const controller = new AbortController()
    api.get('/appointments/availability', {
      params: { service, date },
      signal: controller.signal,
    }).then(({ data: response }) => {
      setAvailability({ key: availabilityKey, times: response.availableTimes || [], error: '' })
    }).catch((requestError) => {
      if (requestError.code === 'ERR_CANCELED') return
      setAvailability({
        key: availabilityKey,
        times: [],
        error: getErrorMessage(requestError, 'Could not load available times.'),
      })
    })
    return () => controller.abort()
  }, [availabilityKey, availabilityRequest])

  async function submit(values) {
    setBusy(true)
    setSubmitError('')
    try {
      await api.post('/appointments', {
        service: values.service,
        appointmentDate: values.appointmentDate,
        startTime: values.startTime,
        notes: values.notes || '',
      })
      navigate('/appointments', { state: { notice: 'Your appointment request has been sent.' } })
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setSubmitError('That time was just booked. Choose another available time and try again.')
        setAvailability((current) => ({ ...current, key: '' }))
        setAvailabilityRequest((current) => current + 1)
      } else if (requestError.response?.status === 401) {
        setSubmitError('Your session expired. Please sign in again to finish booking.')
      } else if (requestError.response?.status === 400) {
        setSubmitError(getErrorMessage(requestError, 'Check the date and time, then try again.'))
      } else {
        setSubmitError(getErrorMessage(requestError, 'Unable to send your appointment request.'))
      }
    } finally {
      setBusy(false)
    }
  }

  const serviceField = register('service', { required: 'Choose a service.' })
  const dateField = register('appointmentDate', { required: 'Choose a date.' })
  const timeField = register('startTime', {
    required: 'Choose an available time.',
    validate: (value) => availableTimes.includes(value) || 'Choose one of the currently available times.',
  })

  return <section className="page-wrap booking-wrap">
    <div className="page-hero page-hero-small"><span className="eyebrow">MAKE IT YOURS</span><h1>Let’s find your <em>time.</em></h1><p>Choose a service and an available time. The studio will confirm your appointment shortly.</p></div>
    <div className="booking-grid">
      <div className="booking-aside"><span className="eyebrow">A NOTE FROM US</span><h2>Good things<br />take a little <em>time.</em></h2><p>Your appointment starts as a request. We’ll confirm it with you as soon as we can.</p><p className="muted">Appointments are shown in Asia/Kolkata time, 09:00–18:00.</p><Link className="text-link" to="/services">Looking for a service? Browse the menu ↗</Link></div>
      <div className="form-panel">
        {servicesError && <div className="notice notice-error">{servicesError}</div>}
        {submitError && <div className="notice notice-error" role="alert">{submitError}</div>}
        {servicesLoading ? <LoadingSpinner label="Loading service menu…" /> : services.length === 0 ? <div className="empty-state"><h3>No services are available to book.</h3><p>Please check back soon.</p></div> : <form className="stack-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="field"><label htmlFor="service">1. Choose a service</label><select id="service" aria-invalid={Boolean(errors.service)} {...serviceField} onChange={(event) => { serviceField.onChange(event); setValue('startTime', '') }}><option value="">Choose a service</option>{services.map((service) => <option value={service._id} key={service._id}>{service.name} · {formatPrice(service.price)} · {service.duration} min</option>)}</select>{errors.service && <span className="field-error">{errors.service.message}</span>}</div>
          <Input label="2. Choose a date" type="date" min={salonDateString()} disabled={!serviceId} error={errors.appointmentDate?.message} {...dateField} onChange={(event) => { dateField.onChange(event); setValue('startTime', '') }} />
          <div className="field"><label htmlFor="startTime">3. Available start time</label><select id="startTime" disabled={!availabilityKey || availabilityLoading || Boolean(availabilityError) || !availableTimes.length} aria-invalid={Boolean(errors.startTime)} {...timeField}><option value="">{availabilityLoading ? 'Checking availability…' : !availabilityKey ? 'Choose a service and date first' : availabilityError ? 'Availability could not be loaded' : availableTimes.length ? 'Choose a time' : 'No times available on this date'}</option>{availableTimes.map((time) => <option key={time} value={time}>{time}</option>)}</select>{availabilityLoading && <span className="field-hint">Checking the live appointment schedule…</span>}{availabilityError && <span className="field-error" role="alert">{availabilityError}</span>}{errors.startTime && <span className="field-error">{errors.startTime.message}</span>}{availabilityKey && !availabilityLoading && !availabilityError && !availableTimes.length && availabilityIsCurrent && <span className="field-hint">Try another date. Cancelled and rejected appointments do not block a time.</span>}</div>
          <div className="field"><label htmlFor="notes">4. Notes <span className="optional-label">Optional</span></label><textarea id="notes" rows="4" placeholder="Share a little about what you have in mind" {...register('notes', { maxLength: { value: 500, message: 'Keep your note under 500 characters.' } })} />{errors.notes && <span className="field-error">{errors.notes.message}</span>}</div>
          <Button type="submit" disabled={busy || availabilityLoading || !availabilityIsCurrent || !availableTimes.length}>{busy ? 'Sending request…' : 'Request appointment'} <span>↗</span></Button>
        </form>}
      </div>
    </div>
  </section>
}
