<script setup lang="ts">
import { site } from '~/data/site'

const route = useRoute()
const config = useRuntimeConfig()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))

useHead({
  titleTemplate: (t?: string) => (t ? `${t} — ${site.name}` : `${site.name} — ${site.jobTitle}`),
})

// Site-wide entities, public pages only.
if (!isDashboard.value) {
  useJsonLd([websiteSchema(config.public.siteUrl), personSchema(config.public.siteUrl)])
}

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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
