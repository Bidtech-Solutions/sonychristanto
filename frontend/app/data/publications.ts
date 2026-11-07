// Modul Karya Tulis — static content (mostly scientific articles).
// No data from the client yet. Detail pages emit ScholarlyArticle JSON-LD.

import type { L } from './i18n'

export type PublicationType = 'artikel-ilmiah' | 'buku' | 'opini' | 'lainnya'

export interface Publication {
  slug: string
  title: string
  type: PublicationType
  year: number
  authors: string[] // in citation order, e.g. ['Sony Christanto', 'Rekan Penulis']
  venue?: string // journal / publisher / media
  volume?: string
  pages?: string
  doi?: string
  url?: string // external link to the full text
  pdf?: string // /files/karya-tulis/<slug>.pdf when the client permits hosting it
  abstract: L // abstrak; bila hanya satu bahasa, isi keduanya dengan teks yang sama
  keywords?: string[]
}

export const publicationTypeLabel: Record<PublicationType, L> = {
  'artikel-ilmiah': { id: 'Artikel ilmiah', en: 'Scholarly article' },
  buku: { id: 'Buku', en: 'Book' },
  opini: { id: 'Opini', en: 'Opinion' },
  lainnya: { id: 'Lainnya', en: 'Other' },
}

export const publications: Publication[] = [
  // Contoh format:
  // {
  //   slug: 'judul-artikel-ilmiah-2014',
  //   title: 'Judul Artikel Ilmiah',
  //   type: 'artikel-ilmiah',
  //   year: 2014,
  //   authors: ['Sony Christanto'],
  //   venue: 'Nama Jurnal',
  //   doi: '10.xxxx/xxxxx',
  //   abstract: { id: 'Abstrak singkat.', en: 'Short abstract.' },
  //   keywords: ['pendidikan', 'Batam'],
  // },
]
