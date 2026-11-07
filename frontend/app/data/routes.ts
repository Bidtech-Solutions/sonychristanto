// Single list of every prerendered (SSG) route, WITHOUT locale prefix.
// nuxt.config.ts prefixes each with /id and /en (nitro.prerender.routes);
// the sitemap module and /llms.txt read the same list.
import { awards } from './awards'
import type { L } from './i18n'
import { organizations } from './organizations'
import { publications } from './publications'

export interface StaticRoute {
  path: string
  title: L | string
  priority: number
}

export function staticRoutes(): StaticRoute[] {
  return [
    { path: '/biografi', title: { id: 'Biografi', en: 'Biography' }, priority: 0.9 },
    { path: '/organisasi', title: { id: 'Organisasi', en: 'Organisations' }, priority: 0.7 },
    ...organizations.map((o) => ({ path: `/organisasi/${o.slug}`, title: o.name, priority: 0.5 })),
    { path: '/penghargaan', title: { id: 'Penghargaan', en: 'Awards' }, priority: 0.7 },
    ...awards.map((a) => ({ path: `/penghargaan/${a.slug}`, title: a.title, priority: 0.5 })),
    { path: '/karya-tulis', title: { id: 'Karya Tulis', en: 'Writings' }, priority: 0.7 },
    ...publications.map((p) => ({ path: `/karya-tulis/${p.slug}`, title: p.title, priority: 0.6 })),
    { path: '/galeri', title: { id: 'Galeri', en: 'Gallery' }, priority: 0.5 },
    { path: '/kontak', title: { id: 'Kontak', en: 'Contact' }, priority: 0.6 },
  ]
}

export const prerenderRoutes = (locales: readonly string[]) => locales.flatMap((l) => staticRoutes().map((r) => `/${l}${r.path}`))
