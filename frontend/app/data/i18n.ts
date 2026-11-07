// Konten statis dwibahasa. UI string (tombol, label) ada di i18n/locales/*.json;
// konten (bio, organisasi, dsb.) ditulis di file data sebagai { id, en } supaya
// fakta dan terjemahannya berdampingan dan tidak mudah tertinggal.

export const LOCALES = ['id', 'en'] as const
export type LocaleCode = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: LocaleCode = 'id'

/** Teks lokal. */
export interface L {
  id: string
  en: string
}

/** Ambil teks sesuai locale; string biasa dikembalikan apa adanya. */
export const pick = (v: L | string | undefined | null, locale: string): string =>
  v == null ? '' : typeof v === 'string' ? v : (v[locale as LocaleCode] ?? v.id)

/** /biografi → /id/biografi ; / → /id */
export const localized = (path: string, locale: string) => `/${locale}${path === '/' ? '' : path}`
