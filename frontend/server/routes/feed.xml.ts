// RSS 2.0 — readers, aggregators and answer engines pick up new posts from here.
import { pick } from '~/data/i18n'
import { site } from '~/data/site'

export default defineEventHandler(async (event) => {
  const siteUrl = siteUrlOf(event)
  const articles = (await fetchArticleFeed(event)).slice(0, 30)
  const items = articles
    .map(
      (a) => `    <item>
      <title>${xmlEscape(a.title)}</title>
      <link>${siteUrl}/id/blog/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/id/blog/${a.slug}</guid>
      <category>${xmlEscape(a.category.label)}</category>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
      <description>${xmlEscape(a.excerpt)}</description>
    </item>`,
    )
    .join('\n')
  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(site.name)} — Blog</title>
    <link>${siteUrl}/id/blog</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(pick(site.description, 'id'))}</description>
    <language>id-ID</language>
${items}
  </channel>
</rss>
`
})
