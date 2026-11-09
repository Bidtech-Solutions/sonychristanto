<script setup lang="ts">
// "Jejak Pendidikan" (Landing.dc.html): photo stack + route map + year rail.
// motion-v: photo card swaps with AnimatePresence, route line draws with a
// spring; keyboard ← → also steps through the stages.
import { biography } from '~/data/biography'
import { EDU_MAP_LAND, EDU_MAP_REGION, EDU_MAP_VIEWBOX, projectLonLat } from '~/data/education-map'

const { t, tx } = useL()
const EDU = biography.education
const i = ref(0)
const n = EDU.length
const go = (k: number) => (i.value = (k + n) % n)
const cur = computed(() => EDU[i.value]!)
const pos = EDU.map((e) => projectLonLat(e.lon, e.lat))
const pct = (start: number) => `${(((start - 1980) / (2026 - 1980)) * 100).toFixed(1)}%`
// On mobile the 1990 (21.7%) and 1993 (28.3%) nodes sit only 6.6% apart (~17px),
// so enforce a minimum 15% gap between adjacent nodes below `md`.
const mobPcts = (() => {
  const raw = EDU.map((e) => ((e.start - 1980) / (2026 - 1980)) * 100)
  for (let k = 1; k < raw.length - 1; k++) {
    if (raw[k]! - raw[k - 1]! < 15) raw[k] = raw[k - 1]! + 15
  }
  return raw.map((v) => `${v.toFixed(1)}%`)
})()
const coord = (e: (typeof EDU)[number]) => `${Math.abs(e.lat).toFixed(2)}°${e.lat < 0 ? 'LS' : 'LU'} · ${e.lon.toFixed(2)}°BT`
const routeAll = pos.map((p) => `${p.x},${p.y}`).join(' ')

// Route progress 0..1 along the polyline, animated with a spring.
const segLen = pos.slice(1).map((p, k) => Math.hypot(p.x - pos[k]!.x, p.y - pos[k]!.y))
const total = segLen.reduce((a, b) => a + b, 0)
const target = computed(() => segLen.slice(0, i.value).reduce((a, b) => a + b, 0))
const progress = useSpring(0, { stiffness: 90, damping: 20 })
watch(target, (v) => progress.set(v), { immediate: true })
const dashOffset = useTransform(progress, (v: number) => total - v)

const dir = ref(1)
watch(i, (v, old) => (dir.value = v > (old ?? 0) ? 1 : -1))

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') go(i.value + 1)
  if (e.key === 'ArrowLeft') go(i.value - 1)
}
</script>

