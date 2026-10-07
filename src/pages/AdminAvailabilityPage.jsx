import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import useApi from '../hooks/useApi'
import api from '../services/api'
import Button from '../components/Button'
import Input from '../components/Input'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import { getErrorMessage } from '../utils/format'

const WEEKDAYS = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
]

function formatHours(entry) {
  if (!entry.isOpen) return 'Closed'
  const hours = `${entry.openingTime} – ${entry.closingTime}`
  return entry.breakStart && entry.breakEnd
    ? `${hours} · Break ${entry.breakStart}–${entry.breakEnd}`
    : hours
}

function AvailabilityForm({ entry, onSave, busy }) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm()
  const isOpen = useWatch({ control, name: 'isOpen' })

  useEffect(() => {
    reset(entry ? {
      dayOfWeek: entry.dayOfWeek,
      isOpen: entry.isOpen,
      openingTime: entry.openingTime || '',
      closingTime: entry.closingTime || '',
      breakStart: entry.breakStart || '',
      breakEnd: entry.breakEnd || '',
    } : {
      dayOfWeek: 'monday',
      isOpen: true,
      openingTime: '',
      closingTime: '',
      breakStart: '',
      breakEnd: '',
    })
  }, [entry, reset])

  return <form className="stack-form availability-form" onSubmit={handleSubmit(onSave)} noValidate>
    <div className="field">
      <label htmlFor="dayOfWeek">Day of week</label>
      <select id="dayOfWeek" {...register('dayOfWeek', { required: 'Choose a weekday.' })}>
        {WEEKDAYS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {errors.dayOfWeek && <span className="field-error">{errors.dayOfWeek.message}</span>}
    </div>

    <label className="availability-open-toggle">
      <input type="checkbox" {...register('isOpen')} />
      <span><strong>Salon is open</strong><small>Turn this off to close this weekday.</small></span>
    </label>

    {isOpen && <>
      <div className="form-row">
        <Input label="Opening time" type="time" error={errors.openingTime?.message} {...register('openingTime', { required: 'Opening time is required.' })} />
        <Input label="Closing time" type="time" error={errors.closingTime?.message} {...register('closingTime', { required: 'Closing time is required.' })} />
      </div>
      <div className="availability-break-heading"><span>Break period</span><span>Optional</span></div>
      <div className="form-row">
        <Input label="Break starts" type="time" error={errors.breakStart?.message} {...register('breakStart', { validate: (value, values) => Boolean(value) === Boolean(values.breakEnd) || 'Enter both break times, or leave both empty.' })} />
        <Input label="Break ends" type="time" error={errors.breakEnd?.message} {...register('breakEnd', { validate: (value, values) => Boolean(value) === Boolean(values.breakStart) || 'Enter both break times, or leave both empty.' })} />
      </div>
    </>}

    <Button type="submit" disabled={busy}>{busy ? 'Saving…' : entry?._id ? 'Save availability' : 'Add availability'}</Button>
  </form>
}

export default function AdminAvailabilityPage() {
  const { data, loading, error, reload } = useApi('/availability')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const availability = data?.availability || []
  const availabilityByDay = new Map(availability.map((entry) => [entry.dayOfWeek, entry]))

  function openCreate(dayOfWeek) {
    setSelected(dayOfWeek ? { dayOfWeek, isOpen: true } : null)
    setNotice('')
    setActionError('')
    setModalOpen(true)
  }

  function openEdit(entry) {
    setSelected(entry)
    setNotice('')
    setActionError('')
    setModalOpen(true)
  }

  async function save(values) {
    setBusy(true)
    setActionError('')
    const payload = {
      ...values,
      openingTime: values.openingTime || null,
      closingTime: values.closingTime || null,
      breakStart: values.breakStart || null,
      breakEnd: values.breakEnd || null,
    }

    try {
      if (selected?._id) {
        await api.put(`/availability/${selected._id}`, payload)
      } else {
        await api.post('/availability', payload)
      }
      setModalOpen(false)
      setNotice(selected?._id ? 'Availability updated.' : 'Availability added.')
      await reload()
    } catch (requestError) {
      setActionError(getErrorMessage(requestError, 'Unable to save this availability.'))
    } finally {
      setBusy(false)
    }
  }

  async function deleteEntry(entry) {
    if (!window.confirm(`Delete ${entry.dayOfWeek} availability?`)) return
    setActionError('')
    setNotice('')
    try {
      await api.delete(`/availability/${entry._id}`)
      setNotice(`${entry.dayOfWeek[0].toUpperCase()}${entry.dayOfWeek.slice(1)} availability deleted.`)
      await reload()
    } catch (requestError) {
      setActionError(getErrorMessage(requestError, 'Unable to delete this availability.'))
    }
  }

  return <section className="page-wrap dashboard-wrap">
    <div className="page-hero page-hero-small admin-title-row">
      <div><span className="eyebrow">STUDIO MANAGEMENT</span><h1>Weekly <em>hours.</em></h1><p>Set the salon’s working days, opening hours, and break periods.</p></div>
      <Button disabled={availability.length === WEEKDAYS.length} onClick={() => openCreate(WEEKDAYS.find(([day]) => !availabilityByDay.has(day))?.[0])}>Add a day <span>＋</span></Button>
    </div>

    {notice && <div className="notice notice-success" role="status">{notice}</div>}
    {(error || actionError) && <div className="notice notice-error" role="alert">{actionError || error}</div>}

    {loading ? <LoadingSpinner label="Loading weekly availability…" /> : error && !data ? null : <div className="availability-list">
      {WEEKDAYS.map(([day, label]) => {
        const entry = availabilityByDay.get(day)
        return <article className={`availability-row ${entry && !entry.isOpen ? 'availability-row-closed' : ''}`} key={day}>
          <div className="availability-day"><span className="availability-day-index">{String(WEEKDAYS.findIndex(([value]) => value === day) + 1).padStart(2, '0')}</span><h2>{label}</h2></div>
          <div className={`availability-hours ${entry?.isOpen ? '' : 'availability-hours-closed'}`}>{entry ? formatHours(entry) : <span className="availability-unset">Not configured</span>}</div>
          <div className="availability-actions">{entry ? <><button className="text-button" onClick={() => openEdit(entry)}>Edit</button><button className="text-button text-danger" onClick={() => deleteEntry(entry)}>Delete</button></> : <button className="text-button" onClick={() => openCreate(day)}>Add hours</button>}</div>
        </article>
      })}
      {!availability.length && !error && <p className="availability-empty-note">No weekly hours are configured yet. Add hours for each day the salon is open.</p>}
    </div>}

    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected?._id ? 'Edit weekly hours' : 'Add weekly hours'}>
      {actionError && <div className="notice notice-error" role="alert">{actionError}</div>}
      <AvailabilityForm key={selected?._id || selected?.dayOfWeek || 'new'} entry={selected} onSave={save} busy={busy} />
    </Modal>
  </section>
}
