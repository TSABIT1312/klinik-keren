import { supabase } from '../lib/supabase'

export async function fetchDokter() {
  const { data, error } = await supabase
    .from('dokter')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function fetchSlotTersedia(dokterId, tanggal) {
  const ALL_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '13:00', '13:30', '14:00', '14:30', '15:00',
  ]

  const { data, error } = await supabase
    .from('booking')
    .select('waktu')
    .eq('dokter_id', dokterId)
    .eq('tanggal', tanggal)
    .neq('status', 'dibatalkan')

  if (error) throw error

  const bookedTimes = new Set((data ?? []).map(b => b.waktu.slice(0, 5)))
  return ALL_SLOTS.map(time => ({ time, full: bookedTimes.has(time) }))
}

export async function fetchDokterStats() {
  const { count, error } = await supabase
    .from('dokter')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
  if (error) throw error
  return count ?? 0
}
