import { useState, useEffect, useRef } from 'react'
import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabase'

const notifications = [
  { text: 'Pasien baru: Rina Kartika mendaftar', time: '5 menit lalu',  dot: 'bg-primary-500', unread: true },
  { text: 'Konsultasi dengan dr. Hendra pukul 10:00', time: '30 menit lalu', dot: 'bg-success-500', unread: true },
  { text: 'Antrean pasien mencapai 15 orang', time: '1 jam lalu',  dot: 'bg-warning-500', unread: false },
]

export default function Topbar({ setMobileOpen, title }) {
  const { session } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const userEmail = session?.user?.email ?? ''
  const displayName = session?.user?.user_metadata?.full_name
    ?? session?.user?.user_metadata?.name
    ?? userEmail.split('@')[0]
    ?? 'Admin'

  async function handleLogout() {
    setProfileOpen(false)
    await supabase.auth.signOut()
  }

  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-4 lg:px-6">
      {/* Hamburger */}
      <button
        onClick={() => setMobileOpen(p => !p)}
        className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile title */}
      <h1 className="text-sm font-semibold text-gray-900 lg:hidden">{title}</h1>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-xs items-center lg:flex">
        <Search size={14} className="absolute left-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari pasien, dokter..."
          className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-50"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(p => !p); setProfileOpen(false) }}
            className="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-2xl bg-white shadow-modal border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifikasi</p>
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {notifications.filter(n => n.unread).length} baru
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.map((n, i) => (
                  <div key={i} className={`flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${n.unread ? 'bg-blue-50/30' : ''}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.dot}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{n.text}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-100">
                <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(p => !p); setNotifOpen(false) }}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-100"
          >
            <Avatar name={displayName} size="sm" />
            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight capitalize">{displayName}</p>
              <p className="text-[11px] text-gray-400 leading-tight">Administrator</p>
            </div>
            <ChevronDown size={13} className="hidden text-gray-400 lg:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl bg-white shadow-modal border border-gray-100 p-2 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-900 capitalize">{displayName}</p>
                <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
              </div>
              {[
                { icon: User, label: 'Profil Saya' },
                { icon: Settings, label: 'Pengaturan' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  <Icon size={15} className="text-gray-400" />
                  {label}
                </button>
              ))}
              <div className="mt-1 border-t border-gray-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={15} className="text-red-400" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
