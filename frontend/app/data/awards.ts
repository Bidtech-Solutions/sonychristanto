// Modul Penghargaan — static content. No data from the client yet.
// Add entries here; list + detail pages and the sitemap pick them up on the next build.

export interface Award {
  slug: string
  title: string
  issuer: string
  year: number
  date?: string // ISO yyyy-mm-dd when known
  summary: string // 1–2 sentences, used on the list page & meta description
  body?: string[] // paragraphs for the detail page
  image?: { src: string; alt: string } // /images/penghargaan/<slug>.webp
}

export const awards: Award[] = [
  // Contoh format (hapus komentar setelah data dari klien masuk):
  // {
  //   slug: 'nama-penghargaan-2025',
  //   title: 'Nama Penghargaan',
  //   issuer: 'Lembaga Pemberi',
  //   year: 2025,
  //   summary: 'Ringkasan singkat penghargaan.',
  //   body: ['Paragraf cerita di balik penghargaan.'],
  //   image: { src: '/images/penghargaan/nama-penghargaan-2025.webp', alt: 'Penyerahan penghargaan ...' },
  // },
]
