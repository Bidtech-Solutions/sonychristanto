// Path is outside /api/ on purpose: in production nginx sends /api/* straight to the Go backend.
// Sitemap source (@nuxtjs/sitemap `sources`). Articles are written in
// Indonesian only, so only the /id URL is listed; /en/blog/** is noindex
// with a canonical pointing here (see app/pages/blog/[slug].vue).

export default defineSitemapEventHandler(async (event) => {
  const articles = await fetchArticleFeed(event)
  const latest = articles[0]?.updated_at ?? new Date().toISOString()
  return [
    ...['/id/blog', '/id/blog/kategori/perspektif-sony', '/id/blog/kategori/agenda-sony'].map((loc) => ({ loc, lastmod: latest, _i18nTransform: false })),
    ...articles.map((a) => ({
      loc: `/id/blog/${a.slug}`,
      lastmod: a.updated_at || a.published_at,
      priority: 0.8 as const,
      _i18nTransform: false,
      ...(a.banner_url ? { images: [{ loc: a.banner_url }] } : {}),
    })),
  ]
})
