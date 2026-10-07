import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import AuthContext from './authContext'
import { getStoredUser } from '../utils/auth'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const [ready, setReady] = useState(() => !localStorage.getItem('salon-token'))
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('salon-token')
    if (!token) return
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user)
        localStorage.setItem('salon-user', JSON.stringify(data.user))
      })
      .catch(() => {
        localStorage.removeItem('salon-token')
        localStorage.removeItem('salon-user')
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      localStorage.removeItem('salon-token')
      localStorage.removeItem('salon-user')
      setUser(null)
      setSessionExpired(true)
      setReady(true)
    }
    window.addEventListener('salon:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('salon:unauthorized', handleUnauthorized)
  }, [])

  const value = useMemo(() => ({
    user,
    ready,
    sessionExpired,
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('salon-token', data.token)
      localStorage.setItem('salon-user', JSON.stringify(data.user))
      setUser(data.user)
      setSessionExpired(false)
      return data.user
    },
    async register(details) {
      const { data } = await api.post('/auth/register', details)
      localStorage.setItem('salon-token', data.token)
      localStorage.setItem('salon-user', JSON.stringify(data.user))
      setUser(data.user)
      setSessionExpired(false)
      return data.user
    },
    logout() {
      localStorage.removeItem('salon-token')
      localStorage.removeItem('salon-user')
      setUser(null)
      setSessionExpired(false)
    },
  }), [user, ready, sessionExpired])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
