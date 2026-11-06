// llms-full.txt: the full public text of the site in one Markdown file.
import { awards } from '~/data/awards'
import { biography, biographyFaq } from '~/data/biography'
import { organizations, periodLabel } from '~/data/organizations'
import { publications } from '~/data/publications'
import { site } from '~/data/site'

export default defineEventHandler(async (event) => {
  const siteUrl = siteUrlOf(event)
  const articles = await fetchArticleFeed(event, true)
  const out: string[] = []
  const h = (s: string) => out.push('', s, '')

  out.push(`# ${site.fullName}`, '', `> ${site.jobTitle} (${site.jobSince}–sekarang).`, '', `Sumber: ${siteUrl}`)

  h('## Biografi')
  out.push(...biography.summary)
  h('### Karier')
  out.push(...biography.career.map((c) => `- ${c.period}: ${c.role}, ${c.org}`))
  h('### Pendidikan')
  out.push(...biography.education.map((e) => `- ${e.period}: ${e.level}, ${e.institution}${e.place ? ` (${e.place})` : ''}`))
  h('### Tanya jawab')
  biographyFaq.forEach((f) => out.push(`**${f.q}**`, f.a, ''))

  h('## Organisasi')
  out.push(...organizations.map((o) => `- ${periodLabel(o)}: ${o.name}${o.role ? ` — ${o.role}` : ''}${o.kind === 'partai' ? ' (kepartaian)' : ''}`))

  if (awards.length) {
    h('## Penghargaan')
    out.push(...awards.map((a) => `- ${a.year}: ${a.title} — ${a.issuer}. ${a.summary}`))
  }
  if (publications.length) {
    h('## Karya tulis')
    out.push(...publications.map((p) => `- ${p.year}: ${p.title}. ${p.authors.join(', ')}${p.venue ? `. ${p.venue}` : ''}. ${p.abstract}`))
  }

  h('## Kontak')
  out.push(`- Email: ${site.contact.email}`, `- WhatsApp: ${site.contact.phoneDisplay}`, `- Kantor: ${site.contact.office.street}, ${site.contact.office.locality}, ${site.contact.office.city}`)

  if (articles.length) {
    h('## Artikel')
    for (const a of articles) {
      out.push(`### ${a.title}`, '', `${a.category.label} · ${a.published_at.slice(0, 10)} · ${siteUrl}/blog/${a.slug}`, '', a.content_text ?? a.excerpt, '')
    }
  }

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return out.join('\n') + '\n'
})
