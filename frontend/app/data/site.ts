// Identity & contact. Source: CV Sony Christanto (dikirim ke tim, Nov 2026).
// Facts here feed the UI, JSON-LD, llms.txt — change them in ONE place.
// Teks yang tampil ke pengunjung ditulis dwibahasa: { id, en } (lihat ./i18n.ts).
import type { L } from './i18n'

export const site = {
  name: 'Sony Christanto',
  fullName: 'Sony Christanto, SE., M.Si',
  honorificSuffix: 'SE., M.Si',
  jobTitle: { id: 'Anggota DPRD Kota Batam', en: 'Member of the Batam City Council (DPRD)' } as L,
  commission: { id: 'Komisi IV', en: 'Commission IV' } as L,
  jobSince: 2024,
  // Data pribadi dari CV (divalidasi 7 Nov 2026). Hanya tanggal lahir yang
  // ditampilkan (K-2); agama sengaja tidak dipublikasikan.
  birthDate: '1974-12-16',
  showBirthDate: true,
  nationality: { id: 'Indonesia', en: 'Indonesian' } as L,
  // Tagline dipakai di logo (DESIGN.md §10a) — slogan, tidak diterjemahkan.
  tagline: 'Yang Muda Berkarya',
  description: {
    id: 'Situs resmi Sony Christanto, SE., M.Si — Anggota DPRD Kota Batam. Biografi, pandangan, agenda kegiatan, organisasi, dan karya tulis.',
    en: 'Official website of Sony Christanto, SE., M.Si — Member of the Batam City Council. Biography, perspectives, activities, organisations and writings.',
  } as L,
  photo: {
    src: '/images/profil/sony-christanto.webp',
    alt: { id: 'Foto Sony Christanto mengenakan jas dan peci', en: 'Photo of Sony Christanto wearing a suit and peci' } as L,
    width: 251,
    height: 355,
  },
  // Cutout studio (latar transparan), dikonversi ke WebP ≤1080px tinggi dari aset desain.
  cutouts: {
    // Pose alternatif (tangan di saku) — belum dipakai di halaman, siap untuk variasi hero.
    standingPocket: { src: '/images/sony/berdiri-saku.webp', width: 391, height: 1080, alt: { id: 'Sony Christanto berdiri dengan tangan di saku', en: 'Sony Christanto standing with hands in pockets' } as L },
    standing: { src: '/images/sony/berdiri.webp', width: 432, height: 1080, alt: { id: 'Sony Christanto berdiri tegak mengenakan kemeja putih', en: 'Sony Christanto standing upright in a white shirt' } as L },
    crossedArms: { src: '/images/sony/bersedekap.webp', width: 539, height: 1080, alt: { id: 'Sony Christanto bersedekap mengenakan kemeja putih', en: 'Sony Christanto with arms crossed, wearing a white shirt' } as L },
    handsClasped: { src: '/images/sony/tangan-bertaut.webp', width: 620, height: 1080, alt: { id: 'Sony Christanto tersenyum dengan tangan bertaut', en: 'Sony Christanto smiling with hands clasped' } as L },
    glance: { src: '/images/sony/melirik.webp', width: 548, height: 1080, alt: { id: 'Sony Christanto bersedekap sambil melirik ke samping', en: 'Sony Christanto with arms crossed, glancing sideways' } as L },
    writing: { src: '/images/sony/blog.webp', width: 650, height: 1080, alt: { id: 'Sony Christanto melihat jam tangannya', en: 'Sony Christanto checking his watch' } as L },
  },
  logo: '/images/logo/logo-sony-christanto.svg',
  ogImage: '/images/og-default.jpg',
  contact: {
    email: 'sony.c.batam@gmail.com',
    phoneDisplay: '+62 821 7400 7776',
    whatsapp: '6282174007776',
    // Alamat kantor disembunyikan sementara (permintaan PM). Ubah ke true untuk
    // menampilkan kembali di footer, beranda, /kontak, JSON-LD, llms-full.txt, dan FAQ.
    showOffice: false,
    office: {
      street: 'Diamond Palace Blok C2',
      locality: 'Batam Center',
      city: 'Batam',
      region: 'Kepulauan Riau',
      country: 'ID',
    },
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Diamond+Palace+Blok+C2+Batam+Center+Batam',
    // Peta interaktif (embed Google Maps tanpa API key, penanda ditentukan dari alamat).
    mapsEmbedUrl: 'https://www.google.com/maps?q=Diamond+Palace+Blok+C2+Batam+Center+Batam&hl=id&z=16&output=embed',
  },
  social: [
    { key: 'instagram', short: 'IG', label: 'Instagram', handle: '@christantosony', url: 'https://www.instagram.com/christantosony/', icon: '/images/sosial/instagram.webp' },
    { key: 'linkedin', short: 'IN', label: 'LinkedIn', handle: 'sony-christanto', url: 'https://www.linkedin.com/in/sony-christanto-0066325b/', icon: '/images/sosial/linkedin.webp' },
    { key: 'facebook', short: 'FB', label: 'Facebook', handle: 'Sony Christanto', url: 'https://www.facebook.com/p/Sony-Christanto-100066718021962/', icon: '/images/sosial/facebook.webp' },
    { key: 'tiktok', short: 'TT', label: 'TikTok', handle: '@sony.christanto', url: 'https://www.tiktok.com/@sony.christanto', icon: '/images/sosial/tiktok.webp' },
  ],
} as const

/** Navigasi utama (header). `key` = kunci teks di i18n/locales/*.json → nav.* */
export const navigation = [
  { key: 'home', to: '/' },
  { key: 'biography', to: '/biografi' },
  { key: 'organisations', to: '/organisasi' },
  { key: 'blog', to: '/blog' },
  { key: 'contact', to: '/kontak' },
] as const

/** Navigasi lengkap (footer & menu ponsel). */
export const navigationFull = [
  ...navigation.slice(0, 4),
  { key: 'awards', to: '/penghargaan' },
  { key: 'writings', to: '/karya-tulis' },
  { key: 'gallery', to: '/galeri' },
  navigation[4],
] as const

// Kategori blog. `key` = nilai di backend (jangan diubah); label dwibahasa.
export const categories = [
  {
    key: 'perspektif-sony',
    label: { id: 'Perspektif Sony', en: 'Sony’s Perspective' } as L,
    description: {
      id: 'Pandangan dan pendapat Sony Christanto atas isu, masalah, dan gagasan yang sedang dibahas.',
      en: 'Sony Christanto’s views and opinions on current issues, problems and ideas.',
    } as L,
  },
  {
    key: 'agenda-sony',
    label: { id: 'Agenda Sony', en: 'Sony’s Agenda' } as L,
    description: {
      id: 'Catatan kegiatan Sony Christanto: pertemuan, kunjungan, kegiatan sosial, dan aktivitas lainnya.',
      en: 'Notes on Sony Christanto’s activities: meetings, visits, social events and more.',
    } as L,
  },
] as const

export type CategoryKey = (typeof categories)[number]['key']
