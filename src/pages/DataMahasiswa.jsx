import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, ChevronLeft, ChevronRight,
  GraduationCap, AlertCircle, RefreshCw,
  Phone, Mail, MapPin, BookOpen, User,
} from 'lucide-react'
import { getMahasiswa, getMahasiswaById } from '../services/siproService'

const PAGE_SIZE = 10

const PRODI_OPTIONS = [
  'Semua Prodi',
  'Teknik Informatika',
  'Sistem Informasi',
  'Manajemen',
  'Akuntansi',
  'Ilmu Komunikasi',
  'Hukum',
  'Kedokteran',
  'Farmasi',
  'Keperawatan',
]

const SEMESTER_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

const fade = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const modalAnim = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.18 } },
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[40, 100, 130, 110, 80, 90].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-gray-100" style={{ width: `${w}px` }} />
        </td>
      ))}
    </tr>
  )
}

function InitialAvatar({ nama }) {
  const initials = (nama || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-success-400 text-[11px] font-bold text-white">
      {initials}
    </div>
  )
}

function SemesterBadge({ semester }) {
  if (!semester) return <span className="text-gray-400 text-xs">—</span>
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      Sem {semester}
    </span>
  )
}

export default function DataMahasiswa() {
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [prodi, setProdi]           = useState('')
  const [semester, setSemester]     = useState('')
  const [page, setPage]             = useState(1)
  const [mahasiswaList, setList]    = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [selected, setSelected]     = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Debounce search input 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [debouncedSearch, prodi, semester])

  // Fetch data from SIPRO
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    getMahasiswa({
      search: debouncedSearch || undefined,
      prodi: prodi || undefined,
      semester: semester ? Number(semester) : undefined,
    })
      .then(data => { if (!cancelled) setList(Array.isArray(data) ? data : []) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [debouncedSearch, prodi, semester])

  async function handleRowClick(mahasiswa) {
    setSelected({ ...mahasiswa, _loading: true })
    setDetailLoading(true)
    try {
      const detail = await getMahasiswaById(mahasiswa.id)
      setSelected(detail)
    } catch {
      setSelected(mahasiswa)
    } finally {
      setDetailLoading(false)
    }
  }

  function retry() {
    setError('')
    setList([])
    setSearch('')
    setProdi('')
    setSemester('')
  }

  const totalPages = Math.max(1, Math.ceil(mahasiswaList.length / PAGE_SIZE))
  const paged = useMemo(
    () => mahasiswaList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [mahasiswaList, page]
  )

  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Mahasiswa</h1>
          <p className="text-sm text-gray-500">
            Data mahasiswa dari SIPRO · {loading ? '…' : `${mahasiswaList.length} mahasiswa`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <GraduationCap size={12} />
            SIPRO Terintegrasi
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau NIM mahasiswa…"
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={prodi}
          onChange={e => setProdi(e.target.value)}
          className="input-field w-full sm:w-52"
        >
          {PRODI_OPTIONS.map(p => (
            <option key={p} value={p === 'Semua Prodi' ? '' : p}>{p}</option>
          ))}
        </select>
        <select
          value={semester}
          onChange={e => setSemester(e.target.value)}
          className="input-field w-full sm:w-36"
        >
          <option value="">Semua Semester</option>
          {SEMESTER_OPTIONS.filter(s => s > 0).map(s => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="card flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Gagal memuat data</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
          <button onClick={retry} className="btn-primary gap-2">
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">NIM</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Prodi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Fakultas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Semester</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Kontak</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
                  : paged.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <GraduationCap size={32} strokeWidth={1.25} />
                            <p className="text-sm font-medium">Tidak ada mahasiswa ditemukan</p>
                            <p className="text-xs">Coba ubah filter pencarian</p>
                          </div>
                        </td>
                      </tr>
                    )
                    : paged.map(m => (
                      <tr
                        key={m.id}
                        onClick={() => handleRowClick(m)}
                        className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-primary-50/40"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.nim}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <InitialAvatar nama={m.nama} />
                            <span className="font-medium text-gray-900 truncate max-w-[160px]">{m.nama}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-[140px]">
                          <span className="truncate block">{m.prodi || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{m.fakultas || '—'}</td>
                        <td className="px-4 py-3">
                          <SemesterBadge semester={m.semester} />
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{m.email || m.no_hp || '—'}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && mahasiswaList.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, mahasiswaList.length)} dari {mahasiswaList.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-3 text-xs font-medium text-gray-700">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              key="modal"
              variants={modalAnim}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-2xl bg-white shadow-modal">
                {/* Modal header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Detail Mahasiswa</h3>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Modal body */}
                <div className="px-6 py-5 space-y-5">
                  {detailLoading ? (
                    <div className="space-y-3">
                      {[80, 130, 100, 110, 90].map((w, i) => (
                        <div key={i} className="h-5 animate-pulse rounded bg-gray-100" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Avatar + nama */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-success-400 text-xl font-bold text-white">
                          {(selected.nama || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg leading-tight">{selected.nama}</p>
                          <p className="font-mono text-sm text-gray-500 mt-0.5">{selected.nim}</p>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Prodi</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">{selected.prodi || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Semester</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">{selected.semester ? `Semester ${selected.semester}` : '—'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Fakultas</p>
                          <p className="mt-0.5 text-sm font-medium text-gray-800">{selected.fakultas || '—'}</p>
                        </div>
                      </div>

                      {/* Kontak */}
                      <div className="space-y-2.5">
                        {selected.email && (
                          <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                              <Mail size={13} className="text-blue-500" />
                            </div>
                            {selected.email}
                          </div>
                        )}
                        {selected.no_hp && (
                          <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50">
                              <Phone size={13} className="text-green-500" />
                            </div>
                            {selected.no_hp}
                          </div>
                        )}
                        {selected.tanggal_lahir && (
                          <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                              <User size={13} className="text-purple-500" />
                            </div>
                            {new Date(selected.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        )}
                        {selected.alamat && (
                          <div className="flex items-start gap-3 text-sm text-gray-700">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                              <MapPin size={13} className="text-orange-500" />
                            </div>
                            <span className="leading-snug">{selected.alamat}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-gray-100 px-6 py-4">
                  <button
                    onClick={() => setSelected(null)}
                    className="btn-secondary w-full justify-center"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
