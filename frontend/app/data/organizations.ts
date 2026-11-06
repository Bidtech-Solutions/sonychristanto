// Modul Organisasi — static content. Source: CV Sony Christanto.
// `contributions` and `description` are empty until the client supplies them;
// the detail page simply hides empty sections.

export type OrganizationKind = 'organisasi' | 'partai'

export interface Organization {
  slug: string
  name: string
  role: string // '' when the CV does not state the role
  start: number
  end: number | null
  kind: OrganizationKind
  description?: string
  contributions?: string[]
  url?: string
  logo?: string // /images/organisasi/<slug>.webp
}

export const organizations: Organization[] = [
  { slug: 'badan-musyawarah-perguruan-swasta-kepri', name: 'Badan Musyawarah Perguruan Swasta Kepri', role: 'Ketua', start: 2025, end: 2030, kind: 'organisasi' },
  { slug: 'pgiw-kepri', name: 'PGIW Kepri', role: 'Ketua Komisi Pendidikan', start: 2025, end: 2030, kind: 'organisasi' },
  { slug: 'dpd-gempar-indonesia-kepri', name: 'DPD Gempar Indonesia Kepri', role: 'Ketua', start: 2024, end: 2029, kind: 'organisasi' },
  { slug: 'pengkot-perbakin-kota-batam', name: 'Pengkot Perbakin Kota Batam', role: 'Wakil Ketua', start: 2024, end: 2029, kind: 'organisasi' },
  { slug: 'bamagnas-kepri', name: 'BAMAGNAS Kepri', role: 'Ketua Yayasan', start: 2023, end: 2029, kind: 'organisasi' },
  { slug: 'koni-kota-batam', name: 'KONI Kota Batam', role: 'Wakil Ketua', start: 2023, end: 2028, kind: 'organisasi' },
  // TODO(klien): CV menulis "Kontap Pendidikan" — konfirmasi ejaan jabatan.
  { slug: 'kadin-batam', name: 'KADIN Batam', role: 'Kontap Pendidikan', start: 2020, end: 2025, kind: 'organisasi' },
  { slug: 'majelis-pendidikan-kristen-wilayah-kepri', name: 'Majelis Pendidikan Kristen Wilayah Kepri', role: 'Sekretaris', start: 2018, end: 2023, kind: 'organisasi' },
  // TODO(klien): jabatan tidak tertulis di CV.
  { slug: 'badan-kerjasama-antar-gereja-batam', name: 'Badan Kerjasama Antar Gereja Batam', role: '', start: 2017, end: 2022, kind: 'organisasi' },
  { slug: 'dewan-pendidikan-kota-batam', name: 'Dewan Pendidikan Kota Batam', role: 'Bendahara', start: 2016, end: 2021, kind: 'organisasi' },

  // TODO(klien): konfirmasi apakah riwayat kepartaian ditampilkan semua, sebagian, atau hanya yang aktif.
  { slug: 'dpw-psi-kepri', name: 'DPW PSI Kepri', role: 'Wakil Ketua', start: 2025, end: 2030, kind: 'partai' },
  { slug: 'dpd-psi-kota-batam', name: 'DPD PSI Kota Batam', role: 'Ketua', start: 2022, end: 2023, kind: 'partai' },
  { slug: 'dpw-partai-nasdem', name: 'DPW Partai Nasdem', role: 'Wakil Ketua', start: 2016, end: 2021, kind: 'partai' },
  { slug: 'kira-kepri', name: 'KIRA Kepri', role: 'Wakil Ketua', start: 2013, end: 2015, kind: 'partai' },
]

export const isOngoing = (o: Organization, year = new Date().getFullYear()) => o.end === null || o.end >= year

export const periodLabel = (o: { start: number; end: number | null }) => `${o.start} – ${o.end ?? 'sekarang'}`
