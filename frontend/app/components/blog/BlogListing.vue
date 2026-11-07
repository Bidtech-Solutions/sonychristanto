<script setup lang="ts">
// Shared by /blog and /blog/kategori/[kategori] (Blog.dc.html):
// category pills, "Sorotan" lead story, 2-col grid, sticky dark index + red CTA,
// pagination.
import { categories, site } from '~/data/site'
import type { Envelope, PageMeta, PublicArticle } from '~/types/api'

const props = defineProps<{ category?: string }>()
const route = useRoute()
const { t, tx, lp, date } = useL()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const { data, error } = await useFetch<Envelope<PublicArticle[], PageMeta>>('/api/v1/articles', {
  query: { category: props.category, page, per_page: 9 },
  key: `articles-${props.category ?? 'all'}`,
  watch: [page],
})
if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, statusMessage: t('blog.loadError'), fatal: false })
}

const articles = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const lead = computed(() => (page.value === 1 ? articles.value[0] : undefined))
const rest = computed(() => (page.value === 1 ? articles.value.slice(1) : articles.value))
const basePath = computed(() => lp(props.category ? `/blog/kategori/${props.category}` : '/blog'))
const pageLink = (p: number) => (p === 1 ? basePath.value : { path: basePath.value, query: { page: p } })
const catLabel = (key: string) => tx(categories.find((c) => c.key === key)?.label)
const filterLabel = computed(() => (props.category ? catLabel(props.category) : t('blog.allCategories')))
const from = computed(() => (meta.value ? (meta.value.page - 1) * meta.value.per_page + 1 : 1))
const to = computed(() => (meta.value ? from.value + articles.value.length - 1 : articles.value.length))
const cut = site.cutouts.writing
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <!-- Category pills -->
    <nav :aria-label="t('blog.categories')" class="sec flex flex-wrap gap-2 !pb-0 !pt-10" data-reveal>
      <NuxtLink :to="lp('/blog')" class="relative inline-flex h-11 items-center rounded-full border-[1.5px] border-ink px-5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors" :class="!category ? 'bg-ink text-paper' : 'hover:bg-stone'">{{ t('blog.all') }}</NuxtLink>
      <NuxtLink
        v-for="c in categories"
        :key="c.key"
        :to="lp(`/blog/kategori/${c.key}`)"
        class="inline-flex h-11 items-center rounded-full border-[1.5px] border-ink px-5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors"
        :class="category === c.key ? 'bg-ink text-paper' : 'hover:bg-stone'"
      >{{ tx(c.label) }}</NuxtLink>
    </nav>

    <!-- Sorotan -->
    <section v-if="lead" class="sec flex flex-col gap-5 !pb-6 !pt-10">
      <span data-reveal class="label-sm text-signal-ink">{{ t('blog.highlight') }} · {{ filterLabel }}</span>
      <NuxtLink :to="lp(`/blog/${lead.slug}`)" class="group grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]" data-reveal>
        <span class="relative block aspect-[4/3] overflow-hidden rounded-[24px]" :class="lead.banner_url ? 'bg-stone-deep' : 'bg-signal'">
          <img v-if="lead.banner_url" :src="lead.banner_url" :alt="lead.banner_alt" class="size-full object-cover transition-transform duration-700 ease-[var(--ease-signal)] group-hover:scale-[1.04]" fetchpriority="high" width="1200" height="900" />
          <template v-else>
            <LightGrid class="absolute left-[14%] top-[8%] h-[70%] w-[72%]" :blur="18" :opacity="0.5" />
            <img :src="cut.src" alt="" class="absolute bottom-0 left-1/2 h-[105%] w-auto max-w-none -translate-x-1/2" />
          </template>
        </span>
        <span class="flex flex-col gap-5">
          <span class="label-sm flex items-center gap-2.5">
            <span class="rounded-full px-3 py-1.5 text-white" :class="lead.category.key === 'agenda-sony' ? 'bg-ink' : 'bg-signal'">{{ catLabel(lead.category.key) }}</span>
            <span class="text-ink-soft">{{ date(lead.published_at) }} · {{ t('common.minutesRead', { n: lead.reading_minutes }) }}</span>
          </span>
          <h2 class="font-display-m m-0 text-[34px] font-bold uppercase leading-[0.92] tracking-[-0.02em] transition-colors group-hover:text-signal-ink md:text-[54px]">{{ lead.title }}</h2>
          <span class="font-serif text-[20px] leading-normal text-ink-body md:text-[22px]">{{ lead.excerpt }}</span>
          <span class="flex items-center justify-between gap-4 border-t border-stone-deep pt-4">
            <span class="flex items-center gap-2.5"><BrandMark :size="36" /><span class="text-[14px] font-semibold">{{ site.name }}</span></span>
            <span class="label-sm">{{ t('blog.readArticle') }} <span class="arrow-nudge text-signal">↗</span></span>
          </span>
        </span>
      </NuxtLink>
    </section>

    <!-- Grid + aside -->
    <section class="sec grid items-start gap-10 !pt-6 lg:grid-cols-[2fr_1fr]">
      <div class="flex flex-col gap-5">
        <div class="flex items-baseline justify-between border-b-2 border-ink pb-3">
          <span class="font-display-x text-[28px] font-bold">{{ t('blog.latest') }}</span>
          <span class="label-sm text-ink-soft">{{ t('blog.perPage') }}</span>
        </div>
        <div v-if="rest.length" class="grid gap-x-6 gap-y-8 sm:grid-cols-2">
          <ArticleCard v-for="a in rest" :key="a.slug" :article="a" heading-level="h3" />
        </div>
        <EmptyState v-else-if="!lead" :title="t('blog.emptyTitle')" :text="t('blog.emptyText')" />
        <nav v-if="meta && meta.total > 0" :aria-label="t('common.page', { page: meta.page, total: meta.total_pages })" class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-deep pt-5">
          <span class="text-[13px] text-ink-soft">{{ t('common.showing', { from, to, total: meta.total }) }}</span>
          <span class="flex gap-2">
            <NuxtLink v-if="meta.page > 1" :to="pageLink(meta.page - 1)" rel="prev" class="btn-line h-11">← {{ t('common.prev') }}</NuxtLink>
            <span v-for="p in meta.total_pages" :key="p">
              <NuxtLink :to="pageLink(p)" :aria-current="p === meta.page ? 'page' : undefined" class="inline-flex size-11 items-center justify-center rounded-full font-semibold" :class="p === meta.page ? 'bg-ink text-paper' : 'border-[1.5px] border-ink hover:bg-stone'">{{ p }}</NuxtLink>
            </span>
            <NuxtLink v-if="meta.page < meta.total_pages" :to="pageLink(meta.page + 1)" rel="next" class="btn-line h-11">{{ t('common.next') }} →</NuxtLink>
          </span>
        </nav>
      </div>
      <aside class="flex flex-col gap-4 lg:sticky lg:top-20">
        <div v-if="articles.length" class="flex flex-col gap-1 rounded-[22px] bg-ink p-6 text-paper" data-reveal>
          <span class="font-display-x mb-3 text-[22px] font-bold">{{ t('blog.index') }}</span>
          <NuxtLink v-for="(a, k) in articles" :key="a.slug" :to="lp(`/blog/${a.slug}`)" class="grid grid-cols-[32px_minmax(0,1fr)] gap-2.5 rounded-lg border-t border-[#2A2927] px-2 py-3 transition-colors hover:bg-signal-tint hover:text-ink">
            <span class="font-display-x text-[14px] font-bold" :class="a.category.key === 'agenda-sony' ? 'text-ink-ghost' : 'text-signal'">{{ String(from + k).padStart(2, '0') }}</span>
            <span class="flex flex-col gap-1"><span class="text-[14px] font-semibold leading-snug">{{ a.title }}</span><span class="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8F8C87]">{{ catLabel(a.category.key) }}</span></span>
          </NuxtLink>
        </div>
        <NuxtLink :to="lp('/kontak')" class="group flex flex-col gap-2.5 rounded-[22px] bg-signal p-6 text-white transition-transform duration-500 ease-[var(--ease-signal)] hover:-translate-y-1" data-reveal>
          <span class="font-display-x text-[24px] font-bold leading-[0.95]">{{ t('blog.aspiration') }}</span>
          <span class="label-sm">{{ t('blog.contactOffice') }} <span class="arrow-nudge">↗</span></span>
        </NuxtLink>
      </aside>
    </section>
  </div>
</template>
