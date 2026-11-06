# DESIGN — sonychristanto.com

Arah visual: **resmi, tenang, berwibawa**, tapi tetap hangat. Navy sebagai warna institusi, emas sebagai aksen (dipakai hemat), krem sebagai jeda antar section. Diturunkan dari prototype sprint 1. Desainer (Fazrah/Amel) boleh menyempurnakan, tetapi token di bawah adalah sumber kebenarannya. Token yang diubah wajib diperbarui di `frontend/app/assets/css/main.css`.

## 1. Token

### Warna

| Token (Tailwind) | Hex | Pemakaian |
|---|---|---|
| `navy-950` | `#071235` | Footer |
| `navy-900` | `#0A1A44` | Hero, header, teks utama, tombol gelap |
| `navy-800` | `#14275F` | Kartu di atas navy, hover |
| `navy-700` | `#2A3D7A` | Garis di atas navy, tautan |
| `navy-200` | `#B8C2E0` | Teks sekunder di atas navy |
| `navy-100` | `#D5DCF0` | Teks paragraf di atas navy |
| `gold-500` | `#F2C230` | **Aksen**: CTA utama, eyebrow di atas navy, focus ring |
| `gold-700` | `#7A5C00` | Eyebrow/tanggal di atas putih/krem (kontras 4.5:1) |
| `cream-100` | `#F6F4EE` | Latar section selang-seling |
| `cream-300` | `#E3DFD3` | Garis pemisah |
| `ink-600` | `#4A5370` | Teks sekunder di atas putih |

Aturan kontras: teks emas `gold-500` **hanya** di atas navy. Di atas putih/krem pakai `gold-700`.

### Tipografi

| Peran | Font | Ukuran |
|---|---|---|
| Display (h1–h3, angka) | Playfair Display 500/600/700 | h1 hero 48–72 px, h1 halaman 36–60 px, h2 36–48 px |
| Teks | Inter 400/500/600/700 | body 17 px / 1.65; artikel 18 px / 1.8 |
| Eyebrow | Inter 600, 13 px, uppercase, tracking 0.14em | Label di atas judul section |

Font di-*self-host* oleh `@nuxt/fonts` (subset latin + latin-ext), tanpa request ke Google saat runtime.

### Layout

- Container: maks 1152 px (`max-w-6xl`), padding 20/32 px.
- Artikel: kolom teks maks 768 px (`max-w-3xl`), banner maks 1024 px.
- Section: padding vertikal 64–96 px, latar putih ↔ krem bergantian, navy untuk hero/CTA.
- Sudut tajam (tanpa radius), kecuali avatar bulat. Bayangan hanya untuk foto hero (`16px 16px 0 gold-500`).
- Grid: kartu artikel 3 kolom (desktop) → 2 → 1.

## 2. Komponen

| Komponen | File | Catatan |
|---|---|---|
| Header + nav | `site/SiteHeader.vue` | Sticky navy; menu mobile < 1024 px; `aria-current` di halaman aktif |
| Footer | `site/SiteFooter.vue` | Navigasi, kontak, sosial (`rel="me"`) |
| Page hero | `site/PageHero.vue` | Eyebrow + h1 + lead + breadcrumb |
| Breadcrumbs | `site/Breadcrumbs.vue` | Sekaligus menyuntik JSON-LD `BreadcrumbList` |
| Section heading | `site/SectionHeading.vue` | Eyebrow + h2 + tautan "Semua …" |
| Empty state | `site/EmptyState.vue` | "Segera hadir" untuk modul tanpa data |
| Kartu artikel | `blog/ArticleCard.vue` | Banner 16:9, kategori, tanggal, waktu baca, judul, ringkasan |
| Renderer artikel | `blog/BlockRenderer.vue` | BlockNote JSON → HTML semantik (`.prose-article`) |
| Lightbox galeri | `site/GalleryLightbox.vue` | `<dialog>` native, ← → Esc |
| Tombol | utilitas `btn-primary`, `btn-dark`, `btn-outline`, `btn-danger` | Tinggi min. 44 px |
| Form | `field-label`, `field-input`, `field-error` | Label selalu terlihat |

## 3. Pola halaman

- **Beranda**: Hero (foto + nama + jabatan + ringkasan + 2 CTA) → Sekilas angka → Perspektif → Agenda → Kiprah → CTA aspirasi. Lihat brainstorming di PRD Modul 1.
- **Halaman daftar** (organisasi, penghargaan, karya tulis): PageHero → daftar bergaris atau grid kartu.
- **Halaman detail**: PageHero (eyebrow = modul) → konten maks 768 px → tautan "← Semua …".
- **Artikel**: header navy (kategori, h1, meta) → banner → isi → "Baca juga" 3 artikel sekategori.
- **Galeri**: bento grid `auto-rows-[220px]`, `grid-flow-dense`; ukuran tile `sm` 1×1, `wide` 2×1, `tall` 1×2, `lg` 2×2.

## 4. Konten & gambar

- Bahasa Indonesia baku, kalimat aktif, tanpa jargon. Gelar ditulis `Sony Christanto, SE., M.Si`.
- **Jangan** mengarang data (angka, kutipan, penghargaan). Data kosong → empty state.
- Foto: WebP, maks 1920×1080, kualitas 80 (`npm run images:optimize -- <folder>`). Foto profil resmi min. 1200 px sisi panjang.
- Setiap gambar wajib punya `alt` yang mendeskripsikan isi ("Sony Christanto menyerahkan bantuan di …"), bukan "foto1".
- Gambar OG default: `public/images/og-default.jpg` (1200×630). Versi sekarang adalah **placeholder** dari foto CV, jadi minta desainer membuat versi final.

## 5. Editor artikel (dashboard)

- Blok yang tersedia: paragraf, heading 1–3, kutipan, bullet, numbering, checklist, divider, gambar, **2 kolom**.
- Heading editor H1 → `<h2>` di halaman (judul artikel adalah satu-satunya `<h1>`).
- Gambar di editor harus diunggah (bukan URL eksternal), karena backend menolak URL luar.
- Tema editor: light, mengikuti font Inter.

## 6. Dashboard

Sidebar navy, area kerja krem, kartu putih. Status artikel: abu "Draft", hijau "Terbit", merah "Nonaktif", emas "Ada perubahan belum terbit". Aksi destruktif selalu meminta konfirmasi dan berwarna merah. Indikator autosave selalu terlihat di bar atas editor (`aria-live`).

## 7. Aksesibilitas (wajib)

Kontras ≥ 4.5:1 (≥ 3:1 untuk teks ≥ 24 px) · target sentuh ≥ 44 px · fokus terlihat (outline emas 3 px) · skip link "Lewati ke konten" · satu `<h1>` per halaman · `<label>` untuk setiap input · ikon dekoratif `aria-hidden` · tombol ikon berlabel `aria-label` · halaman tetap berfungsi di lebar 390 px.
