// Modul Penghargaan — static content. No data from the client yet.
import type { L } from './i18n'

// Add entries here; list + detail pages and the sitemap pick them up on the next build.

export interface Award {
  slug: string
  title: L
  issuer: string
  year: number
  date?: string // ISO yyyy-mm-dd when known
  summary: L // 1–2 sentences, used on the list page & meta description
  body?: L[] // paragraphs for the detail page
  image?: { src: string; alt: L } // /images/penghargaan/<slug>.webp
}

export const awards: Award[] = [
  // Contoh format (hapus komentar setelah data dari klien masuk):
  // {
  //   slug: 'nama-penghargaan-2025',
  //   title: { id: 'Nama Penghargaan', en: 'Award Name' },
  //   issuer: 'Lembaga Pemberi',
  //   year: 2025,
  //   summary: { id: 'Ringkasan singkat penghargaan.', en: 'Short summary.' },
  //   body: [{ id: 'Paragraf cerita.', en: 'Story paragraph.' }],
  //   image: { src: '/images/penghargaan/nama-penghargaan-2025.webp', alt: { id: 'Penyerahan penghargaan', en: 'Award ceremony' } },
  // },
]
