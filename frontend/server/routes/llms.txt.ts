// llms.txt (https://llmstxt.org): a curated Markdown map of the site for LLMs.
// Indonesian is the primary language; English pages are listed as alternates.
import { biography } from '~/data/biography'
import { pick } from '~/data/i18n'
import { staticRoutes } from '~/data/routes'
import { site } from '~/data/site'

export default defineEventHandler(async (event) => {
  const siteUrl = siteUrlOf(event)
  const articles = await fetchArticleFeed(event)
  const link = (title: string, path: string, note?: string) => `- [${title}](${siteUrl}${path})${note ? `: ${note}` : ''}`
  const profile = staticRoutes().filter((r) => r.priority >= 0.6)

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    `# ${site.fullName}`,
    '',
    `> ${pick(site.jobTitle, 'id')} (${site.jobSince}–sekarang). ${pick(biography.lead, 'id')}`,
    '',
    'Situs resmi dwibahasa: Bahasa Indonesia (/id, utama) dan English (/en). Fakta biografis bersumber dari CV resmi; tulisan blog (berbahasa Indonesia) ditulis oleh atau atas nama Sony Christanto.',
    `Kontak resmi: ${site.contact.email}.`,
    '',
    '## Profil',
    ...profile.map((r) => link(pick(r.title, 'id'), `/id${r.path}`)),
    '',
    '## Blog',
    link('Perspektif Sony', '/id/blog/kategori/perspektif-sony', 'pandangan atas isu, masalah, dan gagasan'),
    link('Agenda Sony', '/id/blog/kategori/agenda-sony', 'catatan kegiatan dan pertemuan'),
    ...articles.slice(0, 50).map((a) => link(a.title, `/id/blog/${a.slug}`, `${a.category.label}, ${a.published_at.slice(0, 10)}. ${a.excerpt}`)),
    '',
    '## English',
    link('Home', '/en'),
    ...profile.map((r) => link(pick(r.title, 'en'), `/en${r.path}`)),
    '',
    '## Optional',
    link('Teks lengkap untuk LLM', '/llms-full.txt'),
    link('RSS', '/feed.xml'),
    link('Sitemap', '/sitemap_index.xml'),
    '',
  ].join('\n')
})
