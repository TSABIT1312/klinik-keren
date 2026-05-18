import { supabase } from '../lib/supabase'

export async function fetchPasien({ search = '', status = 'semua' } = {}) {
  let query = supabase
    .from('pasien')
    .select('*')
    .order('created_at', { ascending: false })

  if (status !== 'semua') query = query.eq('status', status)
  if (search) query = query.or(`name.ilike.%${search}%,nim.ilike.%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createPasien(payload) {
  const { data, error } = await supabase
    .from('pasien')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePasien(id, payload) {
  const { data, error } = await supabase
    .from('pasien')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePasien(id) {
  const { error } = await supabase.from('pasien').delete().eq('id', id)
  if (error) throw error
}

export async function fetchPasienStats() {
  const today = new Date().toISOString().split('T')[0]

  const [total, hari_ini, antrean] = await Promise.all([
    supabase.from('pasien').select('id', { count: 'exact', head: true }),
    supabase.from('pasien').select('id', { count: 'exact', head: true }).eq('tanggal', today),
    supabase.from('pasien').select('id', { count: 'exact', head: true }).eq('status', 'menunggu'),
  ])

  return {
    total:    total.count  ?? 0,
    hari_ini: hari_ini.count ?? 0,
    antrean:  antrean.count  ?? 0,
  }
}
