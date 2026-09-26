# Viding WA Template Generator 💍📲

Aplikasi generator link `wa.me` dan template pesan WhatsApp otomatis dari file Excel untuk undangan pernikahan online Viding.

---

## 🚀 Cara Menjalankan

Aplikasi ini sudah siap digunakan di localhost tanpa dependensi berat (menggunakan Node.js built-in HTTP server dan SheetJS).

```bash
# Jalankan server
npm start
# atau
node server.js
```

Buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ✨ Fitur Utama

1. **Auto-Load & Drag-and-Drop Excel**:
   - Otomatis memuat template bawaan `invitation_list_36032.xlsx` saat aplikasi dibuka.
   - Mendukung drag-and-drop file `.xlsx`, `.xls`, atau `.csv` lainnya kapan saja.
   - Pilihan pemilihan kolom nomor WhatsApp otomatis terdeteksi (`Nomor Whatsapp`, `No WA`, `Phone`, dll).

2. **Dynamic Template Placeholders**:
   - Semua kolom dari Excel otomatis dideteksi menjadi tag yang dapat diklik: `[Nama]`, `[Sapaan]`, `[Link]`, `[Acara]`, `[Jumlah Tamu]`, `[Label]`, dll.
   - Klik tag apa saja untuk langsung menyisipkannya ke dalam template pesan pada posisi kursor.

3. **Preset Template Undangan Siap Pakai**:
   - 💍 **Resmi (Formal)**: Format undangan pernikahan lengkap & sopan untuk keluarga / relasi kerja.
   - 🌿 **Santai (Casual)**: Format hangat & santai untuk sahabat dan teman dekat.
   - ⚡ **Singkat (Quick Reminder)**: Format to-the-point untuk pengingat cepat.
   - ✏️ **Kustom**: Kemampuan untuk menulis dan menyimpan template kustom Anda sendiri ke browser (localStorage).

4. **Live Preview Chat Bubble**:
   - Preview pesan real-time berpenampilan seperti chat WhatsApp asli untuk setiap tamu yang dipilih.

5. **Penanganan Nomor WhatsApp Cerdas (Indonesian Format)**:
   - Otomatis menormalisasi nomor lokal `08...`, `+62...`, atau `8...` menjadi format internasional `628...` yang kompatibel dengan `wa.me`.
   - Menghapus spasi, strip, tanda kurung, dan karakter non-angka secara otomatis.

6. **Dukungan Tamu Tanpa Nomor WA**:
   - Tamu yang tidak memiliki nomor WhatsApp diberi tanda **"Tanpa Nomor WA"**.
   - Tombol **"Salin Pesan"** tetap aktif sehingga Anda dapat langsung menyalin teks undangan dan menempelkannya (paste) ke WhatsApp secara manual.

7. **Aksi 1-Klik**:
   - **Kirim WA**: Membuka WhatsApp Web / App secara langsung dan otomatis menandai tamu sebagai **Terkirim**.
   - **Salin Link**: Menyalin tautan langsung `https://wa.me/628...?text=...` ke clipboard.
   - **Salin Pesan**: Menyalin isi teks template yang sudah digenerate ke clipboard.

8. **Pelacakan Status & Filter**:
   - Checklist status kirim (**Belum Kirim** vs **Terkirim**) yang tersimpan otomatis di `localStorage`.
   - Filter cepat: **Semua**, **Belum Kirim**, **Terkirim**, **Ada WA**, **Tanpa WA**.
   - Kolom pencarian real-time (cari berdasarkan nama tamu, nomor telepon, atau label bridesmaid/keluarga).
   - Indikator bar kemajuan (*Progress Bar*) pengiriman.

---

## 📁 Struktur File

- `server.js` - Server lokal Node.js (melayani static assets & endpoint default excel)
- `package.json` - Konfigurasi package & script runner (`npm start`)
- `public/index.html` - Struktur tampilan aplikasi web responsif
- `public/css/style.css` - Desain UI modern dark/light mode dengan glassmorphism
- `public/js/app.js` - Logika pemrosesan template, regex placeholder, normalisasi telepon, dan interaksi
- `public/vendor/xlsx.full.min.js` - Library SheetJS untuk parsing Excel offline lokal
