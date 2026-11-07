// llms-full.txt: the full public text of the site in one Markdown file (Indonesian).
import { awards } from '~/data/awards'
import { biography, biographyFaq } from '~/data/biography'
import { pick } from '~/data/i18n'
import { organizations, periodLabel } from '~/data/organizations'
import { publications } from '~/data/publications'
import { site } from '~/data/site'

export default defineEventHandler(async (event) => {
  const siteUrl = siteUrlOf(event)
  const articles = await fetchArticleFeed(event, true)
  const id = (v: Parameters<typeof pick>[0]) => pick(v, 'id')
  const out: string[] = []
  const h = (s: string) => out.push('', s, '')

  out.push(`# ${site.fullName}`, '', `> ${id(site.jobTitle)} (${site.jobSince}–sekarang).`, '', `Sumber: ${siteUrl}/id (English: ${siteUrl}/en)`)

  h('## Biografi')
  out.push(id(biography.lead), '', ...biography.summary.map(id))
  if (site.showBirthDate) out.push('', `Lahir: 16 Desember 1974 (${site.birthDate}). Kewarganegaraan: Indonesia.`)
  h('### Karier')
  out.push(...biography.career.map((c) => `- ${periodLabel(c)}: ${id(c.role)}, ${c.org}`))
  h('### Pendidikan')
  out.push(...biography.education.map((e) => `- ${e.period}: ${id(e.level)}, ${e.institution} (${id(e.place)})`))
  h('### Tanya jawab')
  biographyFaq.forEach((f) => out.push(`**${id(f.q)}**`, id(f.a), ''))

  h('## Organisasi')
  out.push(...organizations.map((o) => `- ${periodLabel(o)}: ${o.name}${o.role ? ` — ${id(o.role)}` : ''}${o.kind === 'partai' ? ' (kepartaian)' : ''}`))

  if (awards.length) {
    h('## Penghargaan')
    out.push(...awards.map((a) => `- ${a.year}: ${id(a.title)} — ${a.issuer}. ${id(a.summary)}`))
  }
  if (publications.length) {
    h('## Karya tulis')
    out.push(...publications.map((p) => `- ${p.year}: ${p.title}. ${p.authors.join(', ')}${p.venue ? `. ${p.venue}` : ''}. ${id(p.abstract)}`))
  }

  h('## Kontak')
  out.push(`- Email: ${site.contact.email}`, `- WhatsApp: ${site.contact.phoneDisplay}`)
  if (site.contact.showOffice) out.push(`- Kantor: ${site.contact.office.street}, ${site.contact.office.locality}, ${site.contact.office.city}`)

  if (articles.length) {
    h('## Artikel')
    for (const a of articles) {
      out.push(`### ${a.title}`, '', `${a.category.label} · ${a.published_at.slice(0, 10)} · ${siteUrl}/id/blog/${a.slug}`, '', a.content_text ?? a.excerpt, '')
    }
  }

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return out.join('\n') + '\n'
})
