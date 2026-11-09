<script setup lang="ts">
// "Linimasa Kiprah" (Organisasi.dc.html): filter tabs, Gantt rows from 2015 to
// 2031 with a dashed "this year" line, and a detail panel for the selected row.
// Bars grow in on scroll (GSAP); tabs, row filtering and the detail panel use motion-v.
import { CURRENT_YEAR, organizations, orgStatus, type Organization } from '~/data/organizations'

const { t, tx, lp, period } = useL()
type Filter = 'semua' | 'berjalan' | 'sebelumnya' | 'partai'
const filter = ref<Filter>('semua')
const sel = ref(organizations[0]!.slug)
const Y0 = 2015
const Y1 = 2031
const SPAN = Y1 - Y0
const pct = (y: number) => `${(((y - Y0) / SPAN) * 100).toFixed(2)}%`
const rows = computed(() => organizations.filter((o) => filter.value === 'semua' || orgStatus(o) === filter.value))
const cur = computed(() => organizations.find((o) => o.slug === sel.value) ?? organizations[0]!)
const tabs = computed(() =>
  (['semua', 'berjalan', 'sebelumnya', 'partai'] as Filter[]).map((k) => ({
    k,
    label: t(`org.${k === 'semua' ? 'all' : k === 'berjalan' ? 'ongoing' : k === 'sebelumnya' ? 'past' : 'party'}`),
    count: k === 'semua' ? organizations.length : organizations.filter((o) => orgStatus(o) === k).length,
  })),
)
function pickFilter(k: Filter) {
  filter.value = k
  sel.value = (organizations.find((o) => k === 'semua' || orgStatus(o) === k) ?? organizations[0]!).slug
}
const years = Array.from({ length: 2030 - Y0 + 1 }, (_, k) => Y0 + k)
const barClass = (o: Organization) => {
  const s = orgStatus(o)
  return s === 'berjalan' ? 'bg-signal border-signal text-white' : s === 'sebelumnya' ? 'bg-ink border-ink text-white' : 'bg-white border-ink text-ink'
}
const statusLabel = (o: Organization) => t(`org.status${orgStatus(o) === 'berjalan' ? 'Ongoing' : orgStatus(o) === 'sebelumnya' ? 'Past' : 'Party'}`)

