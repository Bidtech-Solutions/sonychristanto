<script setup lang="ts">
// Blog masthead (Blog.dc.html): "KABAR & GAGASAN." + serif lead + cutout over light grid.
import { site } from '~/data/site'

const props = defineProps<{ title?: string; lead?: string; crumbs?: { name: string; path: string }[] }>()
const { t } = useL()
const cut = site.cutouts.writing
const lines = computed(() => (props.title ? [{ text: props.title }] : [{ text: t('blog.heroLine1') }, { text: `${t('blog.heroAmp')} ${t('blog.heroLine2')}` }]))
const lastSlot = computed(() => `line-${lines.value.length - 1}`)
</script>

<template>
  <section class="panel flex flex-col gap-7 bg-stone px-5 pb-12 pt-10 md:h-[689px] md:px-12">
    <div aria-hidden="true" class="absolute bottom-0 right-0 hidden h-full w-[46%] md:block">
      <LightGrid class="absolute left-[10%] top-[10%] h-[70%] w-[78%]" interactive />
      <img data-reveal="up" :src="cut.src" alt="" class="absolute -bottom-10 left-1/2 z-10 h-[660px] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_26px_34px_rgba(0,0,0,0.14)]" />
    </div>
    <Breadcrumbs v-if="crumbs?.length" :items="crumbs" class="relative z-10" />
    <RevealText as="h1" trigger="load" :lines="lines" class="font-display-x relative z-10 m-0 text-[17vw] font-bold leading-[0.82] tracking-[-0.045em] md:mt-auto md:text-[clamp(64px,11.5vw,172px)]">
      <template #[lastSlot]><span class="text-signal">.</span></template>
    </RevealText>
    <p data-reveal class="relative z-10 m-0 max-w-[480px] font-serif text-[21px] leading-[1.45] text-ink-body md:text-[23px]">{{ lead || t('blog.lead') }}</p>
    <p v-if="t('blog.languageNote')" data-reveal class="label-sm relative z-10 m-0 text-signal-ink">{{ t('blog.languageNote') }}</p>
  </section>
</template>
