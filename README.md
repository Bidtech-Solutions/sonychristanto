# sonychristanto.com

Website personal branding + blog + dashboard CMS untuk **Sony Christanto, SE., M.Si** (Anggota DPRD Kota Batam). Dikembangkan oleh Bidtech.

- **Frontend:** Nuxt 4 (SSG + ISR), Tailwind CSS v4, editor BlockNote
- **Backend:** Go 1.26 + Gin + GORM + JWT + bcrypt
- **Data:** PostgreSQL 17, RustFS (S3) untuk gambar
- **Deploy:** GitHub Actions → GHCR → VPS (Docker Compose), di balik nginx + Cloudflare

Dokumen: [PRD](docs/PRD.md) · [Arsitektur](docs/architecture.md) · [API](docs/API.md) · [Desain](docs/DESIGN.md)

## Mulai development

Prasyarat: Docker + Docker Compose v2.

```bash
cp .env.example .env
docker compose up -d --build
```

| URL                                   |                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| http://localhost:3000                 | Website                                                                          |
| http://localhost:3000/dashboard       | Dashboard, login `admin@sonychristanto.local` / `admin12345` (dari `.env`) |
| http://localhost:8080/api/v1/health   | Backend                                                                          |
| http://localhost:9001/rustfs/console/ | Console RustFS (`rustfsadmin` / `rustfsadmin`)                               |

Frontend (`nuxt dev`) dan backend (`air`) hot reload dari folder lokal. Start pertama butuh 1–2 menit (install dependency + kompilasi).

```bash
docker compose logs -f backend frontend   # log
docker compose down                       # stop (data tetap)
docker compose down -v                    # stop + HAPUS database & file lokal
./backend/scripts/smoke-test.sh           # uji E2E API (butuh curl, jq, python3+Pillow)
```

### Tanpa Docker (opsional)

```bash
# backend (butuh Postgres & RustFS yang jalan, mis. `docker compose up -d postgres rustfs`)
cd backend && set -a && . ../.env && set +a && \
  POSTGRES_HOST=localhost S3_ENDPOINT=localhost:9000 go run -tags nodynamic ./cmd/server
# frontend
cd frontend && npm install && NUXT_API_INTERNAL_URL=http://localhost:8080 npm run dev
```

### Pemeriksaan sebelum push (sama dengan CI)

```bash
cd backend  && gofmt -l . && go vet -tags nodynamic ./... && go test -tags nodynamic ./...
cd frontend && npm run typecheck && npm run build
```

## Mengubah konten statis

Biografi, organisasi, penghargaan, karya tulis, galeri, dan kontak **tidak** dikelola di dashboard. Edit file di `frontend/app/data/`, commit, push. Halaman (termasuk halaman detail) dibuat ulang saat deploy. Cari `TODO(klien)` untuk data yang masih ditunggu dari klien.

Gambar statis: `cd frontend && npm run images:optimize -- <folder-foto> public/images/galeri` (WebP, maks 1920×1080, q80).

## Deploy

Push ke `main` menjalankan test, build image, push ke GHCR, lalu deploy ke VPS. Daftar GitHub secrets, setup awal VPS, konfigurasi nginx, dan Cloudflare ada di **bundle ops** (terpisah dari repo).

Setup awal di VPS (sekali):

```bash
sudo mkdir -p /opt/sonychristanto
# Postgres dan RustFS ikut di docker-compose.prod.yml proyek ini (volume sendiri), tidak perlu setup terpisah.
# Package GHCR private: VPS login otomatis saat deploy memakai GITHUB_TOKEN job.
```

## Struktur

```
backend/    Go API (cmd/server, internal/*)
frontend/   Nuxt app (app/ = website + dashboard, server/ = sitemap, robots, llms, proxy)
docs/       PRD, arsitektur, API, desain
.github/    workflow CI/CD
```

