import { staticRoutes } from '~/data/routes'

export default defineEventHandler(async (event) => {
  const siteUrl = siteUrlOf(event)
  const articles = await fetchArticleFeed(event)
  const today = new Date().toISOString().slice(0, 10)
  const latest = articles[0]?.updated_at?.slice(0, 10) ?? today

  const urls: { loc: string; lastmod: string; priority: number }[] = [
    { loc: '/', lastmod: latest, priority: 1.0 },
    { loc: '/blog', lastmod: latest, priority: 0.8 },
    { loc: '/blog/kategori/perspektif-sony', lastmod: latest, priority: 0.7 },
    { loc: '/blog/kategori/agenda-sony', lastmod: latest, priority: 0.7 },
    ...staticRoutes().map((r) => ({ loc: r.path, lastmod: today, priority: r.priority })),
    ...articles.map((a) => ({ loc: `/blog/${a.slug}`, lastmod: (a.updated_at || a.published_at).slice(0, 10), priority: 0.8 })),
  ]

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${xmlEscape(siteUrl + u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority.toFixed(1)}</priority></url>`)
  .join('\n')}
</urlset>
`
})
