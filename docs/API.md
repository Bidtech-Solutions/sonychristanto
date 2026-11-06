# API — sonychristanto.com

Base URL: `https://sonychristanto.com/api/v1` (dev: `http://localhost:8080/api/v1`, atau lewat proxy Nuxt `http://localhost:3000/api/v1`).

## Konvensi

- JSON UTF-8. Waktu dalam ISO 8601 (zona server `Asia/Jakarta`).
- **Sukses:** `{ "data": ..., "meta": { ... } }` (`meta` hanya pada list berhalaman).
- **Error:** `{ "error": { "code": "...", "message": "pesan untuk pengguna", "fields": { "field": "pesan" } } }`.
- Paginasi: `?page=1&per_page=20` → `meta: { page, per_page, total, total_pages }`.
- Auth: cookie `sc_session` (httpOnly, diset oleh `/auth/login`). Alternatif untuk pengujian: `Authorization: Bearer <jwt>`.
- Semua respons `/api/v1/admin/*` dan `/api/v1/auth/*` memakai `Cache-Control: no-store`.

### Kode error

| HTTP | `code` | Arti |
|---|---|---|
| 400 | `BAD_REQUEST` | Body bukan JSON valid |
| 401 | `UNAUTHENTICATED` | Belum login / token tidak valid |
| 401 | `SESSION_REVOKED` | Password diganti / sesi dicabut |
| 401 | `INVALID_CREDENTIALS` | Email atau password salah |
| 403 | `ACCOUNT_INACTIVE` | Akun dinonaktifkan |
| 403 | `SUPERADMIN_PROTECTED` | Aksi terhadap superadmin lewat kelola akun |
| 403 | `SELF_ACTION_FORBIDDEN` | Menonaktifkan/menghapus/reset akun sendiri |
| 404 | `NOT_FOUND` | Data tidak ada (termasuk artikel draft/nonaktif di endpoint publik) |
| 409 | `DRAFT_CONFLICT` | Versi draft basi; respons berisi `current_version` |
| 409 | `INVALID_STATE` | Transisi status tidak valid |
| 413 | `FILE_TOO_LARGE` | Upload > `UPLOAD_MAX_MB` |
| 422 | `VALIDATION_ERROR` | Lihat `fields` |
| 429 | `RATE_LIMITED` | Terlalu banyak percobaan |
| 500 | `INTERNAL_ERROR` | Kesalahan server |

---

## Publik

### `GET /health`
`200 { "data": { "status": "ok" } }`

### `GET /categories`
```json
{ "data": [ { "key": "perspektif-sony", "label": "Perspektif Sony" }, { "key": "agenda-sony", "label": "Agenda Sony" } ] }
```

### `GET /articles`
Query: `category` (opsional, key kategori), `page`, `per_page` (default 9, maks 30). Hanya artikel `published`, urut `published_at` terbaru. Tanpa `content`.

```json
{
  "data": [{
    "slug": "masa-depan-pendidikan-swasta-di-kepri",
    "title": "Masa Depan Pendidikan Swasta di Kepri",
    "excerpt": "…",
    "category": { "key": "perspektif-sony", "label": "Perspektif Sony" },
    "banner_url": "/media/uploads/banner/2026/11/<uuid>.webp",
    "banner_alt": "Rapat pendidikan",
    "reading_minutes": 3,
    "published_at": "2026-11-06T13:50:00+07:00",
    "updated_at": "2026-11-06T14:10:00+07:00"
  }],
  "meta": { "page": 1, "per_page": 9, "total": 1, "total_pages": 1 }
}
```
Kategori tidak dikenal → 404.

### `GET /articles/:slug`
Seperti item list + `content` (array blok BlockNote) + `author: { name }`. Draft/nonaktif/tidak ada → 404.

### `GET /feeds/articles?include_text=1`
Semua artikel terbit (maks 5000) untuk sitemap/RSS/llms. `include_text=1` menambah `content_text` (teks polos).

### `GET /media/*key` (di luar `/api/v1`)
Stream gambar dari bucket. `Cache-Control: public, max-age=31536000, immutable`, `ETag`, mendukung `HEAD` dan `If-None-Match`. Hanya key di bawah `uploads/`.

---

## Auth

### `POST /auth/login` (rate limit 5 percobaan, lalu 1/12 detik per IP)
Body `{ "email": "admin@…", "password": "…" }` (email tidak case-sensitive).
`200 { "data": { "admin": Admin, "expires_at": "…" } }` + `Set-Cookie: sc_session=…; HttpOnly; Secure; SameSite=Lax`.
Error: 401 `INVALID_CREDENTIALS`, 403 `ACCOUNT_INACTIVE`, 429.

### `POST /auth/logout`
`204`, menghapus cookie.

### `GET /auth/me` 🔒
`200 { "data": Admin }`

**Admin**
```json
{ "id": "uuid", "name": "Super Admin", "email": "admin@…", "avatar_url": null,
  "is_superadmin": true, "is_active": true, "last_login_at": "…", "created_at": "…", "updated_at": "…" }
```

---

## Profil sendiri 🔒

### `PUT /admin/profile`
Body `{ "name": "…", "email": "…", "avatar_url": "/media/…" | "" }` (`""` = hapus avatar; `avatar_url` harus dari upload). → `200 Admin`.

