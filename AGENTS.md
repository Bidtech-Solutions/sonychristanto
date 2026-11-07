# AGENTS.md — panduan untuk AI coding agent

Proyek: website personal branding + CMS **Sony Christanto** (`sonychristanto.com`). Baca `docs/PRD.md` (apa & kenapa) dan `docs/architecture.md` (bagaimana) sebelum perubahan besar.

## Fakta penting

- Nama klien: **Sony Christanto** (tanpa "i"). Jangan pernah menulis "Christianto".
- Bahasa UI dan konten: **Indonesia**. Komentar kode: Inggris, singkat.
- **Jangan mengarang konten** (bio, angka, penghargaan, kutipan, kontak). Data statis berasal dari CV klien. Yang belum ada → kosong + `TODO(klien)` + empty state.

## Perintah

```bash
docker compose up -d --build                  # seluruh stack dev
cd backend && go test -tags nodynamic ./...   # unit test
cd backend && go vet -tags nodynamic ./... && gofmt -l .
./backend/scripts/smoke-test.sh               # E2E API (stack harus jalan; tunggu ~1 menit antar run karena rate limit login)
cd frontend && npm run typecheck && npm run build
```

## Invarian (jangan dilanggar)

1. **Build Go selalu dengan `-tags nodynamic`.** Tanpa tag itu `gen2brain/webp` memakai purego dan binary jadi dinamis, sehingga crash di image distroless (`exec: no such file or directory`).
2. **Skema editor ada di 3 tempat yang harus sinkron:**
   - `frontend/app/editor/blocknote.ts` (blok yang tersedia di editor)
   - `backend/internal/content/content.go` (`AllowedBlocks`, `MaxColumns = 2`)
   - `frontend/app/components/blog/BlockRenderer.vue` (render publik)
3. **Kategori artikel ada di 2 tempat:** `backend/internal/models/models.go` (`Categories`) dan `frontend/app/data/site.ts` (`categories`). Key = slug URL.
4. **Route SSG didaftarkan di `frontend/app/data/routes.ts`.** Halaman statis baru → tambahkan di sana (prerender + sitemap + llms.txt). Halaman yang butuh API tidak boleh di-prerender (API tidak ada saat build di CI). Pakai ISR (`swr`) di `routeRules`.
5. **`NUXT_PUBLIC_*` dipakai halaman prerender**, jadi nilainya harus tersedia saat **build** (build-arg di Dockerfile & workflow), bukan hanya runtime.
6. **Artikel punya dua salinan**: `articles` (terbit) dan `article_drafts` (kerja). Editor/autosave hanya menulis draft; hanya `publish` yang menyalin ke artikel. Slug dikunci setelah terbit pertama.
7. Setelah publish/unpublish/hapus, backend memanggil `revalidate.Async(...)`. Fitur baru yang mengubah konten publik juga harus memanggilnya.
8. Gambar hanya lewat `POST /api/v1/admin/uploads` (WebP ≤1920×1080 q80). Backend menolak URL gambar eksternal di konten.
9. Superadmin = akun pertama, maksimal satu, tidak bisa diubah lewat kelola akun. Admin tidak bisa menonaktifkan/menghapus diri sendiri.
10. `docker-compose.prod.yml`: **jangan ubah `name: sonychristanto`**, karena volume Postgres dan RustFS (`sonychristanto_pg_data`, `sonychristanto_rustfs_data`) akan berganti dan data tampak hilang. RustFS adalah service milik proyek ini; port S3-nya sengaja tidak diekspos.
11. Key baru di `.env.prod.example` yang bersifat rahasia → nilai `__SECRET__` + tambahkan ke daftar GitHub secrets (dokumen ops). Deploy gagal bila secret-nya belum dibuat.
12. JSON-LD lewat `useJsonLd()` (diteruskan ke `useSchemaOrg` dari nuxt-schema-org, satu graph per halaman). Entitas `Person` adalah *identity* di `nuxt.config.ts` (`schemaOrg.identity` ← `utils/schema.ts#personIdentity`) dengan `@id` `${siteUrl}/#identity`. Rujuk dengan `personId(siteUrl)`, jangan buat node Person baru.
13. **i18n `/id` & `/en` (strategi `prefix`).** Semua link publik lewat `lp()` dari `useL()` (= `useLocalePath`), jangan tulis `/biografi` mentah. Teks UI di `frontend/i18n/locales/{id,en}.json` (key sama di kedua file); konten di `app/data/*` ditulis `{ id, en }` dan dibaca dengan `tx()`. Halaman dashboard wajib `i18n: false` di `definePageMeta`. Artikel blog hanya berbahasa Indonesia: `/en/blog/**` = `noindex` + canonical ke `/id` dan tidak masuk sitemap.
14. **Redirect `/` dan URL lama tanpa prefix** ada di `server/middleware/locale-redirect.ts`, **bukan** di `routeRules` (modul sitemap/robots membuang URL yang cocok dengan route rule redirect setelah prefix locale dilepas).
15. **Motion**: Lenis + GSAP hanya di `plugins/motion.client.ts`; komponen memakai `useGsap(scopeRef, fn)` (otomatis revert & tidak jalan saat reduced motion). Konten tidak boleh disembunyikan di SSR: pakai `data-reveal`/`RevealText` (kontrak `html.js` di `app.vue` + fallback CSS). Saat GSAP menganimasikan elemen yang disembunyikan CSS lewat `translateY(%)`, sertakan `y: 0` pada `fromTo` (GSAP mem-parse transform CSS ke `y`). Tidak ada parallax/gerak pointer pada teks (DESIGN.md §9).
16. Logo hanya dari `app/assets/brand/logo-paths.ts` → `npm run brand:build` (menulis SVG/PNG/favicon dan placeholder foto yang belum ada). Nama file foto di `public/images/**` tetap (DESIGN.md §12.3).

