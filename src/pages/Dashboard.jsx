import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, Stethoscope, Calendar, Clock,
  UserPlus, FileText, Printer,
  CheckCircle, AlertCircle,
} from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import StatCard from '../components/ui/StatCard'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'

const quickActions = [
  { icon: UserPlus, label: 'Daftar Pasien',  to: '/pasien',      text: 'text-primary-600', bg: 'bg-primary-50 hover:bg-primary-100' },
  { icon: Calendar,  label: 'Booking',        to: '/booking',     text: 'text-success-600', bg: 'bg-success-50 hover:bg-success-100' },
  { icon: FileText,  label: 'Rekam Medis',    to: '/rekam-medis', text: 'text-violet-600',  bg: 'bg-violet-50 hover:bg-violet-100'   },
  { icon: Printer,   label: 'Cetak Laporan',  to: '#',            text: 'text-warning-600', bg: 'bg-warning-50 hover:bg-warning-100' },
]

const fade = {
  hidden:  { opacity: 0, y: 16 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: 'easeOut' },
  }),
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-card-hover text-xs">
      <p className="mb-2 font-semibold text-gray-700">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
          <div className="h-2 w-20 rounded bg-gray-100" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-gray-100" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { stats, weekly, jadwal, loading, error } = useDashboard()

  return (
    <div className="space-y-5 p-4 lg:p-6">
      {/* Page header */}
      <motion.div variants={fade} custom={0} initial="hidden" animate="visible"
        className="hidden lg:block"
      >
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Selamat datang kembali, Admin. Berikut ringkasan aktivitas hari ini.
        </p>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertCircle size={16} />
          Gagal memuat data: {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : [
          { icon: Users,       label: 'Pasien Hari Ini',  value: String(stats.hari_ini),   trend: 'up',      trendValue: 'hari ini',  color: 'primary' },
          { icon: Stethoscope, label: 'Dokter Aktif',     value: String(stats.dokter),     trend: 'neutral', trendValue: 'aktif',     color: 'success' },
          { icon: Calendar,    label: 'Konsultasi',       value: String(stats.konsultasi), trend: 'up',      trendValue: 'terkonfirmasi', color: 'warning' },
          { icon: Clock,       label: 'Antrean Aktif',    value: String(stats.antrean),    trend: 'neutral', trendValue: 'menunggu',  color: 'danger'  },
        ].map((s, i) => (
          <motion.div key={s.label} variants={fade} custom={i + 1} initial="hidden" animate="visible">
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={fade} custom={5} initial="hidden" animate="visible"
          className="card lg:col-span-2"
        >
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Kunjungan Mingguan</h2>
              <p className="text-xs text-gray-400 mt-0.5">7 hari terakhir · data real-time</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary-500 inline-block" />Kunjungan</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success-500 inline-block" />Konsultasi</span>
            </div>
          </div>
          {loading ? (
            <div className="h-[200px] animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekly} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day"       tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis                     tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="kunjungan"  stroke="#3b82f6" strokeWidth={2} fill="url(#gBlue)"  name="Kunjungan"  />
                <Area type="monotone" dataKey="konsultasi" stroke="#10b981" strokeWidth={2} fill="url(#gGreen)" name="Konsultasi" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fade} custom={6} initial="hidden" animate="visible" className="card">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label, to, text, bg }) => (
              <Link key={label} to={to}
                className={`flex flex-col items-center gap-2.5 rounded-xl p-4 text-center transition-all duration-200 ${bg}`}
              >
                <Icon size={20} className={text} strokeWidth={1.75} />
                <span className={`text-xs font-medium leading-tight ${text}`}>{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Jadwal hari ini */}
      <div className="grid gap-4 lg:grid-cols-5">
        <motion.div variants={fade} custom={7} initial="hidden" animate="visible"
          className="card lg:col-span-3"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Booking Hari Ini</h2>
            <Link to="/booking" className="text-xs font-medium text-primary-600 hover:text-primary-700">
              Lihat semua →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}
            </div>
          ) : jadwal.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Calendar size={28} strokeWidth={1.25} className="mb-2" />
              <p className="text-sm">Belum ada booking hari ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Pasien', 'Dokter', 'Waktu', 'Status'].map(h => (
                      <th key={h} className="pb-3 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jadwal.map((b, i) => (
                    <tr key={b.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/60 ${i % 2 ? 'bg-gray-50/40' : ''}`}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={b.nama_pasien ?? '?'} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-900">{b.nama_pasien}</p>
                            <p className="text-[10px] text-gray-400">{b.nim_pasien}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-600">{b.dokter?.name ?? '—'}</td>
                      <td className="py-3 pr-4 text-xs font-medium text-gray-700">{b.waktu?.slice(0,5)}</td>
                      <td className="py-3">
                        <Badge variant={b.status === 'dikonfirmasi' ? 'aktif' : b.status}>
                          {{ menunggu: 'Menunggu', dikonfirmasi: 'Konfirmasi', selesai: 'Selesai', dibatalkan: 'Batal' }[b.status] ?? b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div variants={fade} custom={8} initial="hidden" animate="visible"
          className="card lg:col-span-2"
        >
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Ringkasan Hari Ini</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CheckCircle, label: 'Konsultasi',  value: stats.konsultasi, color: 'text-success-600', bg: 'bg-success-50' },
              { icon: AlertCircle, label: 'Menunggu',    value: stats.antrean,    color: 'text-warning-600', bg: 'bg-warning-50' },
              { icon: Users,       label: 'Pasien Baru', value: stats.hari_ini,   color: 'text-primary-600', bg: 'bg-primary-50' },
              { icon: Stethoscope, label: 'Dokter',      value: stats.dokter,     color: 'text-violet-600',  bg: 'bg-violet-50'  },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`flex flex-col gap-1.5 rounded-xl ${bg} p-4`}>
                <Icon size={16} className={color} strokeWidth={1.75} />
                <p className={`text-xl font-bold ${color}`}>{loading ? '—' : value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
