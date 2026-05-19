const BASE_URL = import.meta.env.VITE_SIPRO_URL || 'https://sipro-three.vercel.app'
const ADMIN_EMAIL = import.meta.env.VITE_SIPRO_ADMIN_EMAIL
const ADMIN_PASSWORD = import.meta.env.VITE_SIPRO_ADMIN_PASSWORD
const TOKEN_KEY = 'sipro_token'

async function getToken() {
  const cached = sessionStorage.getItem(TOKEN_KEY)
  if (cached) return cached

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })

  if (!res.ok) throw new Error('Gagal autentikasi ke SIPRO. Periksa konfigurasi kredensial.')

  const { token } = await res.json()
  sessionStorage.setItem(TOKEN_KEY, token)
  return token
}

async function siproFetch(path, options = {}) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (res.status === 401) {
    sessionStorage.removeItem(TOKEN_KEY)
    throw new Error('Sesi SIPRO habis. Refresh halaman untuk mencoba lagi.')
  }

  if (!res.ok) throw new Error(`Gagal mengambil data dari SIPRO (${res.status})`)
  return res.json()
}

export function getMahasiswa(params = {}) {
  const q = new URLSearchParams()
  if (params.search) q.set('search', params.search)
  if (params.prodi) q.set('prodi', params.prodi)
  if (params.semester) q.set('semester', String(params.semester))
  const qs = q.toString()
  return siproFetch(`/api/mahasiswa${qs ? `?${qs}` : ''}`)
}

export function getMahasiswaById(id) {
  return siproFetch(`/api/mahasiswa/${id}`)
}
