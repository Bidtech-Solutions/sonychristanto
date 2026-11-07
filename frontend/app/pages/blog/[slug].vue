<script setup lang="ts">
// Article (Artikel.dc.html): progress bar, centered header, 21:9 banner,
// 3-column body (table of contents / prose / category), "Baca juga".
// Articles are written in Indonesian; the /en URL keeps English chrome but is
// noindex with canonical -> /id (see nuxt.config sitemap.exclude).
import { categories, site } from '~/data/site'
import type { Block, Envelope, PublicArticle } from '~/types/api'

const route = useRoute()
const { t, tx, lp, date, locale } = useL()
const slug = String(route.params.slug)
const { data, error } = await useFetch<Envelope<PublicArticle>>(`/api/v1/articles/${encodeURIComponent(slug)}`, { key: `article-${slug}` })
if (error.value || !data.value) {
  throw createError({ statusCode: error.value?.statusCode === 404 ? 404 : 500, statusMessage: t('blog.notFound'), fatal: true })
}
const article = computed(() => data.value!.data)
const a = article.value
const category = categories.find((c) => c.key === a.category.key)
const catLabel = tx(category?.label) || a.category.label

const { siteUrl } = useRuntimeConfig().public
const canonical = `${siteUrl}/id/blog/${a.slug}`
usePageSeo({
  title: a.title,
  description: a.excerpt,
  path: `/blog/${a.slug}`,
  type: 'article',
  image: a.banner_url,
  imageAlt: a.banner_alt,
  publishedTime: a.published_at,
  modifiedTime: a.updated_at,
  noindex: locale.value === 'en',
  canonicalLocale: 'id',
})
useJsonLd({
  '@type': a.category.key === 'agenda-sony' ? 'NewsArticle' : 'BlogPosting',
  '@id': `${canonical}#article`,
  mainEntityOfPage: canonical,
  headline: a.title,
  description: a.excerpt,
  image: a.banner_url ? [absoluteUrl(a.banner_url)] : [absoluteUrl(site.ogImage)],
  datePublished: a.published_at,
  dateModified: a.updated_at,
  inLanguage: 'id-ID',
  articleSection: a.category.label,
  timeRequired: `PT${a.reading_minutes}M`,
  author: { '@id': personId(siteUrl) },
  publisher: { '@id': personId(siteUrl) },
  isPartOf: { '@id': `${siteUrl}/id/blog#blog` },
})

// Table of contents from top-level headings (editor H1/H2 -> page h2/h3).
const toc = computed(() =>
  (a.content ?? [])
    .filter((b: Block) => b.type === 'heading' && Number(b.props?.level ?? 1) <= 2)
    .map((b: Block) => ({ id: `h-${b.id}`, text: (Array.isArray(b.content) ? b.content : []).map((n) => ('text' in n ? n.text : '')).join('') })),
)
const activeId = ref(toc.value[0]?.id)
const body = ref<HTMLElement>()
onMounted(() => {
  if (!toc.value.length) return
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && (activeId.value = e.target.id)), { rootMargin: '-20% 0px -70% 0px' })
  toc.value.forEach((h) => {
    const el = document.getElementById(h.id)
    if (el) io.observe(el)
  })
  onBeforeUnmount(() => io.disconnect())
})

// Share
const shareUrl = canonical
const copied = ref<'' | 'ok' | 'fail'>('')
async function copy() {
  try {
    await navigator.clipboard.writeText(shareUrl)
    copied.value = 'ok'
  } catch {
    copied.value = 'fail'
  }
  setTimeout(() => (copied.value = ''), 2400)
}

// "Baca juga": other articles from the same category.
const { data: related } = await useFetch<Envelope<PublicArticle[]>>('/api/v1/articles', {
  query: { category: a.category.key, per_page: 4 },
  key: `related-${a.category.key}`,
  default: () => ({ data: [] }) as unknown as Envelope<PublicArticle[]>,
})
const relatedArticles = computed(() => (related.value?.data ?? []).filter((r) => r.slug !== a.slug).slice(0, 3))
</script>

