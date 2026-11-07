// Source: CV Sony Christanto (validated against the CV again on 7 Nov 2026).
// Fields marked TODO(klien) need client input. Date of birth is published
// (site.birthDate); religion is deliberately NOT published (PRD K-2).
import type { L } from './i18n'
import { site } from './site'

export interface CareerItem {
  start: number
  end: number | null
  role: L
  org: string
  orgNote?: L
}

export interface EducationItem {
  code: 'SD' | 'SMA' | 'S1' | 'S2' | 'PPNK'
  level: L
  institution: string
  place: L
  city: string // label peta (huruf besar)
  start: number
  period: string
  desc: L
  lon: number
  lat: number
  /** Foto gedung/kampus. Placeholder sampai foto asli (dari desain) diunggah. */
  image: string
  imageAlt: L
  credit: L
  degree?: boolean // dipakai alumniOf (JSON-LD)
}

export const biography = {
  // TODO(klien): bio naratif resmi. Paragraf di bawah adalah draf rangkuman CV.
  lead: {
    id: 'Sony Christanto, SE., M.Si adalah Anggota DPRD Kota Batam (Komisi IV) sejak 2024, dengan latar belakang lebih dari dua dekade di dunia usaha dan kepemimpinan yayasan.',
    en: 'Sony Christanto, SE., M.Si has been a member of the Batam City Council (Commission IV) since 2024, bringing more than two decades of experience in business and foundation leadership.',
  } as L,
  summary: [
    {
      id: 'Ia memulai karier sebagai Branch Manager PT. Indolok Bakti Utama (2000–2008), lalu memimpin Yayasan Komunitas Kasih Indonesia sebagai Chairman (2008–2023) dan menjabat Direktur PT. Kreatif Cerdas Mandiri (2015–2021). Pendidikannya ditempuh dari Nabire, Madiun, dan Malang hingga meraih Magister Sains di Universitas Batam, dan pada 2026 ia mengikuti PPNK Angkatan 73 Lemhannas RI.',
      en: 'He began his career as Branch Manager of PT. Indolok Bakti Utama (2000–2008), then led Yayasan Komunitas Kasih Indonesia as Chairman (2008–2023) and served as Director of PT. Kreatif Cerdas Mandiri (2015–2021). His education took him from Nabire, Madiun and Malang to a Master of Science at Universitas Batam, and in 2026 he joined PPNK Class 73 at Lemhannas RI (National Resilience Institute).',
    },
    {
      id: 'Saat ini ia aktif di enam organisasi, antara lain di bidang pendidikan, olahraga, dan keagamaan di Batam dan Kepulauan Riau.',
      en: 'He is currently active in six organisations, spanning education, sport and faith communities in Batam and the Riau Islands.',
    },
  ] as L[],
  // Ringkasan pendek untuk beranda (draf dari CV, menunggu persetujuan).
  short: [
    {
      id: 'Sony Christanto, SE., M.Si adalah Anggota DPRD Kota Batam (Komisi IV) sejak 2024. Sebelum terjun ke legislatif, ia meniti karier di dunia usaha sebagai Branch Manager PT. Indolok Bakti Utama dan Direktur PT. Kreatif Cerdas Mandiri, serta 15 tahun memimpin Yayasan Komunitas Kasih Indonesia.',
      en: 'Sony Christanto, SE., M.Si has served on the Batam City Council (Commission IV) since 2024. Before entering the legislature he built a career in business as Branch Manager of PT. Indolok Bakti Utama and Director of PT. Kreatif Cerdas Mandiri, and spent 15 years leading Yayasan Komunitas Kasih Indonesia.',
    },
    {
      id: 'Kini ia aktif di enam organisasi, antara lain di bidang pendidikan, olahraga, dan keagamaan, dan pada 2026 mengikuti PPNK Angkatan 73 Lemhannas RI.',
      en: 'Today he is active in six organisations in education, sport and faith, and in 2026 joined PPNK Class 73 at Lemhannas RI.',
    },
  ] as L[],
  career: [
    { start: 2024, end: null, role: { id: 'Anggota DPRD Kota Batam', en: 'Member, Batam City Council' }, org: 'DPRD Kota Batam', orgNote: { id: 'Komisi IV', en: 'Commission IV' } },
    { start: 2015, end: 2021, role: { id: 'Direktur', en: 'Director' }, org: 'PT. Kreatif Cerdas Mandiri' },
    { start: 2008, end: 2023, role: { id: 'Chairman', en: 'Chairman' }, org: 'Yayasan Komunitas Kasih Indonesia' },
    { start: 2000, end: 2008, role: { id: 'Branch Manager', en: 'Branch Manager' }, org: 'PT. Indolok Bakti Utama' },
  ] as CareerItem[],
  education: [
    {
      code: 'SD', level: { id: 'Sekolah Dasar', en: 'Primary school' }, institution: 'SD Inpres Nabarua', place: { id: 'Nabire, Papua Tengah', en: 'Nabire, Central Papua' }, city: 'NABIRE',
      start: 1980, period: '1980 – 1990', desc: { id: 'Pendidikan dasar di Nabire, Papua Tengah.', en: 'Primary education in Nabire, Central Papua.' }, lon: 135.5, lat: -3.37,
      image: '/images/pendidikan/sd.webp', imageAlt: { id: 'Papan nama dan halaman SD Negeri Inpres Nabarua, Nabire', en: 'Sign and schoolyard of SD Negeri Inpres Nabarua, Nabire' },
      credit: { id: 'Foto: SD Negeri Inpres Nabarua, Nabire [sumber foto perlu dicantumkan]', en: 'Photo: SD Negeri Inpres Nabarua, Nabire [photo source required]' },
    },
    {
      code: 'SMA', level: { id: 'Sekolah Menengah Atas', en: 'Senior high school' }, institution: 'SMA St. Bonaventura', place: { id: 'Madiun, Jawa Timur', en: 'Madiun, East Java' }, city: 'MADIUN',
      start: 1990, period: '1990 – 1993', desc: { id: 'Pendidikan menengah atas di Madiun, Jawa Timur.', en: 'Senior high school in Madiun, East Java.' }, lon: 111.5, lat: -7.63,
      image: '/images/pendidikan/sma.webp', imageAlt: { id: 'Gedung SMA St. Bonaventura Madiun dengan lapangan basket', en: 'SMA St. Bonaventura building in Madiun with its basketball court' },
      credit: { id: 'Foto: SMA St. Bonaventura, Madiun [sumber foto perlu dicantumkan]', en: 'Photo: SMA St. Bonaventura, Madiun [photo source required]' },
    },
    {
      code: 'S1', level: { id: 'Sarjana Ekonomi (SE)', en: 'Bachelor of Economics (SE)' }, institution: 'STIE Malangkucecwara', place: { id: 'Malang, Jawa Timur', en: 'Malang, East Java' }, city: 'MALANG',
      start: 1993, period: '1993 – 1997', desc: { id: 'Meraih gelar Sarjana Ekonomi di Malang, Jawa Timur.', en: 'Earned a Bachelor of Economics in Malang, East Java.' }, lon: 112.6, lat: -7.98,
      image: '/images/pendidikan/s1.webp', imageAlt: { id: 'Gedung kampus STIE Malangkucecwara, Malang', en: 'STIE Malangkucecwara campus building, Malang' },
      credit: { id: 'Foto: STIE Malangkucecwara, Malang [sumber foto perlu dicantumkan]', en: 'Photo: STIE Malangkucecwara, Malang [photo source required]' }, degree: true,
    },
    {
      code: 'S2', level: { id: 'Magister Sains (M.Si)', en: 'Master of Science (M.Si)' }, institution: 'Universitas Batam', place: { id: 'Batam, Kepulauan Riau', en: 'Batam, Riau Islands' }, city: 'BATAM',
      start: 2012, period: '2012 – 2014', desc: { id: 'Meraih gelar Magister Sains di Batam, Kepulauan Riau, kota tempat ia berkarya hingga kini.', en: 'Earned a Master of Science in Batam, Riau Islands — the city where he still works today.' }, lon: 104.0, lat: 1.13,
      image: '/images/pendidikan/s2.webp', imageAlt: { id: 'Gedung Universitas Batam (UNIBA)', en: 'Universitas Batam (UNIBA) building' },
      credit: { id: 'Foto: Universitas Batam [sumber foto perlu dicantumkan]', en: 'Photo: Universitas Batam [photo source required]' }, degree: true,
    },
    {
      code: 'PPNK', level: { id: 'PPNK Angkatan 73', en: 'PPNK Class 73' }, institution: 'Lemhannas RI', place: { id: 'Jakarta', en: 'Jakarta' }, city: 'JAKARTA',
      start: 2026, period: '2026', desc: { id: 'Peserta PPNK Angkatan 73 Lembaga Ketahanan Nasional Republik Indonesia.', en: 'Participant in PPNK Class 73 at the National Resilience Institute of the Republic of Indonesia (Lemhannas RI).' }, lon: 106.8, lat: -6.2,
      image: '/images/pendidikan/ppnk.webp', imageAlt: { id: 'Gedung Lemhannas RI, Jakarta', en: 'Lemhannas RI building, Jakarta' },
      credit: { id: 'Foto: Lemhannas RI, Jakarta [sumber foto perlu dicantumkan]', en: 'Photo: Lemhannas RI, Jakarta [photo source required]' },
    },
  ] as EducationItem[],
  skills: [
    { id: 'Windows & MS Office', en: 'Windows & MS Office' },
    { id: 'Fotografi', en: 'Photography' },
    { id: 'Piano', en: 'Piano' },
    { id: 'Gitar', en: 'Guitar' },
    { id: 'Ukulele', en: 'Ukulele' },
    { id: 'Desain grafis (Adobe Photoshop, Adobe Illustrator)', en: 'Graphic design (Adobe Photoshop, Adobe Illustrator)' },
  ] as L[],
  hobbies: [
    { id: 'Golf', en: 'Golf' },
    { id: 'Badminton', en: 'Badminton' },
    { id: 'Fitness', en: 'Fitness' },
  ] as L[],
}

