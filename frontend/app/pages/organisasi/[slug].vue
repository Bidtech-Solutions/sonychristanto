<script setup lang="ts">
import { organizations, periodLabel } from '~/data/organizations'
import { site } from '~/data/site'

const route = useRoute()
const org = organizations.find((o) => o.slug === route.params.slug)
if (!org) throw createError({ statusCode: 404, statusMessage: 'Organisasi tidak ditemukan', fatal: true })

const roleText = org.role ? `${org.role} ` : 'Anggota/pengurus '
const description = org.description ?? `${roleText}${org.name} (${periodLabel(org)}) — kiprah ${site.name}.`
usePageSeo({ title: org.name, description, path: `/organisasi/${org.slug}`, image: org.logo })

const { siteUrl } = useRuntimeConfig().public
useJsonLd({
  '@type': 'OrganizationRole',
  roleName: org.role || undefined,
  startDate: String(org.start),
  endDate: org.end ? String(org.end) : undefined,
  member: { '@id': personId(siteUrl) },
  memberOf: { '@type': 'Organization', name: org.name, url: org.url },
})
</script>

<template>
  <div v-if="org">
    <PageHero
      :eyebrow="org.kind === 'partai' ? 'Kepartaian' : 'Organisasi'"
      :title="org.name"
      :lead="[org.role, periodLabel(org)].filter(Boolean).join(' · ')"
      :crumbs="[{ name: 'Organisasi', path: '/organisasi' }, { name: org.name, path: `/organisasi/${org.slug}` }]"
    />
    <section class="container-page max-w-3xl py-16">
      <img v-if="org.logo" :src="org.logo" :alt="`Logo ${org.name}`" class="mb-10 h-24 w-auto" loading="lazy" />
      <div v-if="org.description" class="prose-article"><p>{{ org.description }}</p></div>
      <template v-if="org.contributions?.length">
        <h2 class="mt-12 font-display text-3xl font-semibold">Kontribusi</h2>
        <ul class="prose-article mt-4"><li v-for="c in org.contributions" :key="c">{{ c }}</li></ul>
      </template>
      <EmptyState v-if="!org.description && !org.contributions?.length" title="Detail segera hadir" text="Uraian peran dan kontribusi sedang disiapkan." />
      <NuxtLink to="/organisasi" class="mt-12 inline-block font-semibold text-navy-700 underline underline-offset-4">← Semua organisasi</NuxtLink>
    </section>
  </div>
</template>
