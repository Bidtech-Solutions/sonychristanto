<script setup lang="ts">
// /organisasi (Organisasi.dc.html): hero with floating logo orbs + stats,
// Gantt "Linimasa Kiprah", detail panel.
import { organizations, orgStatus } from '~/data/organizations'

const { t, lp } = useL()
usePageSeo({ title: t('org.title'), description: t('org.description'), path: '/organisasi' })
const { siteUrl } = useRuntimeConfig().public
useJsonLd({
  '@type': 'ItemList',
  name: t('org.title'),
  itemListElement: organizations.map((o, i) => ({ '@type': 'ListItem', position: i + 1, name: o.name, url: siteUrl + lp(`/organisasi/${o.slug}`) })),
})
const count = (s: string) => organizations.filter((o) => orgStatus(o) === s).length
// Logo orbs: one square "canvas" (@container) whose positions are % and sizes
// are cqw (% of the canvas width), so the whole composition scales as a unit —
// no overlap at any width. Sizes = the original desktop px on a 560px canvas
// (190px → 34cqw ...). Only as many orbs as there are slots; the full list is
// in the timeline below.
const orbPos = [
  'left-[36%] top-[30%] size-[34cqw]',
  'left-[6%] top-[8%] size-[23.2cqw]',
  'right-[4%] top-[4%] size-[25cqw]',
  'left-[4%] bottom-[10%] size-[21.4cqw]',
  'right-[8%] bottom-[6%] size-[24.3cqw]',
  'left-[40%] bottom-0 size-[16.4cqw]',
]
const orbs = organizations.filter((o) => orgStatus(o) === 'berjalan').slice(0, orbPos.length)
</script>

<template>
  <div class="page-root">
    <!-- grid-cols-1 = minmax(0,1fr): without it the implicit column grows to the unbreakable
         word "ORGANISASI" and the panel (overflow-hidden) clips the lead and stats on mobile. -->
    <!-- Two columns only from lg: on tablets the logo column was too narrow (~300px). -->
    <section class="panel grid grid-cols-1 gap-6 bg-stone px-5 py-10 md:px-12 md:py-14 lg:grid-cols-2">
      <div class="flex min-w-0 flex-col justify-between gap-10">
        <Breadcrumbs :items="[{ name: t('org.title'), path: '/organisasi' }]" />
        <!-- Indent only from md: on a phone the long word needs the full width. -->
        <RevealText as="h1" trigger="load" class="font-display-x m-0 text-[9.4vw] font-bold leading-[0.86] tracking-[-0.035em] md:text-[clamp(64px,8vw,124px)]" :lines="[{ text: t('org.heroLine1'), class: 'text-ink-ghost' }, { text: t('org.heroLine2'), class: 'md:pl-[10%]' }]" />
        <p data-reveal class="m-0 max-w-[520px] text-[18px] leading-relaxed text-ink-soft md:text-[19px]">{{ t('org.lead') }}</p>
        <dl class="grid grid-cols-[repeat(3,auto)] justify-between border-t border-ink pt-5 md:grid-cols-3 md:justify-stretch" data-reveal>
          <div class="flex flex-col-reverse gap-2"><dt class="label-sm text-ink-soft max-md:text-[10.5px]! max-md:tracking-[0.06em]!">{{ t('org.statOngoing') }}</dt><dd class="font-display-x m-0 text-[44px] font-semibold leading-[0.9] text-signal md:text-[56px]"><CountUp :value="count('berjalan')" /></dd></div>
          <div class="flex flex-col-reverse gap-2 border-l border-stone-deep pl-3 md:pl-5"><dt class="label-sm text-ink-soft max-md:text-[10.5px]! max-md:tracking-[0.06em]!">{{ t('org.statPast') }}</dt><dd class="font-display-x m-0 text-[44px] font-semibold leading-[0.9] md:text-[56px]"><CountUp :value="count('sebelumnya')" /></dd></div>
          <div class="flex flex-col-reverse gap-2 border-l border-stone-deep pl-3 md:pl-5"><dt class="label-sm text-ink-soft max-md:text-[10.5px]! max-md:tracking-[0.06em]!">{{ t('org.statParty') }}</dt><dd class="font-display-x m-0 text-[44px] font-semibold leading-[0.9] md:text-[56px]"><CountUp :value="count('partai')" /></dd></div>
        </dl>
      </div>
      <div aria-hidden="true" class="@container relative mx-auto aspect-square w-full max-w-[440px] self-center lg:max-w-[560px]">
        <LightGrid class="absolute left-[14%] top-[10%] h-[70%] w-[72%]" :blur="20" :opacity="0.35" interactive />
        <!-- The reveal (GSAP transform) lives on the link and the float (CSS transform
             animation) on the inner span, so the two never fight over one element. -->
        <NuxtLink
          v-for="(o, k) in orbs"
          :key="o.slug"
          :to="lp(`/organisasi/${o.slug}`)"
          tabindex="-1"
          data-reveal="scale"
          :data-reveal-delay="0.3 + k * 0.08"
          class="absolute"
          :class="orbPos[k]"
        >
          <span
            class="flex size-full animate-floaty items-center justify-center rounded-full bg-white shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition-[scale] duration-500 hover:scale-110"
            :style="{ animationDelay: `${-k * 2}s` }"
          >
            <img :src="o.logo" alt="" class="size-[72%] object-contain" />
          </span>
        </NuxtLink>
      </div>
    </section>

    <OrgTimeline />
  </div>
</template>
