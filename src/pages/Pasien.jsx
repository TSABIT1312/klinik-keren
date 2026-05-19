import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, AlertCircle, RefreshCw,
  GraduationCap,
} from 'lucide-react'
import { usePasien } from '../hooks/usePasien'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import MahasiswaPicker from '../components/ui/MahasiswaPicker'

const LAYANAN  = ['Konsultasi Umum', 'Kesehatan Gigi', 'Psikologi & Konseling', 'Pemeriksaan Lab']
const STATUSES = ['semua', 'aktif', 'menunggu', 'selesai', 'kritis']
const PAGE_SIZE = 8

const statusLabel = { aktif: 'Aktif', menunggu: 'Menunggu', selesai: 'Selesai', kritis: 'Kritis' }

const emptyForm = { name: '', nim: '', hp: '', layanan: LAYANAN[0], tanggal: '', status: 'menunggu', keluhan: '' }

const fade = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const modalAnim = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.18 } },
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {Array(7).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-gray-100" style={{ width: `${[20, 120, 70, 90, 70, 60, 40][i]}px` }} />
        </td>
      ))}
    </tr>
  )
}

export default function Pasien() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('semua')
  const [page, setPage]           = useState(1)
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [editId, setEditId]       = useState(null)
  const [deleteId, setDeleteId]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')
  const [pickedMhs, setPickedMhs] = useState(null)

  const { data, loading, error, add, edit, remove } = usePasien({ search, status: statusFilter })

  const totalPages  = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated   = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function openAdd() {
    setForm(emptyForm); setEditId(null); setFormError(''); setPickedMhs(null); setModal('add')
  }
  function openEdit(p) {
    setForm({ name: p.name, nim: p.nim, hp: p.hp ?? '', layanan: p.layanan, tanggal: p.tanggal, status: p.status, keluhan: p.keluhan ?? '' })
    setEditId(p.id); setFormError(''); setModal('edit')
  }
  function openDelete(id) { setDeleteId(id); setModal('delete') }
  function closeModal()   { setModal(null); setEditId(null); setDeleteId(null); setPickedMhs(null) }

  async function saveForm(e) {
    e.preventDefault()
    setSaving(true); setFormError('')
    try {
      if (modal === 'add') await add(form)
      else                  await edit(editId, form)
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setSaving(true)
    try {
      await remove(deleteId)
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="visible"
        className="hidden lg:flex items-start justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Pasien</h1>
          <p className="mt-0.5 text-sm text-gray-500">{data.length} pasien ditemukan · real-time</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} />Tambah Pasien
        </button>
      </motion.div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertCircle size={15} />
          Gagal memuat data: {error}
        </div>
      )}

      {/* Filters */}
      <motion.div variants={fade} initial="hidden" animate="visible"
        className="card !p-4 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text" placeholder="Cari nama atau NIM..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all capitalize ${
                statusFilter === s ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'semua' ? 'Semua' : statusLabel[s]}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="btn-primary sm:hidden">
          <Plus size={14} />Tambah
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={fade} initial="hidden" animate="visible" className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                {['No', 'Nama Pasien', 'NIM', 'Layanan', 'Tanggal', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search size={32} strokeWidth={1.25} />
                      <p className="text-sm font-medium">Tidak ada pasien ditemukan</p>
                      <p className="text-xs">Coba ubah kata kunci atau filter</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id}
                  className={`group transition-colors hover:bg-primary-50/30 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}
                >
                  <td className="px-4 py-3 text-xs text-gray-400 font-medium">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={p.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.hp}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.nim}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.layanan}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.tanggal}</td>
                  <td className="px-4 py-3"><Badge variant={p.status}>{statusLabel[p.status]}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => openDelete(p.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, data.length)} dari {data.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                    n === currentPage ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
            <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit"
              className="card shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto !p-0"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-bold text-gray-900">
                  {modal === 'add' ? 'Tambah Pasien Baru' : 'Edit Data Pasien'}
                </h3>
                <button onClick={closeModal} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={saveForm} className="space-y-4 p-6">
                {formError && (
                  <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs text-danger-700">
                    <AlertCircle size={14} />{formError}
                  </div>
                )}

                {/* === Hanya tampil di mode Tambah: picker mahasiswa SIPRO === */}
                {modal === 'add' && (
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                      <GraduationCap size={13} className="text-primary-500" />
                      Pilih Mahasiswa dari SIPRO *
                    </label>
                    {pickedMhs ? (
                      <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-success-400 text-xs font-bold text-white">
                          {pickedMhs.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{pickedMhs.nama}</p>
                          <p className="text-[11px] text-gray-500">{pickedMhs.nim} · {pickedMhs.prodi || '—'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setPickedMhs(null); setForm(f => ({ ...f, name: '', nim: '', hp: '' })) }}
                          className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <MahasiswaPicker onSelect={m => {
                        setPickedMhs(m)
                        setForm(f => ({ ...f, name: m.nama, nim: m.nim, hp: m.no_hp || '' }))
                      }} />
                    )}
                  </div>
                )}

                {/* === Edit mode: tampil field nama & NIM seperti biasa === */}
                {modal === 'edit' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">Nama Lengkap *</label>
                      <input className="input-field" required value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Nama lengkap pasien" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">NIM / NPM *</label>
                      <input className="input-field font-mono" required value={form.nim}
                        onChange={e => setForm(f => ({ ...f, nim: e.target.value }))}
                        placeholder="2021050123" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">No. HP</label>
                      <input className="input-field" value={form.hp}
                        onChange={e => setForm(f => ({ ...f, hp: e.target.value }))}
                        placeholder="08xxxxxxxxxx" />
                    </div>
                  </div>
                )}

                {/* === Field bersama (layanan, status, tanggal, keluhan) === */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">Layanan *</label>
                    <select className="input-field" value={form.layanan}
                      onChange={e => setForm(f => ({ ...f, layanan: e.target.value }))}>
                      {LAYANAN.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status *</label>
                    <select className="input-field" value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {['menunggu','aktif','selesai','kritis'].map(s => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">Tanggal *</label>
                    <input type="date" className="input-field" required value={form.tanggal}
                      onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">Keluhan</label>
                    <textarea className="input-field resize-none" rows={3} value={form.keluhan}
                      onChange={e => setForm(f => ({ ...f, keluhan: e.target.value }))}
                      placeholder="Deskripsikan keluhan pasien..." />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary">Batal</button>
                  <button
                    type="submit"
                    disabled={saving || (modal === 'add' && !pickedMhs)}
                    className="btn-primary disabled:opacity-70"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
                    {modal === 'add' ? 'Tambah Pasien' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {modal === 'delete' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
            <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit"
              className="card shadow-modal w-full max-w-sm text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle size={28} className="text-red-500" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Hapus Pasien?</h3>
              <p className="mt-2 text-sm text-gray-500">
                Data akan dihapus dari database secara permanen.
              </p>
              {formError && <p className="mt-2 text-xs text-danger-600">{formError}</p>}
              <div className="mt-6 flex gap-3">
                <button onClick={closeModal} className="btn-secondary flex-1 justify-center">Batal</button>
                <button onClick={confirmDelete} disabled={saving} className="btn-danger flex-1 justify-center">
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
