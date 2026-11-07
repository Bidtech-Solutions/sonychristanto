<script setup lang="ts">
import { organizations, orgStatus } from '~/data/organizations'
import { site } from '~/data/site'

const route = useRoute()
const { t, tx, lp, period } = useL()
const org = organizations.find((o) => o.slug === route.params.slug)
if (!org) throw createError({ statusCode: 404, statusMessage: t('error.notFound'), fatal: true })

const role = org.role ? tx(org.role) : ''
const description = org.description ? tx(org.description) : `${role ? `${role}, ` : ''}${org.name} (${period(org)}) — ${site.name}.`
usePageSeo({ title: org.name, description, path: `/organisasi/${org.slug}`, image: org.logo })

const { siteUrl } = useRuntimeConfig().public
useJsonLd({
  '@type': 'OrganizationRole',
  roleName: role || undefined,
  startDate: String(org.start),
  endDate: org.end ? String(org.end) : undefined,
  member: { '@id': personId(siteUrl) },
  memberOf: { '@type': 'Organization', name: org.name, url: org.url },
})
const status = orgStatus(org)
</script>

<template>
  <div v-if="org" class="page-root">
    <PageHero
      size="md"
      :lines="[org.name]"
      :lead="[role, period(org)].filter(Boolean).join(' · ')"
      :crumbs="[{ name: t('org.title'), path: '/organisasi' }, { name: org.short, path: `/organisasi/${org.slug}` }]"
    >
      <span data-reveal class="label-sm self-start rounded-full px-3 py-1.5" :class="status === 'berjalan' ? 'bg-signal-tint text-signal-ink' : 'bg-paper text-ink'">
        {{ t(`org.status${status === 'berjalan' ? 'Ongoing' : status === 'sebelumnya' ? 'Past' : 'Party'}`) }}
      </span>
    </PageHero>
    <section class="sec grid gap-12 md:grid-cols-[260px_minmax(0,1fr)]">
      <div data-reveal="scale" class="flex size-[220px] items-center justify-center overflow-hidden rounded-full bg-white">
        <img v-if="org.logo" :src="org.logo" :alt="`Logo ${org.name}`" class="size-[70%] object-contain" />
        <span v-else class="font-display-x text-[56px] font-bold text-ink-ghost">{{ org.initials }}</span>
      </div>
      <div class="flex max-w-3xl flex-col gap-8">
        <dl class="grid grid-cols-2 gap-6 border-t border-ink pt-5" data-reveal>
          <div><dt class="label-sm text-ink-soft">{{ t('org.role') }}</dt><dd class="font-display-m m-0 mt-2 text-[22px] font-semibold uppercase">{{ role || t('org.noRole') }}</dd></div>
          <div><dt class="label-sm text-ink-soft">{{ t('org.period') }}</dt><dd class="font-display-m m-0 mt-2 text-[22px] font-semibold uppercase">{{ period(org) }}</dd></div>
        </dl>
        <div v-if="org.description" class="prose-article" data-reveal><p>{{ tx(org.description) }}</p></div>
        <template v-if="org.contributions?.length">
          <h2 class="h2-display text-[34px]" data-reveal>{{ t('org.contributions') }}</h2>
          <ul class="prose-article" data-reveal><li v-for="c in org.contributions" :key="c.id">{{ tx(c) }}</li></ul>
        </template>
        <a v-if="org.url" :href="org.url" target="_blank" rel="noopener" class="label group hover:text-signal-ink">{{ t('org.website') }} <span class="arrow-nudge text-signal">↗</span></a>
        <NuxtLink :to="lp('/organisasi')" class="btn-line group self-start">← {{ t('org.back') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>