## Konvensi kode

### Backend (Go)
- Handler di `internal/handlers`, route di `internal/router/router.go`. Respons lewat helper `ok`, `okMeta`, `fail`, `failFields`, `internal`, `notFound`.
- Error validasi: 422 `VALIDATION_ERROR` + `fields` (pesan Bahasa Indonesia, siap tampil di UI).
- Perubahan multi-tabel → `h.DB.Transaction`. Konflik konkuren → optimistic lock (`version`) atau `clause.Locking`.
- Tambah tes untuk logika murni (`content`, `slug`, `imageproc`).

### Frontend (Nuxt 4)
- Komponen auto-import tanpa prefix folder (`pathPrefix: false`). Nama file harus unik.
- Halaman publik: `usePageSeo({...})` wajib (path tanpa prefix locale), ditambah `useJsonLd` bila relevan. Satu `<h1>` per halaman. Root elemen halaman `<div class="page-root">` (transisi halaman butuh elemen nyata, bukan `contents`).
- Teks: `const { t, tx, lp, period, date } = useL()`. Judul dengan `<br>` di locale JSON dirender `v-html` (teks tepercaya).
- Fetch publik: `useFetch('/api/v1/...')` (relatif; di server Nitro diteruskan ke backend). Dashboard: `useAdminApi()`.
- Halaman dashboard: `definePageMeta({ layout: 'dashboard', middleware: 'auth', i18n: false })`.
- Styling: Tailwind v4 + token "Editorial Signal" di `app/assets/css/main.css` (lihat `docs/DESIGN.md` §12). Utilitas custom pakai `@utility`, bukan `@layer components` (Tailwind v4 tidak bisa `@apply` class komponen).
- Modul React (`app/editor/`) hanya di-import secara dinamis dari komponen `.client.vue`. Jangan import React di halaman publik.

## Dokumen

Ubah dokumen bersamaan dengan kode: endpoint → `docs/API.md`, keputusan arsitektur → `docs/architecture.md`, aturan bisnis → `docs/PRD.md`, token/komponen → `docs/DESIGN.md`.
