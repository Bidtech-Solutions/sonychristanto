<script setup lang="ts">
import { publications, publicationTypeLabel } from '~/data/publications'

const { t, tx, lp } = useL()
usePageSeo({ title: t('writings.title'), description: t('writings.description'), path: '/karya-tulis' })
const sorted = [...publications].sort((a, b) => b.year - a.year)
</script>

<template>
  <div class="page-root">
    <PageHero :lines="[t('writings.title')]" :lead="t('writings.lead')" :crumbs="[{ name: t('writings.title'), path: '/karya-tulis' }]" />
    <section class="sec">
      <ul v-if="sorted.length" class="m-0 list-none border-t border-ink p-0">
        <li v-for="p in sorted" :key="p.slug">
          <NuxtLink :to="lp(`/karya-tulis/${p.slug}`)" data-reveal class="group flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-stone-deep px-2 py-[26px] transition-colors hover:bg-signal-tint">
            <span class="label w-full flex-none text-signal-ink md:w-48">{{ tx(publicationTypeLabel[p.type]) }} · {{ p.year }}</span>
            <h2 class="font-display-m m-0 flex-[1_1_420px] text-[22px] font-semibold uppercase leading-none transition-colors group-hover:text-signal-ink md:text-[28px]">{{ p.title }}</h2>
            <span class="flex-[0_1_260px] text-ink-soft">{{ p.authors.join(', ') }}<template v-if="p.venue"> · {{ p.venue }}</template></span>
            <span class="arrow-nudge text-signal">↗</span>
          </NuxtLink>
        </li>
      </ul>
      <EmptyState v-else :text="t('writings.emptyText')" />
    </section>
  </div>
</template>