const gantt = ref<HTMLElement>()
useGsap(gantt, (gsap) => {
  gsap.fromTo(gantt.value!.querySelectorAll('[data-bar]'), { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: gantt.value!, start: 'top 75%', once: true } })
})
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <section class="sec flex flex-col gap-8 md:pb-10 md:pt-[88px]">
      <div class="flex flex-wrap items-end justify-between gap-5">
        <h2 data-reveal class="h2-display" v-html="t('org.timeline')" />
        <div role="tablist" :aria-label="t('org.filter')" class="flex flex-wrap gap-2" data-reveal>
          <button
            v-for="tab in tabs"
            :key="tab.k"
            type="button"
            role="tab"
            :aria-selected="filter === tab.k"
            class="relative isolate h-11 cursor-pointer rounded-full border-[1.5px] border-ink px-[18px] text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors"
            :class="filter === tab.k ? 'text-paper' : 'text-ink hover:bg-stone'"
            @click="pickFilter(tab.k)"
          >
            <Motion v-if="filter === tab.k" layout-id="org-tab" class="absolute inset-0 -z-10 rounded-full bg-ink" :transition="{ type: 'spring', stiffness: 400, damping: 34 }" />
            <span class="relative">{{ tab.label }} <span class="ml-1 opacity-60">{{ tab.count }}</span></span>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto overflow-y-hidden pb-2">
        <div ref="gantt" class="min-w-[980px]">
          <div class="grid grid-cols-[340px_minmax(0,1fr)] items-end border-b border-ink pb-2.5">
            <span class="label-sm text-ink-soft">{{ t('org.colOrg') }}</span>
            <div class="relative h-[18px]">
              <span
                v-for="y in years"
                :key="y"
                class="absolute -translate-x-1/2 text-[11px]"
                :class="y === CURRENT_YEAR ? 'font-bold text-signal-ink' : 'font-medium text-ink-soft'"
                :style="{ left: pct(y + 0.0001) }"
              >{{ y % 2 === 1 || y === CURRENT_YEAR ? y : '' }}</span>
            </div>
          </div>
          <TransitionGroup tag="div" move-class="transition-transform duration-500" enter-from-class="opacity-0 -translate-y-2" enter-active-class="transition duration-500" leave-active-class="hidden">
            <button
              v-for="o in rows"
              :key="o.slug"
              type="button"
              class="grid w-full cursor-pointer grid-cols-[340px_minmax(0,1fr)] items-center border-b border-stone-deep py-3 text-left transition-colors hover:bg-signal-tint"
              :class="sel === o.slug ? 'bg-signal-tint' : ''"
              :aria-pressed="sel === o.slug"
              :aria-label="`${o.name}, ${o.role ? tx(o.role) : t('org.noRole')}, ${period(o)}`"
              @click="sel = o.slug"
            >
              <span class="flex items-center gap-3 pr-4">
                <span class="flex size-10 flex-none items-center justify-center overflow-hidden rounded-full border border-stone-deep bg-white">
                  <img v-if="o.logo" :src="o.logo" alt="" class="size-4/5 object-contain" loading="lazy" />
                  <span v-else class="font-display-x text-[12px] font-bold text-ink-soft">{{ o.initials }}</span>
                </span>
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-display-m text-[15px] font-semibold uppercase leading-[1.1]" :class="sel === o.slug ? 'text-signal-ink' : 'text-ink'">{{ o.short }}</span>
                  <span class="text-[13px] text-ink-soft">{{ o.role ? tx(o.role) : t('org.noRole') }}</span>
                </span>
              </span>
              <span class="relative h-[34px]" :style="{ backgroundImage: `repeating-linear-gradient(90deg,#E8E6E1 0,#E8E6E1 1px,transparent 1px,transparent ${(100 / SPAN).toFixed(3)}%)` }">
                <span aria-hidden="true" class="absolute -bottom-3.5 -top-3.5 w-0 border-l-2 border-dashed border-signal" :style="{ left: pct(CURRENT_YEAR) }" />
                <span
                  data-bar
                  class="absolute bottom-1 top-1 box-border flex items-center overflow-hidden whitespace-nowrap rounded-full border-[1.5px] px-3 text-[11px] font-bold tracking-[0.06em]"
                  :class="barClass(o)"
                  :style="{ left: pct(o.start), width: `${((((o.end ?? Y1) - o.start) / SPAN) * 100).toFixed(2)}%` }"
                >{{ period(o) }}</span>
              </span>
            </button>
          </TransitionGroup>
          <div class="label-sm flex flex-wrap gap-5 pt-4 text-ink-soft">
            <span><span class="mr-2 inline-block h-2.5 w-[22px] rounded-full bg-signal align-middle" />{{ t('org.ongoing') }}</span>
            <span><span class="mr-2 inline-block h-2.5 w-[22px] rounded-full bg-ink align-middle" />{{ t('org.past') }}</span>
            <span><span class="mr-2 box-border inline-block h-2.5 w-[22px] rounded-full border-[1.5px] border-ink align-middle" />{{ t('org.party') }}</span>
            <span><span class="mr-2 inline-block h-3 w-0 border-l-2 border-dashed border-signal align-middle" />{{ t('org.thisYear', { year: CURRENT_YEAR }) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Detail panel -->
    <section class="panel sec bg-white md:py-12" aria-live="polite">
      <AnimatePresence mode="wait">
        <Motion :key="cur.slug" as="div" class="grid items-start gap-10 md:grid-cols-[260px_minmax(0,1fr)]" :initial="{ opacity: 0, y: 18 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -10 }" :transition="{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }">
          <div class="flex size-[220px] items-center justify-center overflow-hidden rounded-full bg-paper">
            <img v-if="cur.logo" :src="cur.logo" :alt="`Logo ${cur.name}`" class="size-[70%] object-contain" />
            <span v-else class="flex flex-col items-center gap-1.5"><span class="font-display-x text-[56px] font-bold text-ink-ghost">{{ cur.initials }}</span><span class="label-sm text-ink-soft">{{ t('org.logoSoon') }}</span></span>
          </div>
          <div class="flex flex-col gap-4">
            <span class="label-sm self-start rounded-full px-3 py-1.5" :class="orgStatus(cur) === 'berjalan' ? 'bg-signal-tint text-signal-ink' : 'bg-stone text-ink'">{{ statusLabel(cur) }} · {{ period(cur) }}</span>
            <h3 class="font-display-x m-0 text-[32px] font-semibold leading-[0.95] md:text-[44px]">{{ cur.name }}</h3>
            <span class="font-display-m text-[20px] font-semibold text-signal-ink md:text-[22px]">{{ cur.role ? tx(cur.role) : t('org.noRole') }}<template v-if="cur.roleNote"> ({{ tx(cur.roleNote) }})</template></span>
            <p v-if="cur.description" class="m-0 text-[16px] leading-relaxed text-ink-soft">{{ tx(cur.description) }}</p>
            <NuxtLink :to="lp(`/organisasi/${cur.slug}`)" class="label group self-start hover:text-signal-ink">{{ t('org.detail') }} <span class="arrow-nudge text-signal">↗</span></NuxtLink>
          </div>
        </Motion>
      </AnimatePresence>
    </section>
  </div>
</template>
