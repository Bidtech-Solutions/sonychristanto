import { site } from '~/data/site'

interface PageSeo {
  title?: string // omitted on the home page
  description: string
  path: string
  image?: string | null
  imageAlt?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
}

export function absoluteUrl(path: string) {
  const { siteUrl } = useRuntimeConfig().public
  if (/^https?:\/\//.test(path)) return path
  return siteUrl.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`)
}

/** Title, description, canonical, Open Graph and Twitter tags for one page. */
export function usePageSeo(o: PageSeo) {
  const url = absoluteUrl(o.path)
  const image = absoluteUrl(o.image || site.ogImage)
  useSeoMeta({
    title: o.title,
    description: o.description,
    ogTitle: o.title ?? `${site.name} — ${site.jobTitle}`,
    ogDescription: o.description,
    ogUrl: url,
    ogType: o.type ?? 'website',
    ogSiteName: site.name,
    ogLocale: site.locale,
    ogImage: image,
    ogImageAlt: o.imageAlt ?? site.name,
    twitterCard: 'summary_large_image',
    articlePublishedTime: o.publishedTime,
    articleModifiedTime: o.modifiedTime,
    robots: o.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  })
  useHead({ link: [{ rel: 'canonical', href: url }] })
}

/** Inject one or more schema.org objects as JSON-LD. */
export function useJsonLd(data: object | object[]) {
  // Escape "<" so content like "</script>" in a title cannot break out of the tag.
  const json = JSON.stringify(Array.isArray(data) ? { '@context': 'https://schema.org', '@graph': data } : { '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c')
  useHead({ script: [{ type: 'application/ld+json', innerHTML: json }] })
}
