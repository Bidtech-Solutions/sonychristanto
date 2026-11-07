<script setup lang="ts">
// /kontak (Kontak.dc.html): hero "MARI BICARA.", channel rows with copy
// buttons, office panel with an interactive map (Google Maps embed).
import { site } from '~/data/site'

const { t, tx, lp } = useL()
const office = site.contact.office
usePageSeo({ title: t('contact.title'), description: t('contact.description'), path: '/kontak' })
const { siteUrl } = useRuntimeConfig().public
useJsonLd({ '@type': 'ContactPage', url: siteUrl + lp('/kontak'), about: { '@id': personId(siteUrl) } })

const copied = ref('')
async function copy(key: string, text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
  } catch {
    copied.value = 'fail'
  }
  setTimeout(() => (copied.value = ''), 2400)
}
const copyLabel = (k: string) => (copied.value === k ? t('common.copied') : copied.value === 'fail' ? t('common.copyManual') : t('common.copy'))
const fb = site.social.find((s) => s.key === 'facebook')!
const ig = site.social.find((s) => s.key === 'instagram')!
const tt = site.social.find((s) => s.key === 'tiktok')!
const li = site.social.find((s) => s.key === 'linkedin')!
const channels = computed(() => [
  { no: '01', key: 'wa', icon: '', label: 'WhatsApp', value: site.contact.phoneDisplay, href: `https://wa.me/${site.contact.whatsapp}`, action: t('contact.chatNow'), tone: 'signal', copy: site.contact.phoneDisplay },
  { no: '02', key: 'em', icon: '', label: 'Email', value: site.contact.email, href: `mailto:${site.contact.email}`, action: t('contact.sendEmail'), tone: 'ink', copy: site.contact.email },
  { no: '03', key: 'ig', icon: ig.icon, label: 'Instagram', value: ig.handle, href: ig.url, action: t('contact.openProfile'), tone: 'ink' },
  { no: '04', key: 'li', icon: li.icon, label: 'LinkedIn', value: 'Sony Christanto', href: li.url, action: t('contact.openProfile'), tone: 'ink' },
  { no: '05', key: 'fb', icon: fb.icon, label: 'Facebook', value: fb.handle, href: fb.url || '', action: t('contact.openProfile'), tone: fb.url ? 'ink' : 'muted' },
  { no: '06', key: 'tt', icon: tt.icon, label: 'TikTok', value: tt.handle, href: tt.url || '', action: t('contact.openProfile'), tone: tt.url ? 'ink' : 'muted' },
])
const cut = site.cutouts.handsClasped
</script>

