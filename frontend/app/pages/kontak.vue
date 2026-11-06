<script setup lang="ts">
import { site } from '~/data/site'

const office = site.contact.office
usePageSeo({
  title: 'Kontak',
  description: `Hubungi ${site.name}: email ${site.contact.email}, WhatsApp ${site.contact.phoneDisplay}, kantor ${office.street}, ${office.locality}, ${office.city}.`,
  path: '/kontak',
})
const { siteUrl } = useRuntimeConfig().public
useJsonLd({ '@type': 'ContactPage', url: `${siteUrl}/kontak`, about: { '@id': personId(siteUrl) } })

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${office.street}, ${office.locality}, ${office.city}`)}`
</script>

<template>
  <div>
    <PageHero eyebrow="Kontak" :title="`Hubungi ${site.name}`" lead="Untuk aspirasi, undangan kegiatan, atau korespondensi." :crumbs="[{ name: 'Kontak', path: '/kontak' }]" />
    <section class="container-page grid gap-12 py-16 md:grid-cols-2">
      <div>
        <h2 class="font-display text-3xl font-semibold">Kanal resmi</h2>
        <ul class="mt-6 divide-y divide-cream-300 border-y border-cream-300">
          <li><a :href="`mailto:${site.contact.email}`" class="flex min-h-16 items-center justify-between gap-4 py-3 hover:bg-cream-100"><span class="text-ink-600">Email</span><span class="font-medium">{{ site.contact.email }}</span></a></li>
          <li><a :href="`https://wa.me/${site.contact.whatsapp}`" target="_blank" rel="noopener" class="flex min-h-16 items-center justify-between gap-4 py-3 hover:bg-cream-100"><span class="text-ink-600">WhatsApp</span><span class="font-medium">{{ site.contact.phoneDisplay }}</span></a></li>
          <li v-for="s in site.social" :key="s.key">
            <a v-if="s.url" :href="s.url" target="_blank" rel="me noopener" class="flex min-h-16 items-center justify-between gap-4 py-3 hover:bg-cream-100"><span class="text-ink-600">{{ s.label }}</span><span class="font-medium">{{ s.handle }}</span></a>
            <div v-else class="flex min-h-16 items-center justify-between gap-4 py-3"><span class="text-ink-600">{{ s.label }}</span><span class="font-medium">{{ s.handle }}</span></div>
          </li>
        </ul>
      </div>
      <div>
        <h2 class="font-display text-3xl font-semibold">Kantor</h2>
        <address class="mt-6 not-italic text-lg">
          {{ office.street }}<br />
          {{ office.locality }}, {{ office.city }}<br />
          {{ office.region }}
        </address>
        <a :href="mapsUrl" target="_blank" rel="noopener" class="btn-dark mt-8">Buka di Google Maps</a>
      </div>
    </section>
  </div>
</template>
