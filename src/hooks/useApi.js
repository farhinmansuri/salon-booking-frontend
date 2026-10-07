import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'
import { getErrorMessage } from '../utils/format'

export default function useApi(path) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(path)
      setData(response.data)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to connect to the salon API.'))
    } finally {
      setLoading(false)
    }
  }, [path])
  useEffect(() => {
    let active = true
    api.get(path)
      .then((response) => { if (active) setData(response.data) })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError, 'Unable to connect to the salon API.')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [path])
  return { data, setData, loading, error, reload }
}
