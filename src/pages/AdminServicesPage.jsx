import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import useApi from '../hooks/useApi'
import api from '../services/api'
import ServiceCard from '../components/ServiceCard'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { getErrorMessage } from '../utils/format'

function ServiceForm({ service, onSave, busy }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  useEffect(() => { reset(service || { name: '', description: '', duration: '', price: '', image: '', isActive: true }) }, [service, reset])
  return <form className="stack-form modal-form" onSubmit={handleSubmit(onSave)} noValidate>
    <Input label="Service name" error={errors.name?.message} {...register('name', { required: 'Name is required.' })} />
    <div className="field"><label htmlFor="description">Description</label><textarea id="description" rows="3" {...register('description')} /></div>
    <div className="form-row"><Input label="Duration (minutes)" type="number" min="1" step="1" error={errors.duration?.message} {...register('duration', { required: 'Duration is required.', valueAsNumber: true, min: { value: 1, message: 'Must be at least 1 minute.' }, validate: (value) => Number.isInteger(value) || 'Use a whole number of minutes.' })} /><Input label="Price (INR)" type="number" min="0" step="1" error={errors.price?.message} {...register('price', { required: 'Price is required.', valueAsNumber: true, min: { value: 0, message: 'Price cannot be negative.' } })} /></div>
    <Input label="Image URL" type="url" placeholder="https://…" {...register('image')} />
    <Button type="submit" disabled={busy}>{busy ? 'Saving…' : service ? 'Save changes' : 'Add service'} <span>↗</span></Button>
  </form>
}

export default function AdminServicesPage() {
  const { data, loading, error, reload } = useApi('/services')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const services = data?.services || []

  function startCreate() { setSelected(null); setNotice(''); setActionError(''); setModalOpen(true) }
  function startEdit(service) { setSelected(service); setNotice(''); setActionError(''); setModalOpen(true) }

  async function save(values) {
    setBusy(true); setActionError('')
    const payload = { ...values, duration: Number(values.duration), price: Number(values.price), isActive: selected?.isActive ?? true }
    try {
      if (selected) await api.put(`/services/${selected._id}`, payload)
      else await api.post('/services', payload)
      setModalOpen(false); setNotice(selected ? 'Service updated.' : 'Service added.'); await reload()
    } catch (requestError) { setActionError(getErrorMessage(requestError, 'Unable to save this service.')) }
    finally { setBusy(false) }
  }

  async function deleteService(service) {
    if (!window.confirm(`Delete “${service.name}”? This cannot be undone.`)) return
    setActionError(''); setNotice('')
    try { await api.delete(`/services/${service._id}`); setNotice('Service deleted.'); await reload() }
    catch (requestError) { setActionError(getErrorMessage(requestError, 'Unable to delete this service.')) }
  }

  return <section className="page-wrap dashboard-wrap"><div className="page-hero page-hero-small admin-title-row"><div><span className="eyebrow">STUDIO MANAGEMENT</span><h1>Service <em>menu.</em></h1><p>Manage the services customers can browse and book.</p></div><Button onClick={startCreate}>Add a service <span>＋</span></Button></div>
    {notice && <div className="notice notice-success">{notice}</div>}{(error || actionError) && <div className="notice notice-error">{actionError || error}</div>}
    {loading ? <LoadingSpinner label="Loading services…" /> : services.length ? <div className="service-grid service-grid-large">{services.map((service) => <ServiceCard key={service._id} service={service} manage onEdit={startEdit} onDelete={deleteService} />)}</div> : <div className="empty-state"><h3>No active services.</h3><p>Add a service to make it available in the public menu.</p><Button onClick={startCreate}>Add a service</Button></div>}
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit service' : 'Add a service'}>{actionError && <div className="notice notice-error">{actionError}</div>}<ServiceForm key={selected?._id || 'new'} service={selected} onSave={save} busy={busy} /></Modal>
  </section>
}
