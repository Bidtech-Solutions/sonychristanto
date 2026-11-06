// llms.txt (https://llmstxt.org): a curated Markdown map of the site for LLMs.
import { biography } from '~/data/biography'
import { staticRoutes } from '~/data/routes'
import { site } from '~/data/site'

export default defineEventHandler(async (event) => {
  const siteUrl = siteUrlOf(event)
  const articles = await fetchArticleFeed(event)
  const link = (title: string, path: string, note?: string) => `- [${title}](${siteUrl}${path})${note ? `: ${note}` : ''}`

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    `# ${site.fullName}`,
    '',
    `> ${site.jobTitle} (${site.jobSince}–sekarang). ${biography.summary[0]}`,
    '',
    'Situs resmi berbahasa Indonesia. Fakta biografis bersumber dari CV resmi; tulisan blog ditulis oleh atau atas nama Sony Christanto.',
    `Kontak resmi: ${site.contact.email}.`,
    '',
    '## Profil',
    ...staticRoutes()
      .filter((r) => r.priority >= 0.6)
      .map((r) => link(r.title, r.path)),
    '',
    '## Blog',
    link('Perspektif Sony', '/blog/kategori/perspektif-sony', 'pandangan atas isu, masalah, dan gagasan'),
    link('Agenda Sony', '/blog/kategori/agenda-sony', 'catatan kegiatan dan pertemuan'),
    ...articles.slice(0, 50).map((a) => link(a.title, `/blog/${a.slug}`, `${a.category.label}, ${a.published_at.slice(0, 10)}. ${a.excerpt}`)),
    '',
    '## Optional',
    link('Teks lengkap untuk LLM', '/llms-full.txt'),
    link('RSS', '/feed.xml'),
    link('Sitemap', '/sitemap.xml'),
    '',
  ].join('\n')
})
