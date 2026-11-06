// Identity & contact. Source: CV Sony Christanto (dikirim ke tim, Nov 2026).
// Facts here feed the UI, JSON-LD, llms.txt — change them in ONE place.

export const site = {
  name: 'Sony Christanto',
  fullName: 'Sony Christanto, SE., M.Si',
  honorificSuffix: 'SE., M.Si',
  jobTitle: 'Anggota DPRD Kota Batam',
  jobSince: 2024,
  locale: 'id_ID',
  // TODO(klien): tagline/visi resmi belum ada. Ini rangkuman draf dari CV.
  tagline: 'Anggota DPRD Kota Batam',
  description:
    'Situs resmi Sony Christanto, SE., M.Si — Anggota DPRD Kota Batam. Biografi, pandangan, agenda kegiatan, organisasi, dan karya tulis.',
  photo: {
    src: '/images/profil/sony-christanto.webp',
    alt: 'Foto Sony Christanto mengenakan jas dan peci',
    // TODO(klien): ganti dengan foto resolusi tinggi (min. 1200 px).
    width: 251,
    height: 355,
  },
  ogImage: '/images/og-default.jpg',
  contact: {
    email: 'sony.c.batam@gmail.com',
    phoneDisplay: '+62 821 7400 7776',
    whatsapp: '6282174007776',
    office: {
      street: 'Diamond Palace Blok C2',
      locality: 'Batam Center',
      city: 'Batam',
      region: 'Kepulauan Riau',
      country: 'ID',
    },
  },
  social: [
    { key: 'instagram', label: 'Instagram', handle: '@christantosony', url: 'https://www.instagram.com/christantosony/' },
    // TODO(klien): CV hanya menulis "sony christanto" — minta URL profil Facebook yang pasti.
    { key: 'facebook', label: 'Facebook', handle: 'sony christanto', url: '' },
  ],
} as const

export const navigation = [
  { label: 'Beranda', to: '/' },
  { label: 'Biografi', to: '/biografi' },
  { label: 'Blog', to: '/blog' },
  { label: 'Organisasi', to: '/organisasi' },
  { label: 'Penghargaan', to: '/penghargaan' },
  { label: 'Karya Tulis', to: '/karya-tulis' },
  { label: 'Galeri', to: '/galeri' },
  { label: 'Kontak', to: '/kontak' },
] as const

export const categories = [
  {
    key: 'perspektif-sony',
    label: 'Perspektif Sony',
    description: 'Pandangan dan pendapat Sony Christanto atas isu, masalah, dan gagasan yang sedang dibahas.',
  },
  {
    key: 'agenda-sony',
    label: 'Agenda Sony',
    description: 'Catatan kegiatan Sony Christanto: pertemuan, kunjungan, kegiatan sosial, dan aktivitas lainnya.',
  },
] as const

export type CategoryKey = (typeof categories)[number]['key']
