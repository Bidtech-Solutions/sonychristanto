<script setup lang="ts">
// CTA — the one ink panel on the page (DESIGN.md §7.8).
import { site } from '~/data/site'

const { t, lp } = useL()
</script>

<template>
  <section id="kontak" class="panel sec bg-ink text-paper md:py-24">
    <LightGrid class="absolute -right-10 -top-10 size-[360px]" :cols="3" :rows="3" :blur="24" :opacity="0.28" :rotate="-8" interactive />
    <RevealText
      class="font-display-x relative m-0 text-[44px] font-semibold leading-[0.9] md:text-[clamp(56px,8vw,120px)]"
      :lines="[{ text: t('home.ctaLine1') }, { text: t('home.ctaLine2'), indent: '18%' }, { text: t('home.ctaLine3'), indent: '8%', class: 'text-signal' }]"
    />
    <div class="relative mt-12 flex flex-wrap items-end justify-between gap-8">
      <MagneticWrap :strength="0.18">
        <NuxtLink
          :to="lp('/kontak')"
          class="font-display-x group relative inline-flex h-[84px] items-center overflow-hidden rounded-full border-[1.5px] border-paper px-7 text-[30px] font-semibold md:h-[120px] md:px-14 md:text-[64px]"
        >
          <span aria-hidden="true" class="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-signal transition-transform duration-500 ease-[var(--ease-signal)] group-hover:scale-y-100" />
          <span class="relative">{{ t('nav.contactCta') }}</span>
          <span class="arrow-nudge relative ml-4 text-signal group-hover:text-paper">↗</span>
        </NuxtLink>
      </MagneticWrap>
      <div class="flex max-w-[420px] flex-col gap-3.5" data-reveal>
        <a :href="`https://wa.me/${site.contact.whatsapp}`" class="btn h-13 justify-between bg-signal text-white hover:bg-paper hover:text-ink">WhatsApp · {{ site.contact.phoneDisplay }} <span>↗</span></a>
        <a :href="`mailto:${site.contact.email}`" class="btn-line-paper h-13 justify-between normal-case tracking-normal">{{ site.contact.email }} <span>↗</span></a>
        <span v-if="site.contact.showOffice" class="text-[15px] leading-relaxed text-ink-ghost">{{ t('home.office') }}: {{ site.contact.office.street }}, {{ site.contact.office.locality }}, {{ site.contact.office.city }}, {{ site.contact.office.region }}</span>
      </div>
    </div>
  </section>
</template>
