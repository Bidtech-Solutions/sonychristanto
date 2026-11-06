// Source: CV Sony Christanto. Fields marked TODO(klien) need client input.
// Deliberately NOT published until the client confirms: date of birth, religion
// (see docs/PRD.md §Keputusan terbuka).

export const biography = {
  // TODO(klien): bio naratif resmi. Paragraf di bawah adalah draf rangkuman CV.
  summary: [
    'Sony Christanto, SE., M.Si adalah Anggota DPRD Kota Batam sejak 2024. Sebelumnya ia meniti karier sebagai Branch Manager PT. Indolok Bakti Utama (2000–2008), memimpin Yayasan Komunitas Kasih Indonesia sebagai Chairman (2008–2023), dan menjabat Direktur PT. Kreatif Cerdas Mandiri (2015–2021).',
    'Ia aktif di organisasi bidang pendidikan, olahraga, dunia usaha, dan keagamaan di Batam dan Kepulauan Riau, dan pada 2026 mengikuti PPNK Angkatan 73 Lemhannas RI.',
  ],
  career: [
    { period: '2024 – sekarang', start: 2024, end: null, role: 'Anggota DPRD Kota Batam', org: 'DPRD Kota Batam' },
    { period: '2015 – 2021', start: 2015, end: 2021, role: 'Direktur', org: 'PT. Kreatif Cerdas Mandiri' },
    { period: '2008 – 2023', start: 2008, end: 2023, role: 'Chairman', org: 'Yayasan Komunitas Kasih Indonesia' },
    { period: '2000 – 2008', start: 2000, end: 2008, role: 'Branch Manager', org: 'PT. Indolok Bakti Utama' },
  ],
  education: [
    { period: '2026', level: 'PPNK Angkatan 73', institution: 'Lemhannas RI', place: '' },
    { period: '2012 – 2014', level: 'S2 (M.Si)', institution: 'Universitas Batam', place: 'Batam, Kepulauan Riau' },
    { period: '1993 – 1997', level: 'S1 (SE)', institution: 'STIE Malangkucecwara', place: 'Malang, Jawa Timur' },
    { period: '1990 – 1993', level: 'SMA', institution: 'SMA St. Bonaventura', place: 'Madiun, Jawa Timur' },
    { period: '1980 – 1990', level: 'SD', institution: 'SD Inpres Nabarua', place: 'Nabire, Papua Tengah' },
  ],
  skills: ['Fotografi', 'Piano', 'Gitar', 'Ukulele', 'Desain grafis (Adobe Photoshop, Adobe Illustrator)'],
  hobbies: ['Golf', 'Badminton', 'Fitness'],
} as const

// Answer-engine friendly Q&A (rendered on /biografi + FAQPage JSON-LD).
// Every answer must be a fact from the data above — no claims without a source.
export const biographyFaq = [
  {
    q: 'Siapa Sony Christanto?',
    a: 'Sony Christanto, SE., M.Si adalah Anggota DPRD Kota Batam sejak 2024, berlatar belakang profesional swasta dan pimpinan yayasan.',
  },
  {
    q: 'Apa latar belakang pendidikan Sony Christanto?',
    a: 'Sarjana Ekonomi dari STIE Malangkucecwara Malang (1997), Magister Sains dari Universitas Batam (2014), dan peserta PPNK Angkatan 73 Lemhannas RI (2026).',
  },
  {
    q: 'Di organisasi apa saja Sony Christanto aktif saat ini?',
    a: 'Antara lain sebagai Ketua Badan Musyawarah Perguruan Swasta Kepri, Ketua Komisi Pendidikan PGIW Kepri, Ketua DPD Gempar Indonesia Kepri, Wakil Ketua KONI Kota Batam, dan Wakil Ketua Pengkot Perbakin Kota Batam.',
  },
  {
    q: 'Bagaimana cara menghubungi Sony Christanto?',
    a: 'Melalui email sony.c.batam@gmail.com, WhatsApp +62 821 7400 7776, atau kantor di Diamond Palace Blok C2, Batam Center, Batam.',
  },
] as const
