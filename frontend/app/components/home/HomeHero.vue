<script setup lang="ts">
// Hero "Sampul Majalah" (DESIGN.md §7a): masthead name, full-body cutout in
// front of it, cover lines with leader lines, red band at the bottom.
// Intro (GSAP): masthead letters rise, figure rises 24px, leader lines draw
// from the outside in, cover lines fade, band slides up. Pointer moves the
// figure and the light grid slightly (depth) — never the text.
import { biography } from '~/data/biography'
import { ongoingOrganizations } from '~/data/organizations'
import { site } from '~/data/site'
import type { PublicArticle } from '~/types/api'

const props = defineProps<{ latest?: PublicArticle | null }>()
const { t, tx, lp } = useL()
const root = ref<HTMLElement>()
const figure = ref<HTMLElement>()
const orgCount = ongoingOrganizations().length
const degrees = biography.education.filter((e) => e.degree).map((e) => e.institution).join(' · ')
const cut = site.cutouts.standing

useGsap(root, (gsap) => {
  const q = gsap.utils.selector(root.value!)
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  // fromTo everywhere: CSS keeps these hidden until now (html.js [data-intro]).
  tl.fromTo(q('[data-mast] .ch'), { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 1.2, stagger: 0.035 }, 0.1)
    .fromTo(q('[data-topbar]'), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
    .fromTo(figure.value!, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: 'power3.out' }, 0.35)
    .fromTo(q('[data-shadow]'), { scaleX: 0.4, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0.45)
    .fromTo(q('[data-leader-l]'), { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 0.9, stagger: 0.12, ease: 'power3.inOut' }, 0.7)
    .fromTo(q('[data-leader-r]'), { scaleX: 0 }, { scaleX: 1, transformOrigin: 'right center', duration: 0.9, stagger: 0.12, ease: 'power3.inOut' }, 0.7)
    .fromTo(q('[data-dot]'), { scale: 0 }, { scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(3)' }, 1.3)
    .fromTo(q('[data-cover]'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.8)
    .fromTo(q('[data-band]'), { yPercent: 140, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'power4.out' }, 0.9)

  // Pointer depth: figure follows the pointer a little.
  const fx = gsap.quickTo(figure.value!, 'x', { duration: 1, ease: 'power3.out' })
  const rot = gsap.quickTo(figure.value!, 'rotation', { duration: 1.2, ease: 'power3.out' })
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const nx = e.clientX / window.innerWidth - 0.5
    fx(nx * 26)
    rot(nx * 1.2)
  }
  root.value!.addEventListener('pointermove', move)
  // On scroll out, the figure sinks behind the band.
  gsap.to(figure.value!, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: root.value!, start: 'top top', end: 'bottom top', scrub: true } })
  return () => root.value?.removeEventListener('pointermove', move)
})

const mast = ['Sony', 'Christanto']
</script>

<template>
  <section ref="root" class="panel h-[838px] bg-stone md:h-[908px]">
    <div data-topbar data-intro><SiteHeader variant="hero" /></div>

    <!-- Masthead (one <h1> per page) -->
    <h1 data-mast :aria-label="site.name" class="font-display-x absolute inset-x-0 top-[70px] z-0 m-0 text-center font-bold leading-[0.86] tracking-[-0.035em] md:top-16">
      <span v-for="(word, wi) in mast" :key="word" aria-hidden="true" class="inline-block overflow-hidden max-md:block" :class="wi === 0 ? 'text-[26vw] md:text-[clamp(48px,7.3vw,106px)]' : 'text-[11.4vw] md:text-[clamp(48px,7.3vw,106px)]'">
        <span v-for="(c, ci) in word.split('')" :key="ci" class="ch inline-block">{{ c }}</span><span v-if="wi === 0" class="max-md:hidden">&nbsp;</span>
      </span>
    </h1>

    <LightGrid class="absolute left-1/2 top-[22%] z-[1] h-[46%] w-[min(520px,70vw)] -translate-x-1/2" :cols="3" :rows="3" :blur="22" :opacity="0.22" :rotate="-6" interactive />

    <!-- Cover star -->
    <div data-shadow data-intro aria-hidden="true" class="absolute bottom-[64px] left-1/2 z-[2] h-10 w-[300px] -translate-x-1/2 rounded-[50%] bg-black/20 blur-[14px] md:bottom-[92px]" />
    <div ref="figure" data-intro class="absolute bottom-[74px] left-1/2 z-[3] h-[600px] -translate-x-1/2 md:bottom-[108px] md:h-[720px]">
      <img :src="cut.src" :alt="tx(cut.alt)" :width="cut.width" :height="cut.height" fetchpriority="high" decoding="async" class="h-full w-auto max-w-none object-contain drop-shadow-[0_26px_34px_rgba(0,0,0,0.14)]" />
    </div>

    <!-- Cover lines: left -->
    <div class="absolute left-3 top-[440px] z-[4] flex w-[150px] flex-col gap-0 rounded-[14px] bg-paper/95 px-3 py-2.5 md:left-10 md:top-[290px] md:w-[min(420px,30%)] md:gap-[52px] md:rounded-none md:bg-transparent md:p-0">
      <div class="flex items-center gap-4">
        <div data-cover data-intro class="flex min-w-0 flex-col gap-1.5 md:flex-none">
          <span class="label-sm text-signal-ink">{{ t('home.coverJob') }}</span>
          <span class="font-display-x max-w-[260px] text-[15px] [overflow-wrap:anywhere] font-semibold leading-[0.95] md:text-[30px]">{{ tx(site.jobTitle) }}</span>
          <span class="text-[15px] text-ink-soft max-md:hidden">{{ tx(site.commission) }} · {{ t('common.since') }} {{ site.jobSince }}</span>
        </div>
        <span data-leader-l aria-hidden="true" class="h-px flex-1 bg-ink max-md:hidden" />
        <span data-dot aria-hidden="true" class="size-2 rounded-full bg-ink max-md:hidden" />
      </div>
      <div class="flex items-center gap-4 max-md:hidden">
        <div data-cover data-intro class="flex flex-none flex-col gap-1.5">
          <span class="label-sm text-signal-ink">{{ t('home.coverReach') }}</span>
          <span class="font-display-x text-[30px] font-semibold leading-[0.95]">{{ t('home.coverReachValue', { n: orgCount }) }}</span>
        </div>
        <span data-leader-l aria-hidden="true" class="h-px flex-1 bg-ink" />
        <span data-dot aria-hidden="true" class="size-2 rounded-full bg-ink" />
      </div>
      <div data-cover data-intro class="flex flex-col gap-1.5 max-md:hidden">
        <span class="label-sm text-signal-ink">{{ t('home.coverEducation') }}</span>
        <span class="font-display-x text-[30px] font-semibold leading-[0.95]">{{ site.honorificSuffix }}</span>
        <span class="text-[15px] text-ink-soft">{{ degrees }}</span>
      </div>
    </div>

    <!-- Mobile: second chip (Kiprah) on the right -->
    <div data-cover data-intro class="absolute right-3 top-[560px] z-[4] flex w-[150px] flex-col gap-1.5 rounded-[14px] bg-paper/95 px-3 py-2.5 md:hidden">
      <span class="label-sm text-signal-ink">{{ t('home.coverReach') }}</span>
      <span class="font-display-x text-[16px] font-semibold leading-[0.95]">{{ t('home.coverReachValue', { n: orgCount }) }}</span>
    </div>

    <!-- Cover lines: right -->
    <div class="absolute right-10 top-[290px] z-[4] hidden w-[min(420px,30%)] flex-col gap-[52px] md:flex">
      <div class="flex items-center gap-4">
        <span data-dot aria-hidden="true" class="size-2 rounded-full bg-ink" />
        <span data-leader-r aria-hidden="true" class="h-px flex-1 bg-ink" />
        <div data-cover data-intro class="flex flex-none flex-col gap-1.5 text-right">
          <span class="label-sm text-signal-ink">{{ t('home.coverMessage') }}</span>
          <span class="font-display-x text-[30px] font-semibold leading-[0.95]">Yang Muda<br>Berkarya</span>
        </div>
      </div>
      <NuxtLink v-if="props.latest" :to="lp(`/blog/${props.latest.slug}`)" class="group flex items-center gap-4">
        <span data-dot aria-hidden="true" class="size-2 rounded-full bg-ink" />
        <span data-leader-r aria-hidden="true" class="h-px flex-1 bg-ink" />
        <span data-cover data-intro class="flex max-w-[60%] flex-none flex-col gap-1.5 text-right">
          <span class="label-sm text-signal-ink">{{ t('home.coverLatest') }}</span>
          <span class="font-display-x line-clamp-3 text-[22px] font-semibold leading-[0.98] group-hover:text-signal-ink">{{ props.latest.title }} <span class="arrow-nudge text-signal">↗</span></span>
        </span>
      </NuxtLink>
      <div data-cover data-intro class="flex justify-end">
        <MagneticWrap>
          <NuxtLink :to="lp('/biografi')" class="group inline-flex h-14 items-center rounded-full bg-ink px-7 text-[13px] font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-signal">
            {{ t('home.knowMore') }} <span class="arrow-nudge ml-2 text-signal group-hover:text-white">↗</span>
          </NuxtLink>
        </MagneticWrap>
      </div>
    </div>

    <div data-band data-intro class="absolute inset-x-2.5 bottom-2.5 z-[2] md:inset-x-6 md:bottom-6">
      <RedBand />
    </div>
  </section>
</template>
