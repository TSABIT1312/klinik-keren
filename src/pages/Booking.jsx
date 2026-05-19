import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ChevronLeft, ChevronRight, Check,
  Calendar, Clock, User, FileText, CheckCircle, X, RefreshCw, ChevronDown, Search,
} from 'lucide-react'
import { useDokter } from '../hooks/useDokter'
import { useBooking } from '../hooks/useBooking'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { fetchPasien, updatePasien } from '../services/pasienService'

const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

const fade = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const modalAnim = {
  hidden:  { opacity: 0, scale: 0.95, y: 12 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.2 } },
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12}
          className={i < Math.round(rating) ? 'text-warning-500 fill-warning-500' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

function StepIndicator({ step }) {
  const steps = ['Pilih Dokter', 'Pilih Jadwal', 'Konfirmasi']
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1
        const done = step > n; const current = step === n
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                done ? 'bg-success-500 text-white' : current ? 'bg-primary-500 text-white shadow-md shadow-primary-200' : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? <Check size={14} strokeWidth={2.5} /> : n}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                current ? 'text-primary-600' : done ? 'text-success-600' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mb-5 hidden sm:block h-0.5 w-16 lg:w-24 mx-2 rounded-full transition-all duration-500 ${
                step > n ? 'bg-success-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function DocCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

const statusLabel = { aktif: 'Aktif', menunggu: 'Menunggu', selesai: 'Selesai', kritis: 'Kritis' }
const statusColor  = { aktif: 'bg-blue-100 text-blue-700', menunggu: 'bg-yellow-100 text-yellow-700', selesai: 'bg-green-100 text-green-700', kritis: 'bg-red-100 text-red-700' }

function PasienPicker({ picked, onSelect, onClear }) {
  const [allPasien, setAll]   = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const wrapperRef            = useRef(null)
  const searchRef             = useRef(null)

  function openDropdown() {
    setOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
    if (allPasien.length > 0) return
    setLoading(true)
    fetchPasien({})
      .then(data => setAll(Array.isArray(data) ? data : []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return allPasien
    const q = query.toLowerCase()
    return allPasien.filter(p =>
      p.name.toLowerCase().includes(q) || p.nim.toLowerCase().includes(q)
    )
  }, [allPasien, query])

  function pick(p) { onSelect(p); setOpen(false); setQuery('') }

  if (picked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
        <Avatar name={picked.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{picked.name}</p>
          <p className="text-[11px] text-gray-500">{picked.nim} · {picked.layanan}</p>
          {picked.keluhan && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">"{picked.keluhan}"</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[picked.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {statusLabel[picked.status] ?? picked.status}
        </span>
        {onClear && (
          <button type="button" onClick={onClear}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button type="button" onClick={openDropdown}
        className="input-field flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2 text-gray-400">
          <User size={14} />
          <span className="text-sm">Pilih pasien terdaftar...</span>
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-modal overflow-hidden"
          >
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input ref={searchRef} type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Cari nama atau NIM..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-primary-400 focus:bg-white"
                />
              </div>
            </div>
            <ul className="max-h-60 overflow-y-auto py-1">
              {loading ? (
                <li className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                  <RefreshCw size={14} className="animate-spin" /> Memuat data pasien...
                </li>
              ) : filtered.length === 0 ? (
                <li className="py-6 text-center text-sm text-gray-400">
                  {query ? 'Pasien tidak ditemukan' : 'Belum ada pasien terdaftar'}
                </li>
              ) : filtered.map(p => (
                <li key={p.id}>
                  <button type="button" onMouseDown={() => pick(p)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-primary-50 transition-colors"
                  >
                    <Avatar name={p.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.nim} · {p.layanan}</p>
                      {p.keluhan && (
                        <p className="text-[11px] text-gray-300 truncate">"{p.keluhan}"</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {!loading && allPasien.length > 0 && (
              <div className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-400">
                {filtered.length} dari {allPasien.length} pasien terdaftar
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Booking() {
  const [step, setStep]             = useState(1)
  const [selectedDocId, setDocId]   = useState(null)
  const [selectedDate, setDate]     = useState(null)
  const [selectedTime, setTime]     = useState(null)
  const [calDate, setCalDate]       = useState(new Date())
  const [form, setForm]             = useState({ name: '', nim: '', keluhan: '' })
  const [pickedMhs, setPickedMhs]   = useState(null)
  const [showSuccess, setSuccess]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setError]     = useState('')

  const { data: doctors, loading: loadDoctors } = useDokter()
  const selectedDoc = doctors.find(d => d.id === selectedDocId)

  const tanggalStr = selectedDate
    ? `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : null

  const { slots, loading: loadSlots, book } = useBooking(selectedDocId, tanggalStr)

  const year  = calDate.getFullYear()
  const month = calDate.getMonth()
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today       = new Date(); today.setHours(0, 0, 0, 0)

  const calGrid = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  function isAvail(day) {
    if (!day) return false
    const d = new Date(year, month, day)
    return d >= today && d.getDay() !== 0 && d.getDay() !== 6
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await book({
        dokter_id:   selectedDocId,
        tanggal:     tanggalStr,
        waktu:       selectedTime + ':00',
        nama_pasien: form.name,
        nim_pasien:  form.nim,
        keluhan:     form.keluhan,
        status:      'menunggu',
      })
      if (pickedMhs?.id) await updatePasien(pickedMhs.id, { status: 'aktif' })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep(1); setDocId(null); setDate(null); setTime(null)
    setForm({ name: '', nim: '', keluhan: '' }); setPickedMhs(null); setSuccess(false); setError('')
  }

  const dateLabel = tanggalStr
    ? `${selectedDate} ${MONTHS[month]} ${year}`
    : null

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <motion.div variants={fade} initial="hidden" animate="visible" className="hidden lg:block">
        <h1 className="text-xl font-bold text-gray-900">Booking Konsultasi</h1>
        <p className="mt-0.5 text-sm text-gray-500">Buat janji konsultasi dengan tenaga medis klinik · real-time</p>
      </motion.div>

      <motion.div variants={fade} initial="hidden" animate="visible" className="card flex justify-center !py-5">
        <StepIndicator step={step} />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Step 1 ── */}
        {step === 1 && (
          <motion.div key="s1" variants={fade} initial="hidden" animate="visible" exit="hidden">
            <div className="card max-w-lg mx-auto space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Pilih Dokter</h2>
                <p className="mt-0.5 text-xs text-gray-400">Pilih tenaga medis yang ingin dikonsultasikan</p>
              </div>

              {loadDoctors ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {doctors.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setDocId(doc.id); setStep(2) }}
                      className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 hover:border-primary-300 hover:bg-primary-50 ${
                        selectedDocId === doc.id
                          ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-300'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Avatar name={doc.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.specialty}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1">
                          <Stars rating={doc.rating} />
                          <span className="text-xs font-semibold text-gray-600">{doc.rating}</span>
                        </div>
                        <Badge variant="success">Tersedia</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <motion.div key="s2" variants={fade} initial="hidden" animate="visible" exit="hidden">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Calendar */}
              <div className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Pilih Tanggal</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCalDate(new Date(year, month - 1, 1))}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-semibold text-gray-700 w-28 text-center">
                      {MONTHS[month]} {year}
                    </span>
                    <button onClick={() => setCalDate(new Date(year, month + 1, 1))}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calGrid.map((day, i) => {
                    if (!day) return <div key={`e${i}`} />
                    const avail = isAvail(day)
                    const isSel = selectedDate === day
                    const isToday = new Date(year, month, day).toDateString() === today.toDateString()
                    return (
                      <button key={day} disabled={!avail}
                        onClick={() => { setDate(day); setTime(null) }}
                        className={`aspect-square rounded-xl text-xs font-medium transition-all duration-150 ${
                          isSel     ? 'bg-primary-500 text-white shadow-sm' :
                          isToday && avail ? 'border-2 border-primary-300 text-primary-700 hover:bg-primary-50' :
                          avail     ? 'hover:bg-primary-50 hover:text-primary-700 text-gray-700' :
                          'text-gray-300 cursor-not-allowed'
                        }`}
                      >{day}</button>
                    )
                  })}
                </div>
                {selectedDate && (
                  <p className="mt-3 text-xs text-center text-primary-600 font-medium">
                    Dipilih: {dateLabel}
                  </p>
                )}
              </div>

              {/* Time slots */}
              <div className="card">
                <h2 className="mb-4 text-sm font-semibold text-gray-900">Pilih Waktu</h2>
                {!selectedDate ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Calendar size={32} strokeWidth={1.25} className="mb-2" />
                    <p className="text-sm">Pilih tanggal terlebih dahulu</p>
                  </div>
                ) : loadSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array(12).fill(0).map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map(({ time, full }) => (
                        <button key={time} disabled={full}
                          onClick={() => setTime(time)}
                          className={`rounded-xl py-2.5 text-xs font-semibold transition-all duration-150 ${
                            selectedTime === time
                              ? 'bg-primary-500 text-white shadow-sm'
                              : full
                              ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                              : 'bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-700 border border-transparent hover:border-primary-200'
                          }`}
                        >{time}</button>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-4 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary-500 inline-block" />Dipilih</span>
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gray-50 border border-gray-200 inline-block" />Tersedia</span>
                      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gray-50 inline-block" />Penuh</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ChevronLeft size={15} />Kembali
              </button>
              <button disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)} className="btn-primary disabled:opacity-40">
                Lanjutkan<ChevronRight size={15} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <motion.div key="s3" variants={fade} initial="hidden" animate="visible" exit="hidden">
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="card lg:col-span-2 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Ringkasan Booking</h2>
                {[
                  { icon: User,     label: 'Dokter',  value: selectedDoc?.name },
                  { icon: Calendar, label: 'Tanggal', value: dateLabel },
                  { icon: Clock,    label: 'Waktu',   value: selectedTime },
                  { icon: FileText, label: 'Layanan', value: selectedDoc?.specialty },
                  { icon: FileText, label: 'Keluhan', value: form.keluhan || null },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
                    <Icon size={16} className="mt-0.5 text-primary-500 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-[11px] text-gray-400">{label}</p>
                      <p className={`text-sm mt-0.5 ${value ? 'font-semibold text-gray-800' : 'italic text-gray-400'}`}>
                        {value ?? 'Tidak ada keluhan'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="card lg:col-span-3 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Data Pasien</h2>
                {submitError && (
                  <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs text-danger-700">
                    <X size={14} />{submitError}
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Pasien *</label>
                  <PasienPicker
                    picked={pickedMhs}
                    onSelect={p => {
                      setPickedMhs(p)
                      setForm(f => ({ ...f, name: p.name, nim: p.nim, keluhan: p.keluhan ?? '' }))
                    }}
                    onClear={() => {
                      setPickedMhs(null)
                      setForm(f => ({ ...f, name: '', nim: '', keluhan: '' }))
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Keluhan</label>
                  <textarea className="input-field resize-none" rows={3} value={form.keluhan}
                    onChange={e => setForm(f => ({ ...f, keluhan: e.target.value }))}
                    placeholder="Keluhan pasien..." />
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                    <ChevronLeft size={15} />Kembali
                  </button>
                  <button type="submit" disabled={submitting || !pickedMhs} className="btn-primary disabled:opacity-70">
                    {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={15} />}
                    Konfirmasi Booking
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
            <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit"
              className="card shadow-modal w-full max-w-sm text-center"
            >
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success-50">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                  <CheckCircle size={44} className="text-success-500" strokeWidth={1.75} />
                </motion.div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Booking Berhasil!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Janji konsultasi Anda dengan <strong className="text-gray-700">{selectedDoc?.name}</strong> telah disimpan ke database.
              </p>
              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-left space-y-2">
                {[
                  { label: 'Pasien',  value: form.name },
                  { label: 'Tanggal', value: dateLabel },
                  { label: 'Waktu',   value: selectedTime },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">Harap datang 10 menit sebelum jadwal konsultasi.</p>
              <button onClick={reset} className="btn-primary mt-5 w-full justify-center">Booking Baru</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
