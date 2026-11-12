import tailwindcss from '@tailwindcss/vite'
import { prerenderRoutes } from './app/data/routes'
import { personIdentity } from './app/utils/schema'

// Rendering strategy (docs/architecture.md §Rendering):
//   - static modules  -> prerendered at build time (SSG), for /id AND /en
//   - blog + landing  -> SSR with stale-while-revalidate cache (ISR),
//                        purged on publish via POST /_internal/revalidate
//   - dashboard       -> client-only SPA, never indexed, never cached, not localized
//
// Locales (i18n/locales/*.json + bilingual app/data/*):
//   /id/...  Bahasa Indonesia (default, x-default)
//   /en/...  English
//   /        301 -> /id
const LOCALES = ['id', 'en'] as const
// seconds; publish/unpublish purges immediately. Off in `nuxt dev`: the dev cache
// lives in the persistent .nuxt volume, so cached HTML from an older template
// would be hydrated by newer client code (hydration mismatch, garbled layout).
const isr = process.env.NODE_ENV === 'production' ? { swr: 600 } : {}

const noindex = {
  ssr: false,
  headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' },
}

// Favicon cache-buster (see app.head.link). 2 = "Sahabat Sony" logo, 12 Nov 2026.
const BRAND_ICON_VERSION = 2

const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

// Dev in Docker on a Windows/macOS bind mount gets no file-change events, so
// HMR silently keeps serving old code. docker-compose.yml sets this to poll.
const devPolling = process.env.NUXT_DEV_POLLING === '1'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/i18n', '@nuxtjs/seo', '@nuxtjs/sitemap', 'motion-v/nuxt'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  watchers: devPolling ? { chokidar: { usePolling: true, interval: 300 } } : {},
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Dev only: the backend container purges ISR at http://frontend:3000/_internal/revalidate;
      // Vite's host check would answer 403 to that Host header (production runs Nitro, no Vite).
      allowedHosts: ['frontend'],
      ...(devPolling ? { watch: { usePolling: true, interval: 300 } } : {}),
    },
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
      include: [
        'react', 'react-dom/client', '@blocknote/core', '@blocknote/core/locales', '@blocknote/react', '@blocknote/mantine', '@blocknote/xl-multi-column',
        'gsap', 'gsap/ScrollTrigger', 'lenis',
      ],
    },
  },

  app: {
    head: {
      link: [
        // ?v= busts the browsers' sticky favicon cache; bump BRAND_ICON_VERSION when the logo changes.
        { rel: 'icon', type: 'image/x-icon', href: `/favicon.ico?v=${BRAND_ICON_VERSION}`, sizes: '16x16 32x32 48x48' },
        { rel: 'icon', type: 'image/webp', href: `/favicon-32x32.webp?v=${BRAND_ICON_VERSION}`, sizes: '32x32' },
        { rel: 'icon', type: 'image/webp', href: `/favicon-64x64.webp?v=${BRAND_ICON_VERSION}`, sizes: '64x64' },
        { rel: 'icon', type: 'image/webp', href: `/favicon-192x192.webp?v=${BRAND_ICON_VERSION}`, sizes: '192x192' },
        { rel: 'apple-touch-icon', href: `/apple-touch-icon.png?v=${BRAND_ICON_VERSION}` },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Blog Sony Christanto', href: '/feed.xml' },
      ],
      meta: [{ name: 'theme-color', content: '#F4F3F0' }],
    },
    // Page transitions are done with GSAP in layouts/default.vue (see PageTransition).
  },

  // ---------------------------------------------------------------- i18n / l10n
  i18n: {
    strategy: 'prefix', // every public URL carries /id or /en
    defaultLocale: 'id',
    locales: [
      { code: 'id', language: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json', dir: 'ltr' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
    ],
    langDir: 'locales',
    baseUrl: siteUrl, // absolute hreflang / canonical URLs
    detectBrowserLanguage: false, // root is a cached 301 to /id; visitors switch with the ID/EN toggle
    customRoutes: 'meta', // dashboard pages opt out with definePageMeta({ i18n: false })
    vueI18n: './i18n.config.ts',
    compilation: { strictMessage: false }, // headings use <br> (trusted copy, v-html)
  },

  // ------------------------------------------------------------ Nuxt SEO suite
  // https://nuxtseo.com — site config is shared by robots, sitemap, schema.org, seo-utils.
  site: {
    url: siteUrl,
    name: 'Sony Christanto',
    description: 'Situs resmi Sony Christanto, SE., M.Si — Anggota DPRD Kota Batam.',
    defaultLocale: 'id',
    indexable: true,
  },
  robots: {
    // AI/answer-engine crawlers are allowed on purpose (GEO) — PRD K-6.
    groups: [
      { userAgent: ['*'], allow: ['/'], disallow: ['/dashboard', '/api/', '/_internal/'] },
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'],
        allow: ['/'],
        disallow: ['/dashboard', '/api/'],
      },
    ],
    blockNonSeoBots: false,
  },
  sitemap: {
    // Static (SSG) pages are discovered from the router + prerender list.
    // Articles come from the backend through this source (Indonesian only, see blog/[slug].vue).
    sources: ['/sitemap-sources/articles'],
    exclude: ['/dashboard/**', '/_internal/**', '/en/blog/**', '/en/blog'],
    cacheMaxAgeSeconds: 600, // purged by /_internal/revalidate as well
    autoLastmod: true,
    xsl: false,
  },
  schemaOrg: {
    // Person entity (@id <site>/#identity) built from app/data — see utils/schema.ts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    identity: personIdentity(siteUrl) as any,
  },
  seo: {
    redirectToCanonicalSiteUrl: false, // Cloudflare/nginx already force the apex host
  },
  ogImage: { enabled: false }, // static OG image + article banners (no Satori/Chromium)
  linkChecker: { enabled: false }, // blog links need the API, absent at build time
  aiReady: { enabled: false }, // curated /llms.txt + /llms-full.txt live in server/routes
  skewProtection: { enabled: false }, // immutable Docker images; no persistent asset store

  // Every key can be overridden with NUXT_* env vars (see .env.example).
  // NUXT_PUBLIC_* values used by PRERENDERED pages must exist at BUILD time
  // (Docker build args in CI), not only at runtime.
  runtimeConfig: {
    apiInternalUrl: 'http://backend:8080', // NUXT_API_INTERNAL_URL
    revalidateSecret: '', // NUXT_REVALIDATE_SECRET
    public: {
      siteUrl, // NUXT_PUBLIC_SITE_URL
      gtmId: '', // NUXT_PUBLIC_GTM_ID
      securityContact: 'mailto:cs@bidtech.co.id', // NUXT_PUBLIC_SECURITY_CONTACT
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
    '/images/**': { headers: { 'Cache-Control': 'public, max-age=604800' } },

    // "/" and old unprefixed URLs -> /id/... : server/middleware/locale-redirect.ts
    // (kept out of routeRules so the sitemap/robots modules don't treat
    // /id/<page> as a redirect after stripping the locale prefix).

    ...Object.fromEntries(LOCALES.flatMap((l) => [[`/${l}`, isr], [`/${l}/blog`, isr], [`/${l}/blog/**`, isr]])),
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
      routes: [...prerenderRoutes(LOCALES), '/robots.txt', '/.well-known/security.txt'],
      failOnError: true,
    },
  },

  typescript: { strict: true },
})
