import tailwindcss from '@tailwindcss/vite'
import { prerenderRoutes } from './app/data/routes'

// Rendering strategy (docs/architecture.md §Rendering):
//   - static modules  -> prerendered at build time (SSG)
//   - blog + landing  -> SSR with stale-while-revalidate cache (ISR),
//                        purged on publish via POST /_internal/revalidate
//   - dashboard       -> client-only SPA, never indexed, never cached
const isr = { swr: 600 } // seconds; publish/unpublish purges immediately

const noindex = {
  ssr: false,
  headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
}

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },

  modules: ['@nuxt/fonts'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1600, // the BlockNote editor chunk (dashboard only) is ~1.2 MB
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return // "use client" in Mantine, harmless
          warn(warning)
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom/client', '@blocknote/core', '@blocknote/core/locales', '@blocknote/react', '@blocknote/mantine', '@blocknote/xl-multi-column'],
    },
  },

  fonts: {
    families: [
      { name: 'Playfair Display', provider: 'google', weights: [500, 600, 700], styles: ['normal', 'italic'], subsets: ['latin', 'latin-ext'], global: true },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal'], subsets: ['latin', 'latin-ext'], global: true },
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Blog Sony Christanto', href: '/feed.xml' },
      ],
      meta: [{ name: 'theme-color', content: '#0A1A44' }],
    },
  },

  // Every key can be overridden with NUXT_* env vars (see .env.example).
  // NUXT_PUBLIC_* values used by PRERENDERED pages must exist at BUILD time
  // (Docker build args in CI), not only at runtime.
  runtimeConfig: {
    apiInternalUrl: 'http://backend:8080', // NUXT_API_INTERNAL_URL
    revalidateSecret: '', // NUXT_REVALIDATE_SECRET
    public: {
      siteUrl: 'http://localhost:3000', // NUXT_PUBLIC_SITE_URL
      gtmId: '', // NUXT_PUBLIC_GTM_ID
      securityContact: 'mailto:security@sonychristanto.com', // NUXT_PUBLIC_SECURITY_CONTACT
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    },
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },

    '/': isr,
    '/blog': isr,
    '/blog/**': isr,
    '/sitemap.xml': isr,
    '/feed.xml': isr,
    '/llms.txt': isr,
    '/llms-full.txt': isr,

    '/dashboard': noindex,
    '/dashboard/**': noindex,
    '/_internal/**': { headers: { 'X-Robots-Tag': 'noindex' } },
  },

  nitro: {
    prerender: {
      crawlLinks: false, // blog pages need the API, which does not exist at build time
      routes: [...prerenderRoutes(), '/robots.txt', '/.well-known/security.txt'],
      failOnError: true,
    },
  },

  typescript: { strict: true },
})
