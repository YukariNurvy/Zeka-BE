# Zeka Game Lab — Backend API

Backend Node.js + Express + MySQL buat fitur admin di situs Zeka Game Lab.
Menyediakan login admin (JWT) dan CRUD untuk Games, Members, dan Events.

## Struktur

```
backend/
  server.js         entrypoint Express
  db.js             koneksi MySQL pool
  schema.sql         definisi tabel
  seed.js           bikin tabel + akun admin pertama + data default
  middleware/auth.js verifikasi JWT
  routes/auth.js     POST /api/auth/login, GET /api/auth/verify
  routes/games.js    GET (publik), POST/PUT/DELETE (admin only)
  routes/members.js  sama seperti games
  routes/events.js   sama seperti games
  .env.example
```

## Deploy ke Railway (langkah demi langkah)

1. **Buat project baru di Railway**, lalu "Deploy from GitHub repo" — push folder `backend/` ini ke sebuah repo GitHub dulu (atau upload manual via Railway CLI).
2. **Tambah plugin MySQL**: di project Railway, klik "New" → "Database" → "MySQL". Railway otomatis bikin env var `MYSQL_URL`, `MYSQLHOST`, `MYSQLUSER`, dst — kode di `db.js` sudah otomatis membacanya, kamu tidak perlu isi manual.
3. **Set environment variables** di service backend (tab "Variables"):
   - `JWT_SECRET` → string acak panjang (contoh: buka https://generate-secret.vercel.app/32 atau ketik `openssl rand -hex 32` di terminal)
   - `ADMIN_USERNAME` → username admin pertama, misal `admin`
   - `ADMIN_PASSWORD` → password admin pertama, ganti dengan yang kuat
   - `ALLOWED_ORIGINS` → domain tempat kamu hosting frontend (misalnya `https://zekagamelab.com`). Boleh `*` dulu waktu masih testing.
4. **Deploy.** Railway otomatis `npm install` dan jalankan `npm start`.
5. **Jalankan seed sekali** supaya tabel & akun admin pertama dibuat. Di Railway buka tab "Shell" pada service ini (atau pakai Railway CLI: `railway run npm run seed`) lalu jalankan:
   ```
   npm run seed
   ```
   Ini bikin tabel, akun admin dari `ADMIN_USERNAME`/`ADMIN_PASSWORD`, dan beberapa data contoh kalau tabel masih kosong.
6. **Catat URL publik service ini** (Railway kasih domain otomatis seperti `https://zeka-game-lab-api-production.up.railway.app`). URL ini yang dipakai di frontend (`API_BASE_URL`).

## Testing cepat lewat curl

```bash
# Login
curl -X POST https://<domain-railway-kamu>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password-kamu"}'

# Simpan token dari response di atas, lalu:
curl -X POST https://<domain-railway-kamu>/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Genshin Impact","cover":"https://..."}'
```

## Menambah admin lain

Belum ada endpoint register (sengaja, biar gak sembarang orang bisa daftar admin).
Cara paling gampang tambah admin kedua: jalankan query manual lewat Railway MySQL
console, hash password-nya pakai bcrypt dulu (bisa lewat Node REPL: 
`require('bcryptjs').hashSync('password-baru', 10)`), lalu:

```sql
INSERT INTO admins (username, password_hash) VALUES ('username-baru', '<hasil-hash>');
```

## Keamanan yang sudah dipasang

- Password admin disimpan sebagai hash bcrypt, bukan plain text.
- Login mengembalikan JWT yang expire 12 jam.
- Semua endpoint yang mengubah data (POST/PUT/DELETE) wajib kirim
  `Authorization: Bearer <token>` yang valid.
- CORS dibatasi ke domain yang kamu set di `ALLOWED_ORIGINS`.

Yang masih perlu kamu lakukan sendiri: pasang HTTPS (otomatis kalau pakai domain
Railway atau custom domain + Cloudflare), dan jangan commit file `.env` asli ke git.