Panduan untuk AI coding agent: [AGENTS.md](AGENTS.md) / [CLAUDE.m](CLAUDE.md)

# sonychristanto.com

Website personal branding + blog + dashboard CMS untuk **Sony Christanto, SE., M.Si** (Anggota DPRD Kota Batam). Dikembangkan oleh Bidtech.

- **Frontend:** Nuxt 4 (SSG + ISR), Tailwind CSS v4, editor BlockNote
- **Backend:** Go 1.26 + Gin + GORM + JWT + bcrypt
- **Data:** PostgreSQL 17, RustFS (S3) untuk gambar
- **Deploy:** GitHub Actions → GHCR → VPS (Docker Compose), di balik nginx + Cloudflare

Dokumen: [PRD](docs/PRD.md) · [Arsitektur](docs/architecture.md) · [API](docs/API.md) · [Desain](docs/DESIGN.md)

## Mulai development

Prasyarat: Docker + Docker Compose v2.

```bash
cp .env.example .env
docker compose up -d --build
```

| URL                                 |                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| http://localhost:3000               | Website                                                                          |
| http://localhost:3000/dashboard     | Dashboard, login `admin@sonychristanto.local` / `admin12345` (dari `.env`) |
| http://localhost:8080/api/v1/health | Backend                                                                          |
| http://localhost:9001               | Console RustFS (`rustfsadmin` / `rustfsadmin`)                               |

Frontend (`nuxt dev`) dan backend (`air`) hot reload dari folder lokal. Start pertama butuh 1–2 menit (install dependency + kompilasi).

```bash
docker compose logs -f backend frontend   # log
docker compose down                       # stop (data tetap)
docker compose down -v                    # stop + HAPUS database & file lokal
./backend/scripts/smoke-test.sh           # uji E2E API (butuh curl, jq, python3+Pillow)
```

### Tanpa Docker (opsional)

```bash
# backend (butuh Postgres & RustFS yang jalan, mis. `docker compose up -d postgres rustfs`)
cd backend && set -a && . ../.env && set +a && \
  POSTGRES_HOST=localhost S3_ENDPOINT=localhost:9000 go run -tags nodynamic ./cmd/server
# frontend
cd frontend && npm install && NUXT_API_INTERNAL_URL=http://localhost:8080 npm run dev
```

### Pemeriksaan sebelum push (sama dengan CI)

```bash
cd backend  && gofmt -l . && go vet -tags nodynamic ./... && go test -tags nodynamic ./...
cd frontend && npm run typecheck && npm run build
```

## Mengubah konten statis

Biografi, organisasi, penghargaan, karya tulis, galeri, dan kontak **tidak** dikelola di dashboard. Edit file di `frontend/app/data/`, commit, push. Halaman (termasuk halaman detail) dibuat ulang saat deploy. Cari `TODO(klien)` untuk data yang masih ditunggu dari klien.

Gambar statis: `cd frontend && npm run images:optimize -- <folder-foto> public/images/galeri` (WebP, maks 1920×1080, q80).

## Deploy

Push ke `main` menjalankan test, build image, push ke GHCR, lalu deploy ke VPS. Daftar GitHub secrets, setup awal VPS, konfigurasi nginx, dan Cloudflare ada di **bundle ops** (terpisah dari repo).

Setup awal di VPS (sekali):

```bash
sudo mkdir -p /opt/sonychristanto
docker network ls | grep -i rustfs   # catat nama network RustFS → secret/var RUSTFS_DOCKER_NETWORK
# Jika package GHCR private: VPS login otomatis saat deploy memakai GITHUB_TOKEN job.
```

## Struktur

```
backend/    Go API (cmd/server, internal/*)
frontend/   Nuxt app (app/ = website + dashboard, server/ = sitemap, robots, llms, proxy)
docs/       PRD, arsitektur, API, desain
.github/    workflow CI/CD
```

Panduan untuk AI coding agent: [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md).
