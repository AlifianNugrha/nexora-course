# Nexora Course Platform

Platform belajar online modern dengan sistem manajemen konten (CMS) terintegrasi menggunakan **TanStack Start** dan **Supabase**.

## 🚀 Fitur Utama

- **Dashboard Admin (CMS)**: Kelola kategori, kelas, materi, dan jadwal pembelajaran dengan mudah.
- **Sistem Materi**: Mendukung konten berbasis teks dan link eksternal (Video/Docs).
- **Jadwal Pembelajaran**: Pantau linimasa sesi belajar yang akan datang.
- **Desain Premium**: UI modern berbasis Glassmorphism dengan animasi halus menggunakan Tailwind CSS.
- **Supabase Integration**: Keamanan data terjamin dengan Row Level Security (RLS).

## 🛠️ Tech Stack

- **Framework**: TanStack Start (React)
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend**: Supabase (Database & Auth)
- **Routing**: TanStack Router

## 📦 Persiapan Awal

1. **Clone repositori**:
   ```bash
   git clone <url-repo-anda>
   cd Nexora_Course
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Setup Environment**:
   Salin `.env.example` menjadi `.env` dan isi dengan kredensial Supabase Anda.
   ```bash
   cp .env.example .env
   ```

4. **Setup Database**:
   Buka SQL Editor di dashboard Supabase Anda, lalu jalankan seluruh perintah yang ada di file `supabase_schema.sql` untuk membuat tabel dan kebijakan keamanan (RLS).

## 🏃 Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000` (atau port lain yang muncul di terminal).

## 🚢 Deployment ke Vercel

Proyek ini dideploy sebagai **Single Page Application (SPA)**. Pastikan Anda:
1. Menambahkan environment variables di dashboard Vercel.
2. Framework Preset: **Vite**.
3. Build command: **npm run build**.
4. Output directory: **dist**.
5. Pastikan file `vercel.json` ada di root untuk menangani routing.

---
Dibuat dengan ❤️ oleh Nexora Team.
