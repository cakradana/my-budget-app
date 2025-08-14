---
applyTo: '**'
---
# CLAUDE.local.md — Expert Prompt Version (Next.js 15 + Tailwind 3 + Seed Data)

Anda adalah asisten pengembang yang sangat mahir dalam **Next.js 15, Tailwind CSS v3, ShadCN UI, PostgreSQL, dan Drizzle ORM**.  
Tugas Anda adalah membangun **Fullstack Budget Tracker** sesuai detail berikut.  
Gunakan **TypeScript strict mode**, clean code, dan hindari `any` kecuali dijelaskan alasannya.

---

## 1. Tujuan Aplikasi
Aplikasi ini membantu pengguna mencatat pemasukan dan pengeluaran secara manual (tanpa fitur recurring)  
dengan dashboard yang menampilkan saldo, progress tabungan, dan laporan bulanan/mingguan.

---

## 2. Stack & Tools
- Next.js 15 App Router + TypeScript (strict mode)
- Tailwind CSS v3 + ShadCN UI
- PostgreSQL + Drizzle ORM
- NextAuth (Email & Google OAuth)
- React Query (fetching + caching data)
- Zod + React Hook Form (validasi & form handling)
- Recharts / Chart.js (grafik laporan)

---

## 3. Fitur Wajib
- Autentikasi login/register
- Dashboard: ringkasan saldo, progress tabungan, quick-add transaksi
- CRUD transaksi, kategori, budget
- Laporan dengan filter + grafik + export CSV
- Pengaturan alokasi budget manual
- Dark mode toggle
- Pagination pada list transaksi

---

## 4. Database Schema
**users**
- id: UUID (PK)
- name: text
- email: text (unique)
- password_hash: text (nullable)
- created_at: timestamptz (default now)

**categories**
- id: UUID (PK)
- name: text
- type: enum('weekly', 'monthly', 'other')
- user_id: UUID (FK → users.id, nullable)
- created_at: timestamptz (default now)

**transactions**
- id: UUID (PK)
- user_id: UUID (FK → users.id)
- category_id: UUID (FK → categories.id)
- amount: integer (rupiah)
- date: date
- note: text (nullable)
- created_at: timestamptz (default now)
- INDEX: (user_id), (date), (category_id)

**budgets**
- id: UUID (PK)
- user_id: UUID (FK → users.id)
- category_id: UUID (FK → categories.id)
- amount: integer
- period: enum('week', 'month')
- created_at: timestamptz (default now)

---

## 5. Teknis Implementasi
- Middleware untuk protected routes
- API RESTful dengan validasi Zod di backend
- Pagination pada endpoint GET /transactions
- Seed data default kategori & contoh transaksi
- `.env.example` lengkap
- Script migrasi Drizzle + seed
- Error handling konsisten
- Connection pooling untuk deploy di Vercel
- Minimal 5 unit test (Vitest/Jest) untuk kalkulasi & API

---

## 6. Seed Data (contoh global + pola mingguan & bulanan)

**categories**
- "Makan" (type: weekly)
- "Transportasi" (type: weekly)
- "Kost/Sewa" (type: monthly)
- "Keluarga" (type: monthly)
- "Tabungan" (type: monthly)
- "Hiburan" (type: other)

**transactions** (contoh awal)
- **Pola Mingguan** (mirip gaji mingguan 500rb, bayar sewa & keluarga di akhir bulan):
  - income: 500000 setiap Senin minggu 1–4
  - expense: "Makan" 150000 setiap minggu
  - expense: "Transportasi" 50000 setiap minggu
  - expense: "Kost/Sewa" 1500000 di tanggal 28
  - expense: "Keluarga" 700000 di tanggal 28

- **Pola Bulanan** (gaji 7jt di awal bulan, dibagi sebulan penuh):
  - income: 12000000 di tanggal 1
  - expense: "Kost/Sewa" 1500000 di tanggal 1
  - expense: "Keluarga" 700000 di tanggal 1
  - expense: "Makan" 2000000 (beberapa entry sepanjang bulan)
  - expense: "Transportasi" 500000 (beberapa entry sepanjang bulan)
  - expense: "Hiburan" 300000 di pertengahan bulan

**budgets**
- Makan: weekly, 150000
- Transportasi: weekly, 50000
- Kost/Sewa: monthly, 1500000
- Keluarga: monthly, 700000
- Tabungan: monthly, 1000000
- Hiburan: monthly, 300000

---

## 7. Output Format yang Diminta
Berikan output final dalam format berikut:
1. **package.json snippet** (dependencies + devDependencies)
2. **Struktur folder & file lengkap**
3. **Isi semua file penting** (path + isi file)
4. `.env.example`
5. README dengan petunjuk instalasi, migrasi, dan deploy ke Vercel
6. Contoh request/response API
7. Penjelasan cara menambah kategori + query transaksi
8. 5 contoh unit test
9. Checklist sebelum deploy

Gunakan bahasa Inggris dalam penulisan kode & komentar, namun pertahankan nama variabel sederhana dan konsisten.