<template>
  <section id="pendidikan" class="sec flex flex-col gap-12 overflow-x-clip md:pb-20 md:pt-24" @keydown="onKey">
    <SectionHead :eyebrow="t('home.eduEyebrow')" :title="t('home.eduTitle')">
      <div class="flex items-center gap-3" data-reveal>
        <span class="font-display-x mr-2 text-[22px] font-semibold tabular-nums" aria-live="polite">0{{ i + 1 }} / 0{{ n }}</span>
        <button type="button" :aria-label="t('home.eduPrev')" class="inline-flex size-12 items-center justify-center rounded-full border-[1.5px] border-ink transition-colors hover:bg-ink hover:text-paper" @click="go(i - 1)">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button type="button" :aria-label="t('home.eduNext')" class="inline-flex size-12 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-signal" @click="go(i + 1)">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </SectionHead>

    <div class="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
      <!-- Photo stack -->
      <div data-reveal="left" class="relative min-w-0 px-3 pb-10 pt-6 md:pl-3 md:pr-7">
        <div aria-hidden="true" class="absolute inset-x-[34px] inset-y-[30px] rotate-[3.5deg] rounded-[22px] bg-stone" />
        <div aria-hidden="true" class="absolute bottom-9 left-[22px] right-[26px] top-[26px] -rotate-[1.5deg] rounded-[22px] bg-stone-deep" />
        <AnimatePresence mode="wait" :custom="dir">
          <Motion
            :key="cur.code"
            as="figure"
            class="relative m-0 rounded-[22px] bg-white p-3 shadow-[0_24px_50px_rgba(0,0,0,0.08)] sm:p-4"
            :initial="{ opacity: 0, rotate: dir * 6 - 3, x: dir * 40 }"
            :animate="{ opacity: 1, rotate: -3, x: 0 }"
            :exit="{ opacity: 0, rotate: -dir * 6 - 3, x: -dir * 40 }"
            :transition="{ type: 'spring', stiffness: 220, damping: 24 }"
          >
            <div class="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-stone">
              <img :src="cur.image" :alt="tx(cur.imageAlt)" class="absolute inset-0 size-full object-cover" loading="lazy" decoding="async" width="1200" height="900" />
              <span aria-hidden="true" class="font-display-x absolute -bottom-2.5 left-3 text-[56px] font-bold leading-[0.85] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.25)] sm:text-[72px] md:-bottom-3.5 md:left-3.5 md:text-[88px]">{{ cur.code }}</span>
            </div>
            <figcaption class="sr-only">{{ tx(cur.place) }}. {{ tx(cur.credit) }}</figcaption>
          </Motion>
        </AnimatePresence>
      </div>

      <!-- Text + route map -->
      <div class="flex min-w-0 flex-col gap-5" data-reveal="right">
        <AnimatePresence mode="wait">
          <Motion :key="cur.code" as="div" class="flex min-w-0 flex-col gap-5" :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -12 }" :transition="{ duration: 0.35 }">
            <span class="eyebrow">{{ cur.period }} · {{ tx(cur.level) }}</span>
            <h3 class="font-display-x m-0 text-[clamp(26px,7.2vw,36px)] font-semibold leading-[0.92] [overflow-wrap:anywhere] md:text-[52px]">{{ cur.institution }}</h3>
            <p class="m-0 text-[18px] leading-relaxed text-ink-soft">{{ tx(cur.desc) }}</p>
          </Motion>
        </AnimatePresence>
        <div class="relative overflow-hidden rounded-[20px] bg-stone px-4 pb-3 pt-[18px] sm:px-5">
          <span class="label-sm text-ink-soft">{{ t('home.eduRoute') }}</span>
          <svg role="img" :aria-label="t('home.eduMapLabel', { city: cur.city })" :viewBox="EDU_MAP_VIEWBOX" class="mt-1.5 block h-auto w-full">
            <path :d="EDU_MAP_REGION" fill="#DEDBD5" />
            <path :d="EDU_MAP_LAND" fill="#CFCBC4" stroke="#F4F3F0" stroke-width="0.4" />
            <polyline :points="routeAll" fill="none" stroke="#B4B1AB" stroke-width="1.5" stroke-dasharray="4 6" />
            <Motion as="polyline" :points="routeAll" fill="none" stroke="#E10600" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :stroke-dasharray="total" :style="{ strokeDashoffset: dashOffset }" />
            <g v-for="(e, k) in EDU" :key="e.code" class="cursor-pointer" @click="go(k)">
              <circle :cx="pos[k]!.x" :cy="pos[k]!.y" :r="k === i ? 9 : 5" :fill="k === i ? '#E10600' : k < i ? '#0B0B0B' : '#F4F3F0'" stroke="#0B0B0B" :stroke-width="k === i ? 0 : 1.5" class="transition-all duration-500" />
              <circle v-if="k === i" :cx="pos[k]!.x" :cy="pos[k]!.y" r="9" fill="#E10600" class="origin-center animate-pin [transform-box:fill-box]" />
              <text
                :x="pos[k]!.x > 300 || e.city === 'MADIUN' ? pos[k]!.x - 14 : pos[k]!.x + 14"
                :y="pos[k]!.y + 4"
                :text-anchor="pos[k]!.x > 300 || e.city === 'MADIUN' ? 'end' : 'start'"
                font-family="Inter Variable, Inter, sans-serif"
                font-size="12"
                :font-weight="k === i ? 700 : 500"
                letter-spacing="1"
                :fill="k === i ? '#C00000' : '#5C5A56'"
              >{{ e.city }}</text>
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- Year rail -->
    <div class="relative mx-4 h-24 md:mx-6" data-reveal>
      <div aria-hidden="true" class="absolute inset-x-0 top-[30px] h-0.5 bg-stone-deep" />
      <div aria-hidden="true" class="absolute left-0 top-[30px] h-0.5 w-[var(--p-mob)] bg-signal transition-[width] duration-700 ease-[var(--ease-signal)] md:w-[var(--p-desk)]" :style="{ '--p-mob': mobPcts[i], '--p-desk': pct(cur.start) }" />
      <span aria-hidden="true" class="absolute left-0 top-[70px] text-[12px] font-medium tracking-[0.08em] text-ink-soft">1980</span>
      <span aria-hidden="true" class="absolute right-0 top-[70px] text-[12px] font-medium tracking-[0.08em] text-ink-soft">2026</span>
      <button
        v-for="(e, k) in EDU"
        :key="e.code"
        type="button"
        class="absolute left-[var(--p-mob)] top-0 flex h-16 w-11 -translate-x-1/2 flex-col items-center gap-1 md:left-[var(--p-desk)] md:w-16"
        :style="{ '--p-mob': mobPcts[k], '--p-desk': pct(e.start) }"
        :aria-label="`${tx(e.level)}, ${e.institution}, ${e.period}`"
        :aria-pressed="k === i"
        @click="go(k)"
      >
        <span class="rounded-full border-2 transition-all duration-500 ease-[var(--ease-signal)]" :class="k === i ? 'mt-4 size-7 border-signal bg-signal' : k < i ? 'mt-[22px] size-4 border-ink bg-ink' : 'mt-[22px] size-4 border-ink bg-paper'" />
        <span class="font-display-x text-[13px] font-bold tracking-[0.04em]" :class="k === i ? 'text-signal-ink' : 'text-ink max-md:hidden'">{{ e.code }}</span>
      </button>
    </div>
  </section>
</template>
