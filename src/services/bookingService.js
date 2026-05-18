import { supabase } from '../lib/supabase'

export async function fetchBookingHariIni() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('booking')
    .select('*, dokter(name, specialty)')
    .eq('tanggal', today)
    .order('waktu')
  if (error) throw error
  return data ?? []
}

export async function fetchBookingStats() {
  const today = new Date().toISOString().split('T')[0]
  const [konsultasi, antrean] = await Promise.all([
    supabase.from('booking').select('id', { count: 'exact', head: true })
      .eq('tanggal', today).eq('status', 'dikonfirmasi'),
    supabase.from('booking').select('id', { count: 'exact', head: true })
      .eq('tanggal', today).eq('status', 'menunggu'),
  ])
  return {
    konsultasi: konsultasi.count ?? 0,
    antrean:    antrean.count    ?? 0,
  }
}

export async function createBooking(payload) {
  const { data, error } = await supabase
    .from('booking')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBookingStatus(id, status) {
  const { error } = await supabase
    .from('booking')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function fetchWeeklyStats() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const [pasienRes, bookingRes] = await Promise.all([
    supabase.from('pasien').select('tanggal').in('tanggal', days),
    supabase.from('booking').select('tanggal, status').in('tanggal', days),
  ])

  const LABEL = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

  return days.map(date => {
    const d = new Date(date)
    return {
      day:          LABEL[d.getDay()],
      kunjungan:   (pasienRes.data ?? []).filter(p => p.tanggal === date).length,
      konsultasi:  (bookingRes.data ?? []).filter(b => b.tanggal === date && b.status === 'dikonfirmasi').length,
    }
  })
}
