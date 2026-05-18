import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchSlotTersedia, } from '../services/dokterService'
import { createBooking } from '../services/bookingService'

export function useBooking(dokterId, tanggal) {
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const loadSlots = useCallback(async () => {
    if (!dokterId || !tanggal) return
    setLoading(true)
    try {
      setSlots(await fetchSlotTersedia(dokterId, tanggal))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dokterId, tanggal])

  useEffect(() => {
    loadSlots()

    if (!dokterId || !tanggal) return
    const channel = supabase
      .channel(`booking-slots-${dokterId}-${tanggal}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'booking',
        filter: `dokter_id=eq.${dokterId}`,
      }, loadSlots)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [loadSlots, dokterId, tanggal])

  async function book(payload) {
    const result = await createBooking(payload)
    await loadSlots()
    return result
  }

  return { slots, loading, error, book, refresh: loadSlots }
}