### `PUT /admin/profile/password`
Body `{ "current_password": "…", "new_password": "…" }` (8–72 byte). → `204`. Sesi perangkat lain berakhir; perangkat ini mendapat cookie baru.

---

## Kelola akun 🔒

| Method & path | Body | Hasil |
|---|---|---|
| `GET /admin/accounts` | — | `200 Admin[]` (superadmin di atas) |
| `POST /admin/accounts` | `{ name, email, password }` | `201 Admin` · 422 email dipakai |
| `GET /admin/accounts/:id` | — | `200 Admin` |
| `PUT /admin/accounts/:id` | `{ name, email }` | `200 Admin` · 403 superadmin |
| `PATCH /admin/accounts/:id/status` | `{ is_active: bool }` | `200 Admin` · 403 superadmin/diri sendiri. Nonaktif → sesi akun itu berakhir |
| `PUT /admin/accounts/:id/password` | `{ new_password }` | `204` · 403 superadmin/diri sendiri. Sesi akun itu berakhir |
| `DELETE /admin/accounts/:id` | — | `204` · 403 superadmin/diri sendiri. Artikelnya tetap (penulis = null) |

---

## Artikel (dashboard) 🔒

**AdminArticle**
```json
{
  "id": "uuid",
  "status": "draft | published | inactive",
  "slug": null,
  "has_unpublished_changes": false,
  "published": { "title": "…", "excerpt": "…", "category": "perspektif-sony", "banner_url": "…" },
  "draft": {
    "title": "…", "slug": "", "excerpt": "", "category": "perspektif-sony",
    "banner_url": null, "banner_alt": "", "content": [ /* blok */ ],
    "version": 4, "updated_at": "…"
  },
  "author": { "name": "Super Admin", "avatar_url": null },
  "published_at": null, "last_published_at": null, "created_at": "…", "updated_at": "…"
}
```
`published` = `null` bila belum pernah terbit. `draft.content` hanya ada di endpoint detail/create/publish.

| Method & path | Keterangan |
|---|---|
| `GET /admin/articles?status=&category=&q=&page=&per_page=` | List (maks 50/halaman), urut draft terakhir diubah. `q` mencari judul draft/terbit |
| `POST /admin/articles` | Body opsional `{ category?, title? }` → `201 AdminArticle` (draft kosong) |
| `GET /admin/articles/:id` | `200 AdminArticle` |
| `PUT /admin/articles/:id/draft` | **Autosave.** Body `{ title, slug, excerpt, category, banner_url, banner_alt, content, version }` → `200 { version, updated_at }` |
| `POST /admin/articles/:id/publish` | Validasi penuh → salin draft ke versi publik → `200 AdminArticle`. Memicu revalidate |
| `POST /admin/articles/:id/unpublish` | `published` → `inactive`. 409 bila bukan `published` |
| `POST /admin/articles/:id/discard-draft` | Draft dikembalikan ke versi terbit. 409 bila belum pernah terbit |
| `DELETE /admin/articles/:id` | Hapus permanen → `204` |

**Aturan `PUT …/draft` (longgar, draft boleh belum lengkap):**
- `version` = versi draft terakhir yang diketahui klien. Beda → **409 `DRAFT_CONFLICT`** (tidak menimpa). `version: 0` = lewati pengecekan (jangan dipakai di UI).
- `title` ≤ 200, `excerpt` ≤ 300, `banner_alt` ≤ 200, `slug` `^[a-z0-9]+(-[a-z0-9]+)*$` (diabaikan setelah terbit pertama), `category` kosong atau valid, `banner_url` harus `/media/…`.
- `content` = array blok BlockNote: tipe hanya `paragraph, heading, quote, bulletListItem, numberedListItem, checkListItem, image, divider, columnList, column`; `columnList` **maks 2 `column`**; `image.props.url` harus `/media/…`; maks 2 MB.

**Aturan publish (ketat):** judul ≥ 5 karakter, kategori valid, isi ≥ 50 karakter teks, `banner_alt` wajib bila ada banner. Slug dibuat dari `draft.slug` atau judul, unik (`-2`, `-3`, …), lalu dikunci. `excerpt` kosong → 160 karakter pertama isi.

---

## Upload 🔒

### `POST /admin/uploads` (multipart, rate limit)
Field: `file` (JPG/PNG/WebP/GIF, ≤ 10 MB, ≤ 50 MP), `purpose` = `article` | `banner` | `avatar`.
Diproses: rotasi EXIF → *fit* ≤ 1920×1080 (avatar: crop 512×512) → WebP q80.
```json
{ "data": { "id": "uuid", "key": "uploads/banner/2026/11/<uuid>.webp", "url": "/media/uploads/banner/2026/11/<uuid>.webp",
            "purpose": "banner", "width": 1440, "height": 1080, "size_bytes": 48211, "created_at": "…" } }
```

---

## Endpoint internal frontend

### `POST /_internal/revalidate` (Nuxt, bukan backend)
Header `X-Revalidate-Secret: $REVALIDATE_SECRET`. Body `{ "paths": [...] }` (informatif). Menghapus seluruh cache ISR Nitro. Dipanggil backend setelah publish/unpublish/hapus. Sebaiknya diblokir dari internet di nginx.

## Uji cepat

```bash
./backend/scripts/smoke-test.sh   # 50 cek E2E terhadap stack dev
```