<template>
  <div v-if="article" class="page-root">
    <ReadingProgress :target="body" />

    <header class="sec flex flex-col items-center gap-6 text-center md:pb-10 md:pt-16">
      <Breadcrumbs :items="[{ name: t('blog.title'), path: '/blog' }, { name: catLabel, path: `/blog/kategori/${a.category.key}` }, { name: article.title, path: `/blog/${a.slug}` }]" />
      <NuxtLink :to="lp(`/blog/kategori/${a.category.key}`)" class="label-sm rounded-full px-3 py-1.5 text-white" :class="a.category.key === 'agenda-sony' ? 'bg-ink' : 'bg-signal'" data-reveal>{{ catLabel }}</NuxtLink>
      <RevealText as="h1" trigger="load" :lines="[article.title]" class="font-display-m m-0 max-w-[1100px] text-[40px] font-bold uppercase leading-[0.9] tracking-[-0.03em] md:text-[clamp(44px,6vw,88px)]" />
      <p v-if="article.excerpt" data-reveal class="m-0 max-w-[760px] font-serif text-[22px] italic leading-[1.4] text-ink-body md:text-[26px]">{{ article.excerpt }}</p>
      <div data-reveal class="flex w-full max-w-[900px] flex-wrap items-center justify-center gap-x-7 gap-y-3.5 border-t border-stone-deep pt-5">
        <span class="flex items-center gap-3 text-left">
          <BrandMark :size="48" />
          <span class="flex flex-col gap-0.5"><span class="text-[15px] font-semibold">{{ site.name }}</span><span class="text-[13px] text-ink-soft">{{ tx(site.jobTitle) }}</span></span>
        </span>
        <span class="label-sm text-ink-soft">
          <time :datetime="article.published_at">{{ date(article.published_at) }}</time> · {{ t('common.minutesRead', { n: article.reading_minutes }) }}
          <template v-if="article.updated_at && date(article.updated_at) !== date(article.published_at)"> · {{ t('common.updated') }} <time :datetime="article.updated_at">{{ date(article.updated_at) }}</time></template>
        </span>
        <span class="flex gap-2">
          <a :href="`https://wa.me/?text=${encodeURIComponent(`${article.title} ${shareUrl}`)}`" target="_blank" rel="noopener" :aria-label="t('blog.shareWa')" class="btn h-11 bg-ink px-4 text-paper hover:bg-signal">WA</a>
          <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`" target="_blank" rel="noopener" :aria-label="t('blog.shareFb')" class="btn-line h-11 px-4">FB</a>
          <button type="button" class="btn-line h-11 min-w-[132px] px-4" @click="copy">
            <AnimatePresence mode="wait">
              <Motion :key="copied" as="span" :initial="{ y: 10, opacity: 0 }" :animate="{ y: 0, opacity: 1 }" :exit="{ y: -10, opacity: 0 }" :transition="{ duration: 0.2 }">
                {{ copied === 'ok' ? t('common.copied') : copied === 'fail' ? t('common.copyManual') : t('common.copyLink') }}
              </Motion>
            </AnimatePresence>
          </button>
        </span>
      </div>
    </header>

    <figure v-if="article.banner_url" class="m-0 flex w-full max-w-[1408px] flex-col gap-3" data-reveal="scale">
      <div class="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-stone-deep md:aspect-[21/9] md:rounded-[28px]">
        <img data-parallax="10" :src="article.banner_url" :alt="article.banner_alt" fetchpriority="high" class="absolute inset-x-0 -top-[6%] h-[112%] w-full object-cover" width="1920" height="1080" />
      </div>
      <figcaption v-if="article.banner_alt" class="px-6 text-[13px] text-ink-soft">{{ article.banner_alt }}</figcaption>
    </figure>

    <section class="sec grid items-start justify-center gap-14 md:pb-[72px] md:pt-14 lg:grid-cols-[220px_minmax(0,720px)_minmax(0,1fr)]">
      <aside class="sticky top-10 hidden flex-col gap-3.5 lg:flex">
        <template v-if="toc.length">
          <span class="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{{ t('blog.toc') }}</span>
          <a v-for="h in toc" :key="h.id" :href="`#${h.id}`" class="border-l-2 pl-3 text-[14px] leading-snug transition-colors duration-300" :class="activeId === h.id ? 'border-signal font-semibold text-ink' : 'border-stone-deep text-ink-soft hover:text-ink'">{{ h.text }}</a>
        </template>
      </aside>
      <article ref="body" :lang="'id'" class="prose-article">
        <BlockRenderer :blocks="article.content ?? []" />
        <p aria-hidden="true" class="!mt-10 text-center font-display text-[20px] font-bold tracking-[0.6em] text-signal">■ ■ ■</p>
      </article>
      <aside class="hidden flex-col gap-6 pt-2 lg:flex">
        <div class="flex flex-col gap-1.5 border-t-2 border-ink pt-3.5">
          <span class="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{{ t('blog.category') }}</span>
          <NuxtLink :to="lp(`/blog/kategori/${a.category.key}`)" class="font-display-m text-[18px] font-bold uppercase text-signal-ink hover:underline">{{ catLabel }}</NuxtLink>
          <span class="text-[13px] leading-normal text-ink-soft">{{ tx(category?.description) }}</span>
        </div>
      </aside>
    </section>

    <section v-if="relatedArticles.length" class="sec flex flex-col gap-6">
      <div class="flex items-baseline justify-between border-b-2 border-ink pb-3">
        <h2 class="font-display-x m-0 text-[28px] font-bold">{{ t('blog.alsoRead') }}</h2>
        <NuxtLink :to="lp('/blog')" class="label-sm group hover:text-signal-ink">{{ t('blog.allPosts') }} <span class="arrow-nudge text-signal">↗</span></NuxtLink>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <ArticleCard v-for="r in relatedArticles" :key="r.slug" :article="r" />
      </div>
    </section>
  </div>
</template>
