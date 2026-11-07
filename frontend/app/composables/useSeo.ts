// Per-page SEO on top of the Nuxt SEO suite:
//   - @nuxtjs/i18n  -> <html lang>, hreflang alternates, og:locale (useLocaleHead in app.vue)
//   - nuxt-seo-utils -> sensible defaults (og:site_name, twitter card, title template)
//   - nuxt-schema-org -> one JSON-LD graph; WebSite/WebPage/Person(identity) come from config
// This composable adds what is page specific: title, description, canonical,
// Open Graph image and article timestamps.
import { site } from '~/data/site'

interface PageSeo {
  title?: string // omitted on the home page
  description: string
  /** Locale-less path, e.g. '/biografi' or '/blog/slug'. */
  path: string
  image?: string | null
  imageAlt?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
  /** Point canonical to another locale (e.g. Indonesian-only articles). */
  canonicalLocale?: 'id' | 'en'
}

export function absoluteUrl(path: string) {
  const { siteUrl } = useRuntimeConfig().public
  if (/^https?:\/\//.test(path)) return path
  return siteUrl.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`)
}

export function usePageSeo(o: PageSeo) {
  const { locale } = useI18n()
  const localePath = useLocalePath()
  const url = absoluteUrl(localePath(o.path, o.canonicalLocale ?? locale.value))
  const image = absoluteUrl(o.image || site.ogImage)
  const jobTitle = locale.value === 'en' ? site.jobTitle.en : site.jobTitle.id
  useSeoMeta({
    title: o.title,
    description: o.description,
    ogTitle: o.title ?? `${site.name} — ${jobTitle}`,
    ogDescription: o.description,
    ogUrl: url,
    ogType: o.type ?? 'website',
    ogSiteName: site.name,
    ogImage: image,
    ogImageAlt: o.imageAlt ?? site.name,
    twitterCard: 'summary_large_image',
    articlePublishedTime: o.publishedTime,
    articleModifiedTime: o.modifiedTime,
    robots: o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
  })
  useHead({ link: [{ rel: 'canonical', href: url, key: 'canonical' }] })
}

/** Add schema.org nodes to the page graph (merged by nuxt-schema-org). */
export function useJsonLd(data: object | object[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSchemaOrg((Array.isArray(data) ? data : [data]) as any[])
}
