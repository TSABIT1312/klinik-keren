import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const titles = {
  '/':            'Dashboard',
  '/pasien':      'Data Pasien',
  '/booking':     'Booking Konsultasi',
  '/rekam-medis': 'Rekam Medis',
  '/pengaturan':  'Pengaturan',
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Klinik Kampus'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-poppins">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar setMobileOpen={setMobileOpen} title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
