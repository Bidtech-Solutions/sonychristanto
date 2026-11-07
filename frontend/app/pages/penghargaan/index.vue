<script setup lang="ts">
import { awards } from '~/data/awards'

const { t, tx, lp } = useL()
usePageSeo({ title: t('awards.title'), description: t('awards.description'), path: '/penghargaan' })
const sorted = [...awards].sort((a, b) => b.year - a.year)
</script>

<template>
  <div class="page-root">
    <PageHero :lines="[t('awards.title')]" :lead="t('awards.lead')" ghost="★" :crumbs="[{ name: t('awards.title'), path: '/penghargaan' }]" />
    <section class="sec">
      <ul v-if="sorted.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="(a, k) in sorted" :key="a.slug">
          <!-- Featured split card for the most recent award (DESIGN.md §6) -->
          <NuxtLink :to="lp(`/penghargaan/${a.slug}`)" data-reveal class="group flex h-full flex-col overflow-hidden rounded-[20px] transition-transform duration-500 ease-[var(--ease-signal)] hover:-translate-y-1" :class="k === 0 ? 'bg-signal text-white' : 'bg-stone'">
            <span v-if="a.image" class="block aspect-[4/3] overflow-hidden"><img :src="a.image.src" :alt="tx(a.image.alt)" loading="lazy" class="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" /></span>
            <span class="flex flex-1 flex-col gap-3 p-7">
              <span class="label-sm" :class="k === 0 ? 'text-paper' : 'text-signal-ink'">{{ a.year }} · {{ a.issuer }}</span>
              <h2 class="font-display-x m-0 text-[26px] font-semibold leading-[0.95]" :class="k === 0 ? 'text-ink' : ''">{{ tx(a.title) }} <span class="arrow-nudge" :class="k === 0 ? '' : 'text-signal'">↗</span></h2>
              <p class="m-0" :class="k === 0 ? 'text-white/90' : 'text-ink-soft'">{{ tx(a.summary) }}</p>
            </span>
          </NuxtLink>
        </li>
      </ul>
      <EmptyState v-else :text="t('awards.emptyText')" />
    </section>
  </div>
</template>
