import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './lib/AuthContext'
import DashboardLayout from './components/layout/DashboardLayout'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Pasien     from './pages/Pasien'
import Booking    from './pages/Booking'
import RekamMedis from './pages/RekamMedis'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/pasien"      element={<Pasien />} />
            <Route path="/booking"     element={<Booking />} />
            <Route path="/rekam-medis" element={<RekamMedis />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
