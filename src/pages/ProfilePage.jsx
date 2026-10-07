import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProfilePage() {
  const { data, loading, error } = useApi('/auth/me')
  const user = data?.user
  return <section className="page-wrap dashboard-wrap"><div className="page-hero page-hero-small"><span className="eyebrow">YOUR DETAILS</span><h1>Profile <em>& preferences.</em></h1><p>Your account information from the Studio Elle booking account.</p></div>
    {loading ? <LoadingSpinner label="Loading your profile…" /> : error ? <div className="notice notice-error">{error}</div> : user && <div className="profile-card"><div className="profile-avatar">{user.name?.slice(0, 1).toUpperCase()}</div><div className="profile-fields"><div><span>NAME</span><strong>{user.name}</strong></div><div><span>EMAIL</span><strong>{user.email}</strong></div><div><span>ACCOUNT TYPE</span><strong>{user.role === 'admin' ? 'Studio administrator' : 'Customer'}</strong></div></div></div>}
    <p className="muted profile-note">Need to change your account details? Please contact the studio.</p>
  </section>
}