/** Kartu "Mengenal Sony Christanto" di beranda (DESIGN.md §7 butir 4). */
export const profileCards = [
  {
    no: '01', anchor: 'profil', title: { id: 'Profil', en: 'Profile' },
    text: site.showBirthDate
      ? { id: 'Lahir 16 Desember 1974. Anggota DPRD Kota Batam sejak 2024; gemar golf, badminton, dan fitness, serta menekuni fotografi dan musik.', en: 'Born 16 December 1974. Batam City Council member since 2024; enjoys golf, badminton and fitness, and is keen on photography and music.' }
      : { id: 'Anggota DPRD Kota Batam sejak 2024. Gemar golf, badminton, dan fitness; menekuni fotografi dan musik.', en: 'Batam City Council member since 2024. Enjoys golf, badminton and fitness; keen on photography and music.' },
  },
  {
    no: '02', anchor: 'pendidikan', title: { id: 'Pendidikan', en: 'Education' }, featured: true,
    text: { id: 'SE dari STIE Malangkucecwara, M.Si dari Universitas Batam, dan peserta PPNK Angkatan 73 Lemhannas RI (2026).', en: 'SE from STIE Malangkucecwara, M.Si from Universitas Batam, and a PPNK Class 73 participant at Lemhannas RI (2026).' },
  },
  {
    no: '03', anchor: 'pengalaman', title: { id: 'Pengalaman Kerja', en: 'Career' },
    text: { id: 'Branch Manager PT. Indolok Bakti Utama, Chairman Yayasan Komunitas Kasih Indonesia, Direktur PT. Kreatif Cerdas Mandiri.', en: 'Branch Manager at PT. Indolok Bakti Utama, Chairman of Yayasan Komunitas Kasih Indonesia, Director of PT. Kreatif Cerdas Mandiri.' },
  },
  {
    no: '04', anchor: 'organisasi', title: { id: 'Organisasi', en: 'Organisations' },
    text: { id: 'Aktif di bidang pendidikan, olahraga, dunia usaha, dan keagamaan, dengan 6 organisasi pada periode berjalan.', en: 'Active in education, sport, business and faith communities, with 6 organisations in the current term.' },
  },
  // TODO(klien): K-4 — kartu 05 "Kiprah Kepartaian" disembunyikan sampai riwayat kepartaian dikonfirmasi.
] as { no: string; anchor: string; title: L; text: L; featured?: boolean }[]

