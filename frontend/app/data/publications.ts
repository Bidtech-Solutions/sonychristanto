// Modul Karya Tulis — static content (mostly scientific articles).
// No data from the client yet. Detail pages emit ScholarlyArticle JSON-LD.

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
  abstract: string
  keywords?: string[]
}

export const publicationTypeLabel: Record<PublicationType, string> = {
  'artikel-ilmiah': 'Artikel ilmiah',
  buku: 'Buku',
  opini: 'Opini',
  lainnya: 'Lainnya',
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
  //   abstract: 'Abstrak singkat.',
  //   keywords: ['pendidikan', 'Batam'],
  // },
]
