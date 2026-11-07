<script setup lang="ts">
// Grid card (Blog.dc.html "Terbaru"): 16:10 image (zooms on hover), category /
// reading time, title + ↗, serif excerpt. Agenda posts get a date tag.
import { categories, site } from '~/data/site'
import type { PublicArticle } from '~/types/api'

const props = defineProps<{ article: PublicArticle; headingLevel?: 'h2' | 'h3' }>()
const { t, tx, lp, locale } = useL()
const isAgenda = computed(() => props.article.category.key === 'agenda-sony')
const label = computed(() => tx(categories.find((c) => c.key === props.article.category.key)?.label) || props.article.category.label)
const d = computed(() => new Date(props.article.published_at))
const day = computed(() => d.value.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'id-ID', { day: '2-digit', timeZone: 'Asia/Jakarta' }))
const mon = computed(() => d.value.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'id-ID', { month: 'short', timeZone: 'Asia/Jakarta' }))
const cut = site.cutouts.writing
</script>

<template>
  <NuxtLink :to="lp(`/blog/${article.slug}`)" class="group flex flex-col gap-3.5" data-reveal>
    <span class="relative block aspect-[16/10] overflow-hidden rounded-[18px]" :class="article.banner_url ? 'bg-stone-deep' : isAgenda ? 'bg-stone' : 'bg-signal'">
      <img v-if="article.banner_url" :src="article.banner_url" :alt="article.banner_alt" loading="lazy" decoding="async" width="800" height="500" class="size-full object-cover transition-transform duration-500 ease-[var(--ease-signal)] group-hover:scale-[1.04]" />
      <img v-else :src="cut.src" alt="" loading="lazy" decoding="async" class="absolute bottom-0 left-1/2 h-[118%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom transition-transform duration-500 ease-[var(--ease-signal)] group-hover:scale-[1.04]" />
      <span v-if="isAgenda" class="absolute bottom-3.5 left-3.5 flex flex-col items-center rounded-xl bg-ink px-3 py-2.5 leading-none text-paper">
        <span class="font-display-x text-[26px] font-bold">{{ day }}</span>
        <span class="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em]">{{ mon }}</span>
      </span>
    </span>
    <span class="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.1em]">
      <span :class="isAgenda ? 'text-ink' : 'text-signal-ink'">{{ label }}</span>
      <span class="text-ink-ghost">/</span>
      <span class="text-ink-soft">{{ t('common.minutesRead', { n: article.reading_minutes }) }}</span>
    </span>
    <component :is="headingLevel ?? 'h3'" class="font-display-m m-0 text-[22px] font-bold uppercase leading-[0.98] tracking-[-0.01em] transition-colors group-hover:text-signal-ink md:text-[26px]">
      {{ article.title }} <span class="arrow-nudge text-signal">↗</span>
    </component>
    <span class="line-clamp-3 font-serif text-[17px] leading-normal text-ink-soft">{{ article.excerpt }}</span>
  </NuxtLink>
</template>
