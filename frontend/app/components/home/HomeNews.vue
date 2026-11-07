<script setup lang="ts">
// "Kabar & Gagasan Terbaru": slash tabs (motion-v underline), one featured red
// split card + two compact rows. Data comes from the API; renders an empty
// state when there are no articles yet.
import { categories, site } from '~/data/site'
import type { PublicArticle } from '~/types/api'

const props = defineProps<{ byCategory: Record<string, PublicArticle[]> }>()
const { t, tx, lp, date } = useL()
const active = ref<string>(categories[0].key)
const list = computed(() => props.byCategory[active.value] ?? [])
const featured = computed(() => list.value[0])
const rest = computed(() => list.value.slice(1, 3))
const label = (key: string) => tx(categories.find((c) => c.key === key)?.label)
const cut = site.cutouts.glance
</script>

<template>
  <section id="kabar" class="sec flex flex-col gap-10 md:pb-[72px] md:pt-24">
    <SectionHead :title="t('home.newsTitle')">
      <div role="tablist" data-reveal class="label flex items-center gap-3.5">
        <template v-for="(c, k) in categories" :key="c.key">
          <span v-if="k > 0" aria-hidden="true" class="text-ink-soft">/</span>
          <button
            type="button"
            role="tab"
            :aria-selected="active === c.key"
            class="relative h-11 transition-colors"
            :class="active === c.key ? 'text-ink' : 'text-ink-soft hover:text-ink'"
            @click="active = c.key"
          >
            {{ tx(c.label) }}
            <Motion v-if="active === c.key" layout-id="news-tab" class="absolute inset-x-0 bottom-0 h-0.5 bg-signal" />
          </button>
        </template>
      </div>
    </SectionHead>

    <AnimatePresence mode="wait">
      <Motion v-if="featured" :key="active" as="div" class="grid gap-4 lg:grid-cols-[1.5fr_1fr]" :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :exit="{ opacity: 0, y: -12 }" :transition="{ duration: 0.4 }">
        <NuxtLink :to="lp(`/blog/${featured.slug}`)" class="group grid overflow-hidden rounded-[28px] sm:grid-cols-2" data-reveal>
          <span class="relative block min-h-[280px] overflow-hidden bg-stone-deep">
            <img v-if="featured.banner_url" :src="featured.banner_url" :alt="featured.banner_alt" class="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[var(--ease-signal)] group-hover:scale-[1.05]" loading="lazy" decoding="async" />
            <template v-else>
              <LightGrid class="absolute left-[12%] top-[6%] h-[80%] w-[70%]" :blur="16" :opacity="0.4" :gap="14" :radius="10" />
              <img :src="cut.src" :alt="tx(cut.alt)" class="absolute -bottom-[120px] left-1/2 h-[560px] max-w-none -translate-x-1/2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-[var(--ease-signal)] group-hover:-translate-y-2" loading="lazy" decoding="async" />
            </template>
          </span>
          <span class="flex flex-col justify-between gap-8 bg-signal p-8">
            <span class="label-sm text-paper">{{ label(featured.category.key) }}</span>
            <span class="font-display-x text-[30px] font-semibold leading-[0.95] text-ink md:text-[34px]">{{ featured.title }}</span>
            <span class="label-sm text-paper">{{ date(featured.published_at) }} <span class="arrow-nudge">↗</span></span>
          </span>
        </NuxtLink>
        <div class="flex flex-col">
          <NuxtLink
            v-for="(a, k) in rest"
            :key="a.slug"
            :to="lp(`/blog/${a.slug}`)"
            class="group flex flex-1 flex-col justify-center gap-3 border-t px-2 py-7 transition-colors hover:bg-signal-tint"
            :class="k === 0 ? 'border-ink' : 'border-stone-deep border-b'"
            data-reveal
          >
            <span class="label-sm self-start rounded-full bg-signal-tint px-3 py-1.5 text-signal-ink">{{ label(a.category.key) }}</span>
            <span class="font-display-x text-[22px] font-semibold leading-none group-hover:text-signal-ink md:text-[24px]">{{ a.title }} <span class="arrow-nudge text-signal">↗</span></span>
            <span class="text-[14px] text-ink-soft">{{ date(a.published_at) }} · {{ a.excerpt }}</span>
          </NuxtLink>
        </div>
      </Motion>
      <EmptyState v-else :key="`empty-${active}`" :text="t('blog.emptyText')" />
    </AnimatePresence>

    <MagneticWrap class="self-start">
      <NuxtLink :to="lp('/blog')" class="btn-line group">{{ t('home.allArticles') }} <span class="arrow-nudge text-signal group-hover:text-white">↗</span></NuxtLink>
    </MagneticWrap>
  </section>
</template>
