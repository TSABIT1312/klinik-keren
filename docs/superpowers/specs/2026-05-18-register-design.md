# Register Feature — Design Spec
_Date: 2026-05-18_

## Overview
Tambah halaman registrasi terbuka (`/register`) agar pengguna baru bisa membuat akun sendiri tanpa bantuan admin.

## Architecture

- **Route baru:** `/register` — public, tidak dilindungi `ProtectedRoute`
- **File baru:** `src/pages/Register.jsx`
- **File diubah:** `src/App.jsx`, `src/pages/Login.jsx`

## Components

### `src/pages/Register.jsx`
- Layout identik dengan `Login.jsx`: split-panel, left panel sama persis (dekoratif, tidak diubah)
- Right panel berisi form registrasi:
  - Field **Email** (type email, required)
  - Field **Password** (type password, min 6 karakter, required)
  - Field **Konfirmasi Password** (type password, required)
  - Tombol toggle show/hide password untuk kedua field password
- Validasi client-side sebelum submit:
  - Password dan konfirmasi password harus cocok → tampilkan error inline jika tidak
  - Minimal 6 karakter
- Submit → `supabase.auth.signUp({ email, password })`
- State sukses → ganti form dengan pesan sukses: "Akun berhasil dibuat! Cek email kamu untuk konfirmasi sebelum login."
- State error → tampilkan pesan error inline (email sudah terdaftar, dll)
- Link navigasi: "Sudah punya akun? **Masuk**" → `/login`

### `src/App.jsx`
- Tambah `import Register from './pages/Register'`
- Tambah `<Route path="/register" element={<Register />} />` di luar `ProtectedRoute`

### `src/pages/Login.jsx`
- Tambah link di bawah form atau di atas trust badges: "Belum punya akun? **Daftar sekarang**" → `/register`

## Data Flow
```
User isi form → validasi client-side → supabase.auth.signUp()
  ↓ sukses → tampilkan pesan "cek email konfirmasi"
  ↓ error  → tampilkan pesan error inline
```

## Error Handling
- Password tidak cocok → "Password dan konfirmasi tidak sama."
- Email sudah terdaftar → "Email ini sudah terdaftar. Silakan login."
- Error lainnya → "Terjadi kesalahan. Silakan coba lagi."

## Out of Scope
- Nama lengkap atau field tambahan lainnya
- Kode undangan / pembatasan domain email
- Role selection
