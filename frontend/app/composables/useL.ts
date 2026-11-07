// Locale helpers for bilingual content in app/data (see data/i18n.ts).
import { type L, pick } from '~/data/i18n'

export function useL() {
  const { locale, t, d } = useI18n()
  const localePath = useLocalePath()
  /** Pick the current-locale text from a { id, en } value. */
  const tx = (v: L | string | null | undefined) => pick(v, locale.value)
  /** "2024 – sekarang" / "2024 – present" */
  const period = (o: { start: number; end: number | null }) => `${o.start} – ${o.end ?? t('common.now')}`
  const date = (iso?: string | null, style: 'long' | 'short' = 'long') => (iso ? d(new Date(iso), style) : '')
  return { locale, t, tx, period, date, lp: localePath }
}