<template>
  <div class="page-root">
    <section class="panel grid bg-stone md:h-[673px] md:min-h-[640px] md:grid-cols-[1.2fr_0.8fr]">
      <div class="relative z-[2] flex flex-col justify-between gap-10 px-5 py-10 md:px-12 md:py-14">
        <Breadcrumbs :items="[{ name: t('contact.title'), path: '/kontak' }]" />
        <RevealText as="h1" trigger="load" class="font-display-x m-0 text-[15vw] font-bold leading-[0.86] tracking-[-0.035em] md:text-[clamp(64px,9vw,136px)]" :lines="[{ text: t('contact.heroLine1') }, { text: t('contact.heroLine2'), indent: '12%' }]">
          <template #line-1><span class="text-signal">.</span></template>
        </RevealText>
        <div class="flex max-w-[520px] flex-col gap-5">
          <p data-reveal class="m-0 text-[18px] leading-relaxed md:text-[20px]">{{ t('contact.lead') }}</p>
          <MagneticWrap class="self-start" data-reveal>
            <a :href="`https://wa.me/${site.contact.whatsapp}`" class="btn-signal group h-14 px-7 text-[14px]">{{ t('contact.chatWa') }} <span class="arrow-nudge">↗</span></a>
          </MagneticWrap>
        </div>
      </div>
      <div class="relative min-h-[440px]">
        <LightGrid class="absolute left-[6%] top-[8%] h-[70%] w-[80%]" :rows="3" interactive />
        <img data-reveal="up" :src="cut.src" :alt="tx(cut.alt)" :width="cut.width" :height="cut.height" class="absolute -bottom-10 left-1/2 h-[440px] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_26px_34px_rgba(0,0,0,0.14)] md:h-[640px]" />
      </div>
    </section>

    <section id="kanal" class="sec flex flex-col gap-9 md:pb-[72px] md:pt-[88px]">
      <div class="flex flex-wrap items-end justify-between gap-5">
        <h2 data-reveal class="h2-display" v-html="t('contact.channels')" />
        <span data-reveal class="label text-ink-soft">WA / Email / IG / LinkedIn / FB / TikTok</span>
      </div>
      <div class="flex flex-col border-t border-ink">
        <div v-for="ch in channels" :key="ch.key" data-reveal class="group flex flex-wrap items-center gap-x-7 gap-y-3.5 border-b border-stone-deep px-3 py-7 transition-colors duration-300 hover:bg-signal-tint">
          <span class="font-display-x w-12 flex-none text-[20px] font-semibold text-ink-ghost">{{ ch.no }}</span>
          <span class="label-sm flex w-40 flex-none items-center gap-2.5 text-ink-soft">
            <img v-if="ch.icon" :src="ch.icon" alt="" width="28" height="28" class="size-7 rounded-[7px]" loading="lazy" />{{ ch.label }}
          </span>
          <span class="font-display-m flex-[1_1_360px] text-[24px] font-semibold leading-none tracking-[-0.01em] [overflow-wrap:anywhere] transition-colors group-hover:text-signal-ink md:text-[40px]">{{ ch.value }}</span>
          <button v-if="ch.copy" type="button" class="btn-line h-12 min-w-[110px] px-[18px]" @click="copy(ch.key, ch.copy)">
            <AnimatePresence mode="wait">
              <Motion :key="copyLabel(ch.key)" as="span" :initial="{ y: 8, opacity: 0 }" :animate="{ y: 0, opacity: 1 }" :exit="{ y: -8, opacity: 0 }" :transition="{ duration: 0.18 }">{{ copyLabel(ch.key) }}</Motion>
            </AnimatePresence>
          </button>
          <a
            v-if="ch.href"
            :href="ch.href"
            :target="['ig', 'li', 'fb', 'tt'].includes(ch.key) ? '_blank' : undefined"
            rel="noopener"
            class="btn h-13 min-w-[200px] justify-between max-md:w-full"
            :class="ch.tone === 'signal' ? 'bg-signal text-white hover:bg-ink' : 'bg-ink text-paper hover:bg-signal'"
          >{{ ch.action }} <span class="arrow-nudge">↗</span></a>
          <span v-else class="btn h-13 min-w-[200px] justify-between bg-stone-deep text-ink max-md:w-full" aria-disabled="true">{{ ch.action }} <span>↗</span></span>
        </div>
      </div>
    </section>

    <section v-if="site.contact.showOffice" class="panel sec grid items-center gap-12 bg-stone md:grid-cols-[0.9fr_1.1fr] md:py-14">
      <div class="flex flex-col gap-6">
        <span data-reveal class="eyebrow">{{ t('contact.office') }}</span>
        <h2 data-reveal class="h2-display">{{ office.street.split(' Blok')[0] }}<br>Blok{{ office.street.split(' Blok')[1] }}</h2>
        <p data-reveal class="m-0 text-[20px] leading-relaxed text-ink-soft">{{ office.locality }}, {{ office.city }}<br>{{ office.region }}</p>
        <MagneticWrap class="self-start" data-reveal>
          <a :href="site.contact.mapsUrl" target="_blank" rel="noopener" class="btn-ink group">{{ t('contact.openMaps') }} <span class="arrow-nudge text-signal group-hover:text-white">↗</span></a>
        </MagneticWrap>
      </div>
      <div data-reveal="scale" class="relative overflow-hidden rounded-[22px] bg-paper">
        <iframe
          :src="site.contact.mapsEmbedUrl"
          :title="t('contact.mapLabel')"
          class="block aspect-[4/3] min-h-[320px] w-full border-0 md:aspect-[560/380]"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen
        />
      </div>
    </section>
  </div>
</template>
