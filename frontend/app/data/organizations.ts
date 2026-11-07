// Modul Organisasi — static content. Source: CV Sony Christanto.
// `description` is a factual one-liner built only from the CV (name, role, period)
// plus the literal meaning of the organisation's name. `contributions` stays empty
// until the client supplies them; the detail page simply hides empty sections.
// TODO(klien): deskripsi/kontribusi yang lebih kaya dari Pak Sony.
import type { L } from './i18n'

export type OrganizationKind = 'organisasi' | 'partai'

export interface Organization {
  slug: string
  name: string // nama resmi (tidak diterjemahkan)
  short: string // nama pendek untuk pita merah & linimasa
  initials: string
  role: L | null // null bila CV tidak menyebut jabatan
  roleNote?: L
  start: number
  end: number | null
  kind: OrganizationKind
  description?: L
  contributions?: L[]
  url?: string
  /** /images/organisasi/<slug>.webp — placeholder inisial sampai logo asli diunggah. */
  logo?: string
}

const logo = (slug: string) => `/images/organisasi/${slug}.webp`
const r = (id: string, en: string): L => ({ id, en })

export const organizations: Organization[] = [
  { slug: 'badan-musyawarah-perguruan-swasta-kepri', name: 'Badan Musyawarah Perguruan Swasta Kepri', short: 'BMPS Kepri', initials: 'BM', role: r('Ketua', 'Chair'), start: 2025, end: 2030, kind: 'organisasi', logo: logo('bmps-kepri'), description: r('Badan Musyawarah Perguruan Swasta (BMPS) Kepri adalah wadah musyawarah bagi perguruan swasta di Kepulauan Riau. Sony Christanto menjabat Ketua untuk periode 2025–2030.', 'The Riau Islands Private School Council (BMPS Kepri) is a forum for private educational institutions in the Riau Islands. Sony Christanto serves as Chair for the 2025–2030 term.') },
  { slug: 'pgiw-kepri', name: 'PGIW Kepri', short: 'PGIW Kepri', initials: 'PG', role: r('Ketua Komisi Pendidikan', 'Chair, Education Commission'), start: 2025, end: 2030, kind: 'organisasi', logo: logo('pgiw-kepri'), description: r('PGIW Kepri adalah Persekutuan Gereja-gereja di Indonesia Wilayah Kepulauan Riau. Sony Christanto menjabat Ketua Komisi Pendidikan untuk periode 2025–2030.', 'PGIW Kepri is the Riau Islands regional body of the Communion of Churches in Indonesia (PGI). Sony Christanto serves as Chair of the Education Commission for the 2025–2030 term.') },
  { slug: 'dpd-gempar-indonesia-kepri', name: 'DPD Gempar Indonesia Kepri', short: 'Gempar Indonesia Kepri', initials: 'GI', role: r('Ketua', 'Chair'), start: 2024, end: 2029, kind: 'organisasi', logo: logo('gempar-indonesia-kepri'), description: r('Sony Christanto menjabat Ketua DPD Gempar Indonesia Kepri untuk periode 2024–2029.', 'Sony Christanto serves as Chair of DPD Gempar Indonesia Kepri for the 2024–2029 term.') },
  { slug: 'pengkot-perbakin-kota-batam', name: 'Pengkot Perbakin Kota Batam', short: 'Perbakin Kota Batam', initials: 'PB', role: r('Wakil Ketua', 'Vice Chair'), start: 2024, end: 2029, kind: 'organisasi', logo: logo('perbakin-kota-batam'), description: r('Pengkot Perbakin Kota Batam adalah pengurus kota Persatuan Menembak Sasaran dan Berburu Seluruh Indonesia (Perbakin), organisasi olahraga menembak. Sony Christanto menjabat Wakil Ketua untuk periode 2024–2029.', 'Pengkot Perbakin Kota Batam is the Batam city board of Perbakin, the Indonesian shooting sports federation. Sony Christanto serves as Vice Chair for the 2024–2029 term.') },
  { slug: 'bamagnas-kepri', name: 'BAMAGNAS Kepri', short: 'BAMAGNAS Kepri', initials: 'BG', role: r('Ketua Yayasan', 'Chair of the Foundation'), start: 2023, end: 2029, kind: 'organisasi', logo: logo('bamagnas-kepri'), description: r('Sony Christanto menjabat Ketua Yayasan BAMAGNAS Kepri untuk periode 2023–2029.', 'Sony Christanto serves as Chair of the BAMAGNAS Kepri Foundation for the 2023–2029 term.') },
  { slug: 'koni-kota-batam', name: 'KONI Kota Batam', short: 'KONI Kota Batam', initials: 'KO', role: r('Wakil Ketua', 'Vice Chair'), start: 2023, end: 2028, kind: 'organisasi', logo: logo('koni-kota-batam'), description: r('KONI Kota Batam adalah Komite Olahraga Nasional Indonesia di tingkat Kota Batam. Sony Christanto menjabat Wakil Ketua untuk periode 2023–2028.', 'KONI Kota Batam is the Batam city chapter of the Indonesian National Sports Committee. Sony Christanto serves as Vice Chair for the 2023–2028 term.') },
  // TODO(klien): CV menulis "Kontap Pendidikan" — konfirmasi ejaan jabatan.
  { slug: 'kadin-batam', name: 'KADIN Batam', short: 'KADIN Batam', initials: 'KD', role: r('Kontap Pendidikan', 'Kontap Pendidikan'), start: 2020, end: 2025, kind: 'organisasi', logo: logo('kadin-batam'), description: r('KADIN Batam adalah Kamar Dagang dan Industri Batam. Sony Christanto tercatat pada periode 2020–2025 dengan jabatan Kontap Pendidikan.', 'KADIN Batam is the Batam Chamber of Commerce and Industry. Sony Christanto is listed for the 2020–2025 term as Kontap Pendidikan.') },
  { slug: 'majelis-pendidikan-kristen-wilayah-kepri', name: 'Majelis Pendidikan Kristen Wilayah Kepri', short: 'MPK Wilayah Kepri', initials: 'MP', role: r('Sekretaris', 'Secretary'), start: 2018, end: 2023, kind: 'organisasi', logo: logo('mpk-kepri'), description: r('Majelis Pendidikan Kristen (MPK) Wilayah Kepri adalah majelis pendidikan Kristen tingkat Wilayah Kepulauan Riau. Sony Christanto menjabat Sekretaris pada periode 2018–2023.', 'The Christian Education Council (MPK) of the Riau Islands region is the regional council for Christian education. Sony Christanto served as Secretary for the 2018–2023 term.') },
  // TODO(klien): jabatan tidak tertulis di CV.
  { slug: 'badan-kerjasama-antar-gereja-batam', name: 'Badan Kerjasama Antar Gereja Batam', short: 'BKAG Batam', initials: 'BK', role: r('Anggota', 'Member'), start: 2017, end: 2022, kind: 'organisasi', logo: logo('bkag-batam'), description: r('Badan Kerjasama Antar Gereja (BKAG) Batam adalah forum kerja sama antargereja di Kota Batam. Sony Christanto menjadi anggota pada periode 2017–2022.', 'The Batam Inter-Church Cooperation Body (BKAG Batam) is a forum for cooperation among churches in Batam. Sony Christanto was a member for the 2017–2022 term.') },
  { slug: 'dewan-pendidikan-kota-batam', name: 'Dewan Pendidikan Kota Batam', short: 'Dewan Pendidikan Kota Batam', initials: 'DP', role: r('Bendahara', 'Treasurer'), start: 2016, end: 2021, kind: 'organisasi', logo: logo('dewan-pendidikan-kota-batam'), description: r('Dewan Pendidikan Kota Batam adalah dewan yang berfokus pada bidang pendidikan di Kota Batam. Sony Christanto menjabat Bendahara pada periode 2016–2021.', 'The Batam City Education Council is a council focused on education in Batam. Sony Christanto served as Treasurer for the 2016–2021 term.') },

  // TODO(klien): K-4 — konfirmasi apakah riwayat kepartaian ditampilkan semua, sebagian, atau hanya yang aktif.
  { slug: 'dpw-psi-kepri', name: 'DPW PSI Kepri', short: 'DPW PSI Kepri', initials: 'PS', role: r('Wakil Ketua', 'Vice Chair'), start: 2025, end: 2030, kind: 'partai', logo: logo('psi'), description: r('Sony Christanto menjabat Wakil Ketua Dewan Pengurus Wilayah (DPW) Partai Solidaritas Indonesia (PSI) Kepri untuk periode 2025–2030.', 'Sony Christanto serves as Vice Chair of the Riau Islands Regional Board (DPW) of the Indonesian Solidarity Party (PSI) for the 2025–2030 term.') },
  { slug: 'dpd-psi-kota-batam', name: 'DPD PSI Kota Batam', short: 'DPD PSI Kota Batam', initials: 'PS', role: r('Ketua', 'Chair'), start: 2022, end: 2023, kind: 'partai', logo: logo('psi'), description: r('Sony Christanto menjabat Ketua Dewan Pengurus Daerah (DPD) Partai Solidaritas Indonesia (PSI) Kota Batam pada periode 2022–2023.', 'Sony Christanto served as Chair of the Batam City Regional Board (DPD) of the Indonesian Solidarity Party (PSI) for 2022–2023.') },
  { slug: 'dpw-partai-nasdem', name: 'DPW Partai Nasdem', short: 'DPW Partai Nasdem', initials: 'ND', role: r('Wakil Ketua', 'Vice Chair'), start: 2016, end: 2021, kind: 'partai', logo: logo('nasdem'), description: r('Sony Christanto menjabat Wakil Ketua Dewan Pengurus Wilayah (DPW) Partai Nasdem pada periode 2016–2021.', 'Sony Christanto served as Vice Chair of the Regional Board (DPW) of the Nasdem Party for the 2016–2021 term.') },
]

export const CURRENT_YEAR = 2026 // tahun acuan linimasa (garis "tahun ini")

export const isOngoing = (o: Organization, year = new Date().getFullYear()) => o.end === null || o.end >= year

/** 'berjalan' | 'sebelumnya' | 'partai' — dipakai filter & warna linimasa. */
export const orgStatus = (o: Organization) => (o.kind === 'partai' ? 'partai' : isOngoing(o) ? 'berjalan' : 'sebelumnya')

export const periodLabel = (o: { start: number; end: number | null }, now = 'sekarang') => `${o.start} – ${o.end ?? now}`

/** Organisasi periode berjalan (non-partai), urut sesuai CV. Dipakai pita merah & beranda. */
export const ongoingOrganizations = () => organizations.filter((o) => o.kind === 'organisasi' && isOngoing(o))
