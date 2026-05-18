import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Stethoscope, Activity, Heart, Shield, CheckCircle, AlertCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const features = [
  { icon: Activity, text: 'Monitoring kesehatan real-time' },
  { icon: Heart,    text: 'Rekam medis pasien terintegrasi' },
  { icon: Shield,   text: 'Data aman & terenkripsi penuh' },
]

const stats = [
  { value: '2.400+', label: 'Pasien Terdaftar' },
  { value: '98%',    label: 'Kepuasan Pasien' },
  { value: '12',     label: 'Tenaga Medis' },
]

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname ?? '/'
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [authError, setAuthError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError('Email atau password salah. Silakan coba lagi.')
      setLoading(false)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen font-poppins">
      {/* ── Left Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative hidden overflow-hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-500 to-success-500 p-12"
      >
        {/* Decorative circles */}
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-white/[0.06]" />
        <div className="absolute top-1/2 right-1/4 h-48 w-48 -translate-y-1/2 rounded-full bg-white/[0.05]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Stethoscope size={20} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold text-white">Klinik Kampus</span>
        </div>

        {/* Center illustration */}
        <div className="relative flex flex-col items-center justify-center py-8">
          <div className="relative mb-8 flex h-52 w-52 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm" />
            {/* SVG Illustration */}
            <svg viewBox="0 0 160 160" className="relative h-32 w-32" fill="none">
              {/* Cross shape */}
              <rect x="60" y="28" width="40" height="104" rx="12" fill="white" fillOpacity="0.92" />
              <rect x="28" y="60" width="104" height="40" rx="12" fill="white" fillOpacity="0.92" />
              {/* Heart */}
              <path
                d="M80 120 C80 120 50 102 50 84 C50 74 57 67 66 67 C71 67 76 70 80 74 C84 70 89 67 94 67 C103 67 110 74 110 84 C110 102 80 120 80 120Z"
                fill="white" fillOpacity="0.55"
              />
              {/* Pulse line */}
              <polyline
                points="30,80 45,80 52,60 60,100 68,72 76,80 110,80 118,80"
                stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.7"
              />
            </svg>
          </div>

          <h1 className="text-center text-[28px] font-bold leading-snug text-white">
            Sistem Kesehatan<br />Kampus Terpadu
          </h1>
          <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-white/70">
            Kelola kesehatan mahasiswa & civitas akademika dengan mudah, cepat, dan aman.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature list */}
        <div className="relative space-y-3">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <Icon size={15} className="text-white" strokeWidth={1.75} />
              </div>
              <span className="text-sm text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Right Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
        className="flex flex-1 items-center justify-center bg-white p-8"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-success-500">
              <Stethoscope size={16} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-gray-900">Klinik Kampus</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Selamat datang kembali</h2>
            <p className="mt-1 text-sm text-gray-500">Masuk untuk mengakses sistem klinik</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auth error */}
            {authError && (
              <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3">
                <AlertCircle size={15} className="shrink-0 text-danger-500" />
                <p className="text-xs text-danger-700">{authError}</p>
              </div>
            )}
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@klinik.kampus.id"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <button type="button" className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="input-field pl-10 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label className="flex cursor-pointer items-center gap-2.5 pt-0.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-600">Ingat saya selama 30 hari</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full justify-center py-3 text-base disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                <>Masuk <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Daftar sekarang
            </Link>
          </p>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 border-t border-gray-100 pt-6">
            {['SSL Terenkripsi', 'Data Aman', 'BSSN Compliant'].map(t => (
              <div key={t} className="flex items-center gap-1 text-[11px] text-gray-400">
                <CheckCircle size={11} className="text-success-400" />
                {t}
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-[11px] text-gray-400">
            © 2025 Klinik Kampus. Sistem Manajemen Kesehatan.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
