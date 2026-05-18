import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Calendar, FileText,
  Settings, LogOut, Stethoscope, X,
} from 'lucide-react'

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',         end: true },
  { to: '/pasien',     icon: Users,           label: 'Data Pasien',       end: false },
  { to: '/booking',    icon: Calendar,        label: 'Booking',           end: false },
  { to: '/rekam-medis',icon: FileText,        label: 'Rekam Medis',       end: false },
]

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            strokeWidth={isActive ? 2.2 : 1.75}
            className={isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
          />
          {label}
        </>
      )}
    </NavLink>
  )
}

function SidebarContent({ onClose }) {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-[18px]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-success-500 shadow-sm">
          <Stethoscope size={18} className="text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900 leading-tight">Klinik Kampus</p>
          <p className="text-[11px] text-gray-400">Health Management</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Menu Utama
        </p>
        <div className="space-y-0.5">
          {navItems.map(item => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-0.5">
        <NavItem to="/pengaturan" icon={Settings} label="Pengaturan" end={false} onClick={onClose} />
        <button
          onClick={() => navigate('/login')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 group"
        >
          <LogOut size={17} strokeWidth={1.75} className="text-gray-400 group-hover:text-red-500" />
          Keluar
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-r border-gray-100 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            />
            <motion.aside
              key="sidebar"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-[240px] bg-white shadow-modal lg:hidden"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
