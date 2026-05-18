import { supabase } from '../lib/supabase'

export async function fetchRekamMedisByPasien(pasienId) {
  const { data, error } = await supabase
    .from('rekam_medis')
    .select(`
      *,
      dokter(name, specialty),
      resep(id, obat),
      hasil_lab(id, test_name, result, normal_range, status)
    `)
    .eq('pasien_id', pasienId)
    .order('tanggal', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createRekamMedis(payload) {
  const { data, error } = await supabase
    .from('rekam_medis')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadDokumen(pasienId, rekamMedisId, file) {
  const ext  = file.name.split('.').pop()
  const path = `${pasienId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('dokumen-medis')
    .upload(path, file, { upsert: false })
  if (uploadError) throw uploadError

  const { error: dbError } = await supabase
    .from('dokumen_medis')
    .insert({
      pasien_id:      pasienId,
      rekam_medis_id: rekamMedisId ?? null,
      file_name:      file.name,
      file_path:      path,
      file_size:      file.size,
    })
  if (dbError) throw dbError

  return path
}

export async function fetchDokumenByPasien(pasienId) {
  const { data, error } = await supabase
    .from('dokumen_medis')
    .select('*')
    .eq('pasien_id', pasienId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getFileUrl(path) {
  const { data } = await supabase.storage
    .from('dokumen-medis')
    .createSignedUrl(path, 3600) // 1 hour
  return data?.signedUrl ?? null
}
