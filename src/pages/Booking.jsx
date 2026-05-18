import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ChevronLeft, ChevronRight, Check,
  Calendar, Clock, User, FileText, CheckCircle, X, RefreshCw,
} from 'lucide-react'
import { useDokter } from '../hooks/useDokter'
import { useBooking } from '../hooks/useBooking'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'

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

export default function Booking() {
  const [step, setStep]             = useState(1)
  const [selectedDocId, setDocId]   = useState(null)
  const [selectedDate, setDate]     = useState(null)
  const [selectedTime, setTime]     = useState(null)
  const [calDate, setCalDate]       = useState(new Date())
  const [form, setForm]             = useState({ name: '', nim: '', keluhan: '' })
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
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep(1); setDocId(null); setDate(null); setTime(null)
    setForm({ name: '', nim: '', keluhan: '' }); setSuccess(false); setError('')
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
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Pilih Dokter</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {loadDoctors ? Array(4).fill(0).map((_, i) => <DocCardSkeleton key={i} />) :
                doctors.map(doc => (
                  <button key={doc.id} onClick={() => { setDocId(doc.id); setStep(2) }}
                    className={`card text-left transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${
                      selectedDocId === doc.id ? 'ring-2 ring-primary-400' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar name={doc.name} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm leading-snug">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.specialty}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Stars rating={doc.rating} />
                          <span className="text-xs font-semibold text-gray-700">{doc.rating}</span>
                          <span className="text-xs text-gray-400">({doc.reviews_count} ulasan)</span>
                        </div>
                        <div className="mt-3">
                          <Badge variant="success">Tersedia</Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              }
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
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
                    <Icon size={16} className="mt-0.5 text-primary-500 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-[11px] text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value ?? '—'}</p>
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
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Nama Lengkap *</label>
                  <input className="input-field" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nama sesuai KTM" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">NIM / NPM *</label>
                  <input className="input-field font-mono" required value={form.nim}
                    onChange={e => setForm(f => ({ ...f, nim: e.target.value }))}
                    placeholder="2021050123" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Keluhan (opsional)</label>
                  <textarea className="input-field resize-none" rows={3} value={form.keluhan}
                    onChange={e => setForm(f => ({ ...f, keluhan: e.target.value }))}
                    placeholder="Ceritakan keluhan Anda secara singkat..." />
                </div>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                    <ChevronLeft size={15} />Kembali
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-70">
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
