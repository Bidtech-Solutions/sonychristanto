<script setup lang="ts">
// Footer (DESIGN.md §7.9): lockup, slash nav, IG / FB / WA, address, and the
// giant cropped "CHRISTANTO" wordmark whose letters rise as you reach the end.
import { navigationFull, site } from '~/data/site'

const { t, lp } = useL()
const giant = ref<HTMLElement>()
const letters = 'Christanto'.split('')

useGsap(giant, (gsap) => {
  gsap.from(giant.value!.querySelectorAll('span'), {
    yPercent: 70,
    ease: 'none',
    stagger: 0.04,
    scrollTrigger: { trigger: giant.value!, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 },
  })
})
// Widened type: an account without a URL (yet) renders as a muted, unlinked label.
const socials: { key: string; short: string; label: string; handle: string; url: string; icon: string }[] = [...site.social]
</script>

<template>
  <footer class="relative flex w-full max-w-[1408px] flex-col gap-10 overflow-hidden px-5 pt-14 md:px-10">
    <!-- Mobile: left-aligned and stacked (only the CHRISTANTO wordmark is centred);
         the "/" separators are hidden there because wrapped lines would otherwise
         start with a stray slash. -->
    <div class="flex flex-wrap items-end justify-between gap-8 max-md:flex-col max-md:items-start">
      <BrandLockup size="footer" />
      <LanguageSwitcher />
    </div>
    <div class="label flex flex-wrap justify-between gap-6 text-ink-soft max-md:flex-col">
      <nav :aria-label="t('nav.mainMenu')">
        <ul class="flex flex-wrap gap-3 max-md:gap-x-5 max-md:gap-y-2">
          <template v-for="(item, i) in navigationFull" :key="item.key">
            <li v-if="i > 0" aria-hidden="true" class="max-md:hidden">/</li>
            <li><NuxtLink :to="lp(item.to)" class="hover:text-signal-ink">{{ t(`nav.${item.key}`) }}</NuxtLink></li>
          </template>
        </ul>
      </nav>
      <p class="flex flex-wrap items-center gap-3 max-md:gap-x-5 max-md:gap-y-2">
        <template v-for="(sc, i) in socials" :key="sc.key">
          <span v-if="i > 0" aria-hidden="true" class="max-md:hidden">/</span>
          <a v-if="sc.url" :href="sc.url" rel="me noopener" target="_blank" class="inline-flex items-center gap-2 text-ink hover:text-signal-ink">
            <img :src="sc.icon" alt="" width="20" height="20" class="size-5 rounded-[5px]" loading="lazy" />{{ sc.short }}<span v-if="sc.key === 'instagram'" class="normal-case tracking-normal">{{ sc.handle }}</span>
          </a>
          <span v-else class="inline-flex items-center gap-2 opacity-60" :title="sc.label"><img :src="sc.icon" alt="" width="20" height="20" class="size-5 rounded-[5px] grayscale" loading="lazy" />{{ sc.short }}</span>
        </template>
        <span aria-hidden="true" class="max-md:hidden">/</span>
        <a :href="`https://wa.me/${site.contact.whatsapp}`" class="text-ink hover:text-signal-ink">WA</a>
      </p>
      <address v-if="site.contact.showOffice" class="not-italic">{{ site.contact.office.street }}, {{ site.contact.office.locality }}, {{ site.contact.office.city }}</address>
      <span>{{ site.tagline }} · {{ t('footer.rights', { year: 2026 }) }}</span>
    </div>
    <!-- Sized to the footer's own width (cqw), not the viewport (vw): with the
         page and footer padding, 12.5vw overflowed and clipped the final "O".
         Cropped only by the bottom edge (DESIGN.md §5). -->
    <div class="@container w-full">
      <div ref="giant" aria-hidden="true" class="font-display-x -mb-[0.12em] whitespace-nowrap text-center text-[12.6cqw] font-bold leading-[0.78] tracking-[-0.04em] text-stone-deep">
        <span v-for="(l, i) in letters" :key="i" class="inline-block">{{ l }}</span>
      </div>
    </div>
  </footer>
</template>
