// Single list of every prerendered (SSG) route. Used by nuxt.config.ts
// (nitro.prerender.routes) and by /sitemap.xml + /llms.txt.
import { awards } from './awards'
import { organizations } from './organizations'
import { publications } from './publications'

export interface StaticRoute {
  path: string
  title: string
  priority: number
}

export function staticRoutes(): StaticRoute[] {
  return [
    { path: '/biografi', title: 'Biografi', priority: 0.9 },
    { path: '/organisasi', title: 'Organisasi', priority: 0.7 },
    ...organizations.map((o) => ({ path: `/organisasi/${o.slug}`, title: o.name, priority: 0.5 })),
    { path: '/penghargaan', title: 'Penghargaan', priority: 0.7 },
    ...awards.map((a) => ({ path: `/penghargaan/${a.slug}`, title: a.title, priority: 0.5 })),
    { path: '/karya-tulis', title: 'Karya Tulis', priority: 0.7 },
    ...publications.map((p) => ({ path: `/karya-tulis/${p.slug}`, title: p.title, priority: 0.6 })),
    { path: '/galeri', title: 'Galeri', priority: 0.5 },
    { path: '/kontak', title: 'Kontak', priority: 0.6 },
  ]
}

export const prerenderRoutes = () => staticRoutes().map((r) => r.path)
