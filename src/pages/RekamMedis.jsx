import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, ChevronUp, Upload,
  FileText, X, Paperclip, Stethoscope,
  FlaskConical, Pill, User, Download, RefreshCw, AlertCircle,
} from 'lucide-react'
import { usePasien } from '../hooks/usePasien'
import { useRekamMedis } from '../hooks/useRekamMedis'
import { getFileUrl } from '../services/rekamMedisService'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'

const STATUS_MAP = { normal: 'Normal', 'perlu-perhatian': 'Perlu Perhatian', kritis: 'Kritis', selesai: 'Selesai' }

const fade = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function LabTable({ labs }) {
  if (!labs?.length) return null
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            {['Pemeriksaan','Hasil','Normal','Status'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {labs.map((l, i) => (
            <tr key={l.id ?? i} className={i % 2 ? 'bg-gray-50/50' : ''}>
              <td className="px-4 py-2.5 font-medium text-gray-700">{l.test_name}</td>
              <td className="px-4 py-2.5 font-semibold text-gray-900">{l.result}</td>
              <td className="px-4 py-2.5 text-gray-400">{l.normal_range}</td>
              <td className="px-4 py-2.5">
                <Badge variant={l.status}>{STATUS_MAP[l.status] ?? l.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecordCard({ r }) {
  const [open, setOpen] = useState(false)
  const dotColor = {
    kritis:           'bg-danger-500 ring-danger-200',
    'perlu-perhatian':'bg-warning-500 ring-warning-200',
    normal:           'bg-success-500 ring-success-200',
    selesai:          'bg-gray-400 ring-gray-200',
  }[r.status] ?? 'bg-success-500 ring-success-200'

  const formatted = r.tanggal
    ? new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : r.tanggal

  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-5 flex flex-col items-center">
        <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ring-2 ${dotColor}`} />
      </div>
      <div className="card transition-all duration-200 hover:shadow-card-hover">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
              <Stethoscope size={18} className="text-primary-500" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{r.diagnosis}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {r.dokter?.name ?? 'Dokter'} · {r.dokter?.specialty ?? ''}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{formatted}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={r.status}>{STATUS_MAP[r.status] ?? r.status}</Badge>
            <button onClick={() => setOpen(o => !o)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                {r.keluhan && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Keluhan</p>
                    <p className="text-sm text-gray-600">{r.keluhan}</p>
                  </div>
                )}
                {r.resep?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Pill size={12} />Resep Obat
                    </p>
                    <div className="space-y-1.5">
                      {r.resep.map(p => (
                        <div key={p.id} className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                          <span className="text-xs text-success-800">{p.obat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {r.hasil_lab?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <FlaskConical size={12} />Hasil Laboratorium
                    </p>
                    <LabTable labs={r.hasil_lab} />
                  </div>
                )}
                {r.catatan && (
                  <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-500 mb-1">Catatan Dokter</p>
                    <p className="text-sm text-gray-700">{r.catatan}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024)    return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function RekamMedis() {
  const [search, setSearch]       = useState('')
  const [dropOpen, setDropOpen]   = useState(false)
  const [selectedId, setSelected] = useState(null)
  const [dragging, setDragging]   = useState(false)
  const fileRef = useRef(null)

  const { data: patients, loading: loadPasien } = usePasien({ search })
  const patient = selectedId ? patients.find(p => p.id === selectedId) : patients[0]
  const activePasienId = patient?.id ?? null

  const { records, dokumen, loading, uploading, error, upload } = useRekamMedis(activePasienId)

  async function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    for (const file of Array.from(e.dataTransfer.files)) {
      await upload(null, file).catch(console.error)
    }
  }

  async function handleFileInput(e) {
    for (const file of Array.from(e.target.files)) {
      await upload(null, file).catch(console.error)
    }
    e.target.value = ''
  }

  async function downloadFile(path, name) {
    const url = await getFileUrl(path)
    if (!url) return
    const a = document.createElement('a')
    a.href = url; a.download = name; a.click()
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <motion.div variants={fade} initial="hidden" animate="visible" className="hidden lg:block">
        <h1 className="text-xl font-bold text-gray-900">Rekam Medis</h1>
        <p className="mt-0.5 text-sm text-gray-500">Riwayat pemeriksaan dan dokumen kesehatan pasien · real-time</p>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertCircle size={15} />{error}
        </div>
      )}

      {/* Patient selector */}
      <motion.div variants={fade} initial="hidden" animate="visible" className="card !p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Cari pasien..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9" />
          </div>
          <div className="relative">
            <button onClick={() => setDropOpen(o => !o)}
              className="btn-secondary gap-3 min-w-[200px] justify-between">
              <div className="flex items-center gap-2">
                {patient ? <Avatar name={patient.name} size="xs" /> : null}
                <span className="text-sm">{patient?.name ?? 'Pilih pasien'}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {dropOpen && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 rounded-2xl border border-gray-100 bg-white shadow-modal overflow-hidden"
                >
                  <div className="p-2 space-y-0.5 max-h-60 overflow-y-auto">
                    {loadPasien ? (
                      <div className="py-4 text-center text-xs text-gray-400">Memuat...</div>
                    ) : patients.length === 0 ? (
                      <div className="py-4 text-center text-xs text-gray-400">Pasien tidak ditemukan</div>
                    ) : patients.map(p => (
                      <button key={p.id}
                        onClick={() => { setSelected(p.id); setDropOpen(false); setSearch('') }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          activePasienId === p.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Avatar name={p.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-[11px] text-gray-400">{p.nim}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Timeline ── */}
        <motion.div variants={fade} initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
          {patient && (
            <div className="card flex items-center gap-4">
              <Avatar name={patient.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">{patient.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">NIM: {patient.nim}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="primary">{records.length} kunjungan</Badge>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-sm font-semibold text-gray-700 px-1">Riwayat Pemeriksaan</h2>

          <div className="relative space-y-4 border-l-2 border-gray-100 ml-2">
            {!activePasienId ? (
              <div className="pl-8 py-12 text-center text-gray-400">
                <User size={32} strokeWidth={1.25} className="mx-auto mb-2" />
                <p className="text-sm">Pilih pasien untuk melihat rekam medis</p>
              </div>
            ) : loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="pl-8">
                  <div className="card animate-pulse space-y-3">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 rounded bg-gray-200" />
                        <div className="h-3 w-32 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : records.length === 0 ? (
              <div className="pl-8 py-12 text-center text-gray-400">
                <FileText size={32} strokeWidth={1.25} className="mx-auto mb-2" />
                <p className="text-sm">Belum ada rekam medis</p>
              </div>
            ) : records.map(r => <RecordCard key={r.id} r={r} />)
            }
          </div>
        </motion.div>

        {/* ── Upload panel ── */}
        <motion.div variants={fade} initial="hidden" animate="visible" className="space-y-4">
          <div className="card">
            <h2 className="mb-1 text-sm font-semibold text-gray-900">Upload Dokumen</h2>
            <p className="text-xs text-gray-500 mb-4">Upload hasil lab, resep, atau dokumen medis.</p>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer ${
                dragging ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/30'
              }`}
            >
              <div className={`rounded-2xl p-3 transition-colors ${dragging ? 'bg-primary-100' : 'bg-white shadow-card'}`}>
                {uploading
                  ? <RefreshCw size={22} className="text-primary-500 animate-spin" />
                  : <Upload size={22} className={dragging ? 'text-primary-600' : 'text-gray-400'} strokeWidth={1.75} />
                }
              </div>
              <div>
                <p className={`text-sm font-semibold ${dragging ? 'text-primary-700' : 'text-gray-700'}`}>
                  {uploading ? 'Mengupload...' : dragging ? 'Lepaskan file di sini' : 'Klik atau seret file'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG · Maks. 10 MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" multiple className="hidden"
              onChange={handleFileInput} accept=".pdf,.jpg,.jpeg,.png" />

            {/* Uploaded files list */}
            {dokumen.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500">{dokumen.length} dokumen tersimpan</p>
                {dokumen.map(f => (
                  <div key={f.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-card">
                      <Paperclip size={14} className="text-primary-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-800">{f.file_name}</p>
                      <p className="text-[10px] text-gray-400">{formatSize(f.file_size)}</p>
                    </div>
                    <button onClick={() => downloadFile(f.file_path, f.file_name)}
                      className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Ringkasan Pasien</h3>
            {[
              { label: 'Total Kunjungan',   value: records.length,
                icon: User,        color: 'text-primary-500' },
              { label: 'Resep Aktif',       value: records[0]?.resep?.length ?? 0,
                icon: Pill,        color: 'text-success-500' },
              { label: 'Pemeriksaan Lab',   value: records.reduce((a, r) => a + (r.hasil_lab?.length ?? 0), 0),
                icon: FlaskConical, color: 'text-warning-500' },
              { label: 'Dokumen Upload',    value: dokumen.length,
                icon: Paperclip,   color: 'text-violet-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={color} strokeWidth={1.75} />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{loading ? '—' : value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
