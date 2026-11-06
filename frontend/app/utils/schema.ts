// schema.org builders. The Person entity (@id = <site>/#person) is the anchor
// every other node points to — consistent entity data is what search and
// answer engines (AEO/GEO) rely on.
import { biography } from '~/data/biography'
import { isOngoing, organizations } from '~/data/organizations'
import { site } from '~/data/site'

export const personId = (siteUrl: string) => `${siteUrl}/#person`
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`

export function personSchema(siteUrl: string) {
  return {
    '@type': 'Person',
    '@id': personId(siteUrl),
    name: site.name,
    honorificSuffix: site.honorificSuffix,
    jobTitle: site.jobTitle,
    description: biography.summary[0],
    url: siteUrl,
    image: siteUrl + site.photo.src,
    email: `mailto:${site.contact.email}`,
    telephone: `+${site.contact.whatsapp}`,
    worksFor: { '@type': 'GovernmentOrganization', name: 'DPRD Kota Batam' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.contact.office.street,
      addressLocality: site.contact.office.city,
      addressRegion: site.contact.office.region,
      addressCountry: site.contact.office.country,
    },
    alumniOf: biography.education
      .filter((e) => ['S1 (SE)', 'S2 (M.Si)'].includes(e.level))
      .map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    memberOf: organizations
      .filter((o) => isOngoing(o) && o.kind === 'organisasi')
      .map((o) => ({ '@type': 'Organization', name: o.name, ...(o.role ? { roleName: o.role } : {}) })),
    sameAs: site.social.map((s) => s.url).filter(Boolean),
  }
}

export function websiteSchema(siteUrl: string) {
  return {
    '@type': 'WebSite',
    '@id': websiteId(siteUrl),
    url: siteUrl,
    name: site.name,
    inLanguage: 'id-ID',
    publisher: { '@id': personId(siteUrl) },
  }
}

export function breadcrumbSchema(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Beranda', path: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: siteUrl + it.path,
    })),
  }
}
