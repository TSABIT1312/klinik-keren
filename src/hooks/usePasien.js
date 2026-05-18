import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchPasien, createPasien, updatePasien, deletePasien } from '../services/pasienService'

export function usePasien({ search = '', status = 'semua' } = {}) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchPasien({ search, status }))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('pasien-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pasien' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  async function add(payload) {
    const created = await createPasien(payload)
    setData(d => [created, ...d])
    return created
  }

  async function edit(id, payload) {
    const updated = await updatePasien(id, payload)
    setData(d => d.map(p => p.id === id ? updated : p))
    return updated
  }

  async function remove(id) {
    await deletePasien(id)
    setData(d => d.filter(p => p.id !== id))
  }

  return { data, loading, error, add, edit, remove, refresh: load }
}