// Answer-engine friendly Q&A (rendered on /biografi + FAQPage JSON-LD).
// Every answer must be a fact from the data above — no claims without a source.
export const biographyFaq: { q: L; a: L }[] = [
  {
    q: { id: 'Siapa Sony Christanto?', en: 'Who is Sony Christanto?' },
    a: {
      id: 'Sony Christanto, SE., M.Si adalah Anggota DPRD Kota Batam (Komisi IV) sejak 2024, berlatar belakang profesional swasta dan pimpinan yayasan.',
      en: 'Sony Christanto, SE., M.Si has been a member of the Batam City Council (Commission IV) since 2024, with a background as a private-sector professional and foundation leader.',
    },
  },
  ...(site.showBirthDate
    ? [{ q: { id: 'Kapan Sony Christanto lahir?', en: 'When was Sony Christanto born?' }, a: { id: 'Sony Christanto lahir pada 16 Desember 1974.', en: 'Sony Christanto was born on 16 December 1974.' } }]
    : []),
  {
    q: { id: 'Apa latar belakang pendidikannya?', en: 'What is his educational background?' },
    a: {
      id: 'Sarjana Ekonomi dari STIE Malangkucecwara, Malang (1997), Magister Sains dari Universitas Batam (2014), dan peserta PPNK Angkatan 73 Lemhannas RI (2026).',
      en: 'A Bachelor of Economics from STIE Malangkucecwara, Malang (1997), a Master of Science from Universitas Batam (2014), and participation in PPNK Class 73 at Lemhannas RI (2026).',
    },
  },
  {
    q: { id: 'Di organisasi apa saja ia aktif saat ini?', en: 'Which organisations is he active in today?' },
    a: {
      id: 'Antara lain sebagai Ketua Badan Musyawarah Perguruan Swasta Kepri, Ketua Komisi Pendidikan PGIW Kepri, Ketua DPD Gempar Indonesia Kepri, Wakil Ketua KONI Kota Batam, dan Wakil Ketua Pengkot Perbakin Kota Batam.',
      en: 'Among others, he chairs the Riau Islands Private School Council (BMPS Kepri), chairs the Education Commission of PGIW Kepri, chairs DPD Gempar Indonesia Kepri, and is Vice Chair of KONI Batam and of Perbakin Batam.',
    },
  },
  {
    q: { id: 'Bagaimana cara menghubunginya?', en: 'How can I contact him?' },
    a: site.contact.showOffice
      ? {
          id: 'Melalui WhatsApp +62 821 7400 7776, email sony.c.batam@gmail.com, atau kantor di Diamond Palace Blok C2, Batam Center, Batam.',
          en: 'Via WhatsApp +62 821 7400 7776, email sony.c.batam@gmail.com, or at the office in Diamond Palace Block C2, Batam Center, Batam.',
        }
      : {
          id: 'Melalui WhatsApp +62 821 7400 7776 atau email sony.c.batam@gmail.com.',
          en: 'Via WhatsApp +62 821 7400 7776 or email sony.c.batam@gmail.com.',
        },
  },
]
