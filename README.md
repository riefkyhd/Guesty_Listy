# Guesty Listy - Viding WA Generator 💍📲

Aplikasi generator template pesan WhatsApp dan tautan `wa.me` otomatis dari data Excel untuk undangan pernikahan **Dhifa & Riefky**.

---

## 💻 Panduan Menjalankan di PC (Windows / Laptop Lain)

Anda dapat dengan mudah melanjutkan pengerjaan atau pengiriman undangan ini di PC Windows Anda dengan mengikuti langkah-langkah berikut:

### 1. Prasyarat: Pastikan Node.js Terinstall di PC
Jika PC Anda belum memiliki Node.js:
1. Unduh installer Node.js versi LTS dari situs resmi: **[https://nodejs.org/](https://nodejs.org/)**
2. Jalankan filenya dan klik **Next** hingga proses instalasi selesai.

*(Tidak perlu install dependensi tambahan karena aplikasi ini menggunakan modul bawaan Node.js tanpa dependensi npm yang rumit).*

---

### 2. Dapatkan Folder Project di PC Anda

Pilih salah satu cara yang paling nyaman:

#### Opsi A: Menggunakan Git Clone (Direkomendasikan)
Buka **Command Prompt (cmd)** atau **PowerShell** di PC Anda, lalu ketik:
```bash
git clone https://github.com/riefkyhd/Guesty_Listy.git
cd Guesty_Listy
```

#### Opsi B: Unduh ZIP dari GitHub
1. Buka repositori: **[https://github.com/riefkyhd/Guesty_Listy](https://github.com/riefkyhd/Guesty_Listy)**
2. Klik tombol hijau **`<> Code`** lalu pilih **`Download ZIP`**.
3. Ekstrak file zip tersebut di PC Anda.

---

### 3. Cara Menjalankan di PC

#### Cara 1 (Paling Cepat - 1 Kali Klik):
Masuk ke dalam folder project di File Explorer PC Anda, lalu cukup **Double-Click file `start.bat`**.
> File ini akan otomatis menyalakan server dan membuka `http://localhost:3000` di browser bawaan Anda!

#### Cara 2 (Melalui Terminal / CMD / PowerShell):
Buka terminal di dalam folder project, lalu jalankan:
```bash
npm start
# atau
node server.js
```
Kemudian buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔄 Sinkronisasi Git (Mac ⇄ PC)

Jika Anda melakukan perubahan di salah satu perangkat dan ingin menyelaraskannya:

### Menarik pembaruan terbaru di PC:
```bash
git pull origin main
```

### Menyimpan dan mengirim perubahan dari PC ke GitHub:
```bash
git add .
git commit -m "Pembaruan template undangan"
git push origin main
```

---

## ✨ Fitur & Cara Penggunaan

1. **Auto-Load Data Excel**:
   - File template bawaan `invitation_list_36032.xlsx` otomatis langsung dimuat saat web dibuka.
   - Anda juga dapat menyeret (*drag-and-drop*) file `.xlsx` baru kapan saja ke area upload.

2. **Template Dinamis `[xxx]`**:
   - Semua nama kolom di Excel (seperti `[Nama]`, `[Sapaan]`, `[Link]`, dll.) otomatis dideteksi menjadi tombol tag.
   - Klik tag apa saja untuk langsung menyisipkannya ke dalam template pesan pada posisi kursor.

3. **Pilihan Preset Undangan**:
   - 💍 **Format Resmi (Formal)**: Sopan dan lengkap untuk keluarga / rekan kerja.
   - 🌿 **Format Santai (Casual)**: Hangat untuk teman dan sahabat.
   - ⚡ **Format Singkat (Reminder)**: Ringkas to-the-point.
   - ✏️ **Template Kustom**: Anda dapat menyimpan template buatan sendiri (tersimpan di browser).

4. **Penanda Status Pengiriman (Interactive Checklist)**:
   - Kolom **Status Kirim** memudahkan Anda memantau siapa saja yang sudah dikirim:
     - 🟢 **Sudah Dikirim**: Tombol hijau bercentang + baris disorot warna hijau lembut.
     - ⏳ **Belum Dikirim**: Tombol abu-abu berikon jam.
   - **1-Klik Toggle**: Klik badge status untuk mengubahnya kapan saja.
   - Mengklik tombol **"Kirim WA"** akan otomatis membuka WhatsApp sekaligus menandai status menjadi *Sudah Dikirim*.
   - Filter cepat di toolbar: **Semua**, **Belum Kirim**, **Sudah Kirim**, **Ada WA**, **Tanpa WA**.
   - Indikator *Progress Bar* pengiriman real-time di bagian atas.

5. **Aksi Cepat WhatsApp**:
   - **Kirim WA**: Membuka WhatsApp Web / WhatsApp Desktop di PC dengan pesan yang sudah terisi otomatis.
   - **Salin Link**: Menyalin tautan langsung `https://wa.me/...` ke clipboard.
   - **Salin Pesan**: Menyalin isi pesan teks lengkap untuk ditempel manual (sangat berguna bagi tamu tanpa nomor telepon).

6. **Desain Bersih & Responsif**:
   - Tema terang (Light Theme) dengan kontras tinggi sesuai standar aksesibilitas.
   - Tabel lebar penuh (100%) sehingga semua kolom dan tombol aksi terlihat jelas tanpa terpotong.

---

## 📁 Struktur File Project

```text
Guesty_Listy/
├── start.bat                  # Script 1-klik untuk langsung jalan di Windows PC
├── server.js                  # Server HTTP lokal Node.js
├── package.json               # Konfigurasi project dan script runner
├── README.md                  # Panduan lengkap penggunaan
├── invitation_list_36032.xlsx # File data Excel tamu undangan
└── public/
    ├── index.html             # Tampilan aplikasi web responsif
    ├── css/
    │   └── style.css          # Desain antarmuka light theme & layout
    ├── js/
    │   └── app.js             # Logika generator template & interaksi
    └── vendor/
        └── xlsx.full.min.js   # Library parsing Excel (bisa offline)
```
