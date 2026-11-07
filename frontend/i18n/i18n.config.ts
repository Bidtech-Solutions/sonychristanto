// vue-i18n options. Messages live in i18n/locales/*.json (lazy per locale).
export default defineI18nConfig(() => ({
  fallbackLocale: 'id',
  warnHtmlMessage: false, // a few headings carry <br> line breaks (rendered with v-html, trusted copy)
  datetimeFormats: {
    id: { long: { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }, short: { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' } },
    en: { long: { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }, short: { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' } },
  },
}))
