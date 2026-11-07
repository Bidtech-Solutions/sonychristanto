<script setup lang="ts">
import { awards } from '~/data/awards'

const route = useRoute()
const { t, tx, lp } = useL()
const award = awards.find((a) => a.slug === route.params.slug)
if (!award) throw createError({ statusCode: 404, statusMessage: t('error.notFound'), fatal: true })

usePageSeo({ title: tx(award.title), description: tx(award.summary), path: `/penghargaan/${award.slug}`, image: award.image?.src, imageAlt: tx(award.image?.alt) })
const { siteUrl } = useRuntimeConfig().public
useJsonLd({ '@type': 'Person', '@id': personId(siteUrl), award: `${tx(award.title)} — ${award.issuer} (${award.year})` })
</script>

<template>
  <div v-if="award" class="page-root">
    <PageHero size="md" :lines="[tx(award.title)]" :lead="`${award.issuer} · ${award.year}`" :crumbs="[{ name: t('awards.title'), path: '/penghargaan' }, { name: tx(award.title), path: `/penghargaan/${award.slug}` }]" />
    <section class="sec flex max-w-3xl flex-col gap-10">
      <img v-if="award.image" :src="award.image.src" :alt="tx(award.image.alt)" data-reveal class="w-full rounded-[20px]" />
      <div class="prose-article" data-reveal>
        <p>{{ tx(award.summary) }}</p>
        <p v-for="(p, i) in award.body ?? []" :key="i">{{ tx(p) }}</p>
      </div>
      <NuxtLink :to="lp('/penghargaan')" class="btn-line self-start">← {{ t('awards.back') }}</NuxtLink>
    </section>
  </div>
</template>
