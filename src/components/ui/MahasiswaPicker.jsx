import { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, RefreshCw, GraduationCap, ChevronDown, X } from 'lucide-react'
import { getMahasiswa } from '../../services/siproService'

export default function MahasiswaPicker({ onSelect, onClear, picked }) {
  const [allMhs, setAllMhs]   = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const wrapperRef            = useRef(null)
  const searchRef             = useRef(null)

  function openDropdown() {
    setOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
    if (allMhs.length > 0) return
    setLoading(true)
    getMahasiswa()
      .then(data => setAllMhs(Array.isArray(data) ? data : []))
      .catch(() => setAllMhs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return allMhs
    const q = query.toLowerCase()
    return allMhs.filter(m =>
      m.nama.toLowerCase().includes(q) || m.nim.includes(q)
    )
  }, [allMhs, query])

  function pick(m) {
    onSelect(m)
    setOpen(false)
    setQuery('')
  }

  if (picked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-success-400 text-xs font-bold text-white">
          {picked.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{picked.nama}</p>
          <p className="text-[11px] text-gray-500">{picked.nim}{picked.prodi ? ` · ${picked.prodi}` : ''}</p>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={openDropdown}
        className="input-field flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 text-gray-400">
          <GraduationCap size={14} />
          <span className="text-sm">Pilih mahasiswa...</span>
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-modal overflow-hidden"
          >
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Cari nama atau NIM..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-primary-400 focus:bg-white"
                />
              </div>
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {loading ? (
                <li className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                  <RefreshCw size={14} className="animate-spin" /> Memuat data mahasiswa...
                </li>
              ) : filtered.length === 0 ? (
                <li className="py-6 text-center text-sm text-gray-400">
                  {query ? 'Mahasiswa tidak ditemukan' : 'Tidak ada data'}
                </li>
              ) : filtered.map(m => (
                <li key={m.id}>
                  <button
                    type="button"
                    onMouseDown={() => pick(m)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-success-400 text-[10px] font-bold text-white">
                      {(m.nama || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{m.nama}</p>
                      <p className="text-[11px] text-gray-400">{m.nim}{m.prodi ? ` · ${m.prodi}` : ''}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {!loading && allMhs.length > 0 && (
              <div className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-400">
                {filtered.length} dari {allMhs.length} mahasiswa
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
