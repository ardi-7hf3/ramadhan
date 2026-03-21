# 🌙 Kartu Ucapan Eid Mubarak — Azril

Website kartu ucapan digital bilingual (Indonesia / English) dengan animasi amplop interaktif, dibangun dengan **React 18 + Vite + Tailwind CSS**.

---

## ✨ Fitur Utama

- **Animasi Amplop 3D** — klik amplop → flap terbuka → segel lilin menghilang → kartu keluar
- **Bilingual** — tombol toggle antara Indonesia & English
  - 🇮🇩 *Minal Aaidiin Wal Faaiziin — Mohon Maaf Lahir dan Batin*
  - 🇬🇧 *Happy Eid Mubarak*
- **Starfield animasi** — bintang emas & putih bergerak di background
- **Intro Loader** — bulan sabit berputar + progress bar
- **SVG custom** — semua ilustrasi (masjid, bulan sabit, lentera, divider islami) dibuat dari SVG
- **Font Poppins Bold** — konsisten di seluruh halaman
- **Tombol Share** — Web Share API / salin link otomatis
- **Fully responsive** — mobile & desktop

---

## 🗂️ Struktur Project

```
eid-card-project/
├── index.html                  # Entry point Vite
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind custom theme
├── postcss.config.js           # PostCSS config
├── public/
│   ├── favicon.svg             # Favicon bulan sabit
│   └── LOGO_README.txt         # Instruksi logo
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Root component
    ├── index.css               # Global styles + animasi CSS
    ├── lang.js                 # Data teks bilingual (ID/EN)
    └── components/
        ├── SvgIcons.jsx        # Semua SVG custom
        ├── Starfield.jsx       # Partikel bintang background
        ├── Loader.jsx          # Intro loader screen
        ├── LangToggle.jsx      # Tombol ganti bahasa
        ├── GreetingCard.jsx    # Kartu ucapan (isi)
        ├── Toast.jsx           # Notifikasi toast
        └── (README ini)
```

---

## 🚀 Cara Menjalankan

### 1. Install dependencies

```bash
npm install
```

### 2. Jalankan development server

```bash
npm run dev
```

Buka browser di: **http://localhost:3000**

### 3. Build untuk production

```bash
npm run build
```

### 4. Preview build

```bash
npm run preview
```

---

## 🛠️ Tech Stack

| Tool | Versi | Fungsi |
|------|-------|--------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| PostCSS | 8.x | CSS processing |
| Autoprefixer | 10.x | CSS browser compat |
| Google Fonts | — | Poppins + Amiri |

---

## 🎨 Kustomisasi

### Ganti teks ucapan
Edit file `src/lang.js` — ubah field `body`, `sub`, `wishes`, dll.

### Ganti warna tema
Edit `tailwind.config.js` → section `colors` → `gold`, `teal`, `navy`

### Ganti animasi
Edit `src/index.css` → section animasi

---

## 📱 Browser Support

- Chrome 90+ ✅
- Firefox 90+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

---

*Dibuat oleh Ardi 7HF3 — Ramadhan 1447 H / 2026 M*
