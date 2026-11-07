<script setup lang="ts">
// Red band (DESIGN.md §5.6): slow marquee of current organisations.
// GSAP loop whose speed reacts to scroll velocity (Lenis) — scroll faster and
// the band speeds up / reverses. Pauses on hover/focus and via the visible
// pause control. Static under reduced motion. Screen readers get a plain list.
import { ongoingOrganizations } from '~/data/organizations'

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const { t } = useL()
const orgs = ongoingOrganizations()
const root = ref<HTMLElement>()
const track = ref<HTMLElement>()
const paused = ref(false)
let tl: gsap.core.Tween | null = null

useGsap(root, (gsap) => {
  tl = gsap.to(track.value!, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 })
  let boost = 0
  let dir = 1
  const lenis = useLenis()
  const onScroll = (l: { velocity: number }) => {
    boost = Math.min(Math.abs(l.velocity) * 0.25, 6)
    if (Math.abs(l.velocity) > 0.5) dir = l.velocity > 0 ? 1 : -1
  }
  lenis?.on('scroll', onScroll)
  const tick = () => {
    if (!tl || paused.value) return
    boost *= 0.92
    tl.timeScale(gsap.utils.interpolate(tl.timeScale(), dir * (1 + boost), 0.12))
  }
  gsap.ticker.add(tick)
  return () => {
    gsap.ticker.remove(tick)
    lenis?.off('scroll', onScroll)
  }
})

function setPaused(v: boolean) {
  paused.value = v
  if (!tl) return
  v ? tl.pause() : tl.resume()
}
const hover = ref(false)
watch(hover, (h) => tl && (h ? tl.pause() : !paused.value && tl.resume()))
</script>

<template>
  <div
    ref="root"
    role="region"
    :aria-label="t('home.bandLabel')"
    class="relative flex items-center overflow-hidden rounded-full bg-signal"
    :class="compact ? 'h-[52px]' : 'h-[52px] md:h-[72px]'"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @focusin="hover = true"
    @focusout="hover = false"
  >
    <ul class="sr-only">
      <li v-for="o in orgs" :key="o.slug">{{ o.name }}</li>
    </ul>
    <div ref="track" aria-hidden="true" class="flex w-max flex-none will-change-transform">
      <div v-for="copy in 2" :key="copy" class="flex items-center">
        <span v-for="o in orgs" :key="`${copy}-${o.slug}`" class="inline-flex flex-none items-center gap-3 px-[22px]">
          <span class="inline-flex size-[30px] items-center justify-center overflow-hidden rounded-full bg-white md:size-10">
            <img :src="o.logo" alt="" class="size-[78%] object-contain" loading="lazy" decoding="async" width="40" height="40" />
          </span>
          <span class="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.06em] text-white md:text-[17px]">{{ o.short }}</span>
        </span>
      </div>
    </div>
    <button
      type="button"
      class="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 motion-reduce:hidden md:right-3"
      :aria-label="paused ? t('common.play') : t('common.pause')"
      :aria-pressed="paused"
      @click="setPaused(!paused)"
    >
      <svg v-if="!paused" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1" width="3" height="10" fill="currentColor" /><rect x="7" y="1" width="3" height="10" fill="currentColor" /></svg>
      <svg v-else width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1l8 5-8 5z" fill="currentColor" /></svg>
    </button>
  </div>
</template>
