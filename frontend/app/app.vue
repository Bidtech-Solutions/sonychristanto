<script setup lang="ts">
import { pick } from '~/data/i18n'
import { site } from '~/data/site'

const route = useRoute()
const config = useRuntimeConfig()
const { locale } = useI18n()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))

// GSAP page transition: old page lifts away, new page settles in.
// Instant under reduced motion (plugins/motion.client.ts exposes $motionReduced).
const pageTransition = {
  mode: 'out-in' as const,
  css: false,
  onLeave(el: Element, done: () => void) {
    const { $gsap, $motionReduced } = useNuxtApp()
    if ($motionReduced || !$gsap) return done()
    ;($gsap as typeof import('gsap').default).to(el, { opacity: 0, y: -18, duration: 0.32, ease: 'power2.in', onComplete: done })
  },
  onEnter(el: Element, done: () => void) {
    const { $gsap, $motionReduced, $refreshReveals } = useNuxtApp()
    // out-in: the new page is only in the DOM now, so (re)arm scroll reveals here.
    ;($refreshReveals as (() => void) | undefined)?.()
    if ($motionReduced || !$gsap) return done()
    ;($gsap as typeof import('gsap').default).fromTo(el, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'opacity,transform', onComplete: done })
  },
}

useHead({
  titleTemplate: (t?: string) => (t ? `${t} — ${site.name}` : `${site.name} — ${pick(site.jobTitle, locale.value)}`),
  // Set `html.js` before first paint so [data-reveal] content can start hidden
  // and animate in (plugins/motion.client.ts). Skipped for reduced motion.
  script: [
    {
      key: 'motion-flag',
      tagPriority: 'critical',
      innerHTML: "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!location.pathname.startsWith('/dashboard'))document.documentElement.classList.add('js')}catch(e){}",
    },
  ],
})

// <html lang>, hreflang alternates (id, en, x-default) and og:locale.
// Dashboard is not localized (definePageMeta({ i18n: false })).
const i18nHead = useLocaleHead({ dir: true, lang: true, seo: true })
// Blog articles exist in Indonesian only (the /en URL is noindex), so blog
// pages advertise no English alternate.
const isBlog = computed(() => /^\/(id|en)\/blog(\/|$)/.test(route.path))
useHead(() => {
  if (isDashboard.value) return { htmlAttrs: { lang: 'id' } }
  const link = (i18nHead.value.link ?? []).filter((l) => !(isBlog.value && String((l as { hreflang?: string }).hreflang ?? '').startsWith('en')))
  const meta = (i18nHead.value.meta ?? []).filter((m) => !(isBlog.value && String((m as { property?: string }).property ?? '') === 'og:locale:alternate'))
  return { htmlAttrs: i18nHead.value.htmlAttrs, link, meta }
})

// Google Tag Manager — public pages only, and only when an ID is configured
// (.env.prod.example: NUXT_PUBLIC_GTM_ID). Rendered into the HTML so it is
// present in prerendered pages too.
const gtmId = config.public.gtmId
if (gtmId && !isDashboard.value) {
  useHead({
    script: [
      {
        key: 'gtm-init',
        tagPriority: 'critical',
        innerHTML:
          "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());" +
          "dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});",
      },
      { key: 'gtm', src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`, async: true },
    ],
    noscript: [
      {
        key: 'gtm-noscript',
        tagPosition: 'bodyOpen',
        innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      },
    ],
  })
}
</script>

<template>
  <NuxtLoadingIndicator color="#E10600" :height="3" :throttle="120" />
  <NuxtLayout>
    <NuxtPage :transition="isDashboard ? false : pageTransition" />
  </NuxtLayout>
</template>
