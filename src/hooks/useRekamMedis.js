import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { fetchRekamMedisByPasien, uploadDokumen, fetchDokumenByPasien } from '../services/rekamMedisService'

export function useRekamMedis(pasienId) {
  const [records, setRecords]   = useState([])
  const [dokumen, setDokumen]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState(null)

  const load = useCallback(async () => {
    if (!pasienId) return
    setLoading(true)
    try {
      const [recs, docs] = await Promise.all([
        fetchRekamMedisByPasien(pasienId),
        fetchDokumenByPasien(pasienId),
      ])
      setRecords(recs)
      setDokumen(docs)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [pasienId])

  useEffect(() => {
    load()
    if (!pasienId) return
    const channel = supabase
      .channel(`rekam-${pasienId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'rekam_medis',
        filter: `pasien_id=eq.${pasienId}`,
      }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load, pasienId])

  async function upload(rekamMedisId, file) {
    setUploading(true)
    try {
      await uploadDokumen(pasienId, rekamMedisId, file)
      await load()
    } finally {
      setUploading(false)
    }
  }

  return { records, dokumen, loading, uploading, error, upload, refresh: load }
}
