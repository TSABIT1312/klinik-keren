import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchPasienStats } from '../services/pasienService'
import { fetchDokterStats } from '../services/dokterService'
import { fetchBookingStats, fetchWeeklyStats, fetchBookingHariIni } from '../services/bookingService'

export function useDashboard() {
  const [stats, setStats]       = useState({ hari_ini: 0, dokter: 0, konsultasi: 0, antrean: 0 })
  const [weekly, setWeekly]     = useState([])
  const [jadwal, setJadwal]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const load = useCallback(async () => {
    try {
      const [pasien, dokter, booking, chart, hariIni] = await Promise.all([
        fetchPasienStats(),
        fetchDokterStats(),
        fetchBookingStats(),
        fetchWeeklyStats(),
        fetchBookingHariIni(),
      ])
      setStats({
        hari_ini:   pasien.hari_ini,
        dokter:     dokter,
        konsultasi: booking.konsultasi,
        antrean:    booking.antrean,
      })
      setWeekly(chart)
      setJadwal(hariIni.slice(0, 3))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pasien' },  load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking' }, load)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [load])

  return { stats, weekly, jadwal, loading, error, refresh: load }
}
