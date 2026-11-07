// schema.org helpers. The Person entity is the site "identity" configured in
// nuxt.config.ts (schemaOrg.identity, built by personIdentity() below) and
// rendered by nuxt-schema-org with @id = <site>/#identity. Every other node
// points to it — consistent entity data is what search and answer engines
// (AEO/GEO) rely on.
import { biography } from '../data/biography'
import { pick } from '../data/i18n'
import { isOngoing, organizations } from '../data/organizations'
import { site } from '../data/site'

export const personId = (siteUrl: string) => `${siteUrl.replace(/\/$/, '')}/#identity`
export const websiteId = (siteUrl: string, locale: string) => `${siteUrl.replace(/\/$/, '')}/${locale}#website`

/** Identity object for nuxt-schema-org (Indonesian facts; names are proper nouns). */
export function personIdentity(siteUrl: string) {
  const base = siteUrl.replace(/\/$/, '')
  return {
    type: 'Person',
    name: site.name,
    honorificSuffix: site.honorificSuffix,
    jobTitle: pick(site.jobTitle, 'id'),
    birthDate: site.showBirthDate ? site.birthDate : undefined,
    gender: 'Male',
    nationality: { '@type': 'Country', name: 'Indonesia' },
    description: pick(biography.lead, 'id'),
    url: `${base}/id`,
    image: base + site.cutouts.standing.src,
    email: `mailto:${site.contact.email}`,
    telephone: `+${site.contact.whatsapp}`,
    worksFor: { '@type': 'GovernmentOrganization', name: 'DPRD Kota Batam' },
    address: site.contact.showOffice
      ? {
          '@type': 'PostalAddress',
          streetAddress: site.contact.office.street,
          addressLocality: site.contact.office.city,
          addressRegion: site.contact.office.region,
          addressCountry: site.contact.office.country,
        }
      : undefined,
    alumniOf: biography.education.filter((e) => e.degree).map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    memberOf: organizations
      .filter((o) => isOngoing(o, 2026) && o.kind === 'organisasi')
      .map((o) => ({ '@type': 'OrganizationRole', roleName: o.role ? pick(o.role, 'id') : undefined, startDate: String(o.start), memberOf: { '@type': 'Organization', name: o.name } })),
    knowsAbout: ['Pendidikan', 'Olahraga', 'Kebijakan publik Kota Batam'],
    sameAs: site.social.map((s) => s.url).filter(Boolean),
  }
}

/** `items` include the (localized) home entry first; paths are absolute-path URLs. */
export function breadcrumbSchema(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: siteUrl.replace(/\/$/, '') + it.path,
    })),
  }
}
