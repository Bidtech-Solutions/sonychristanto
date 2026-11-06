<script setup lang="ts">
import { site } from '~/data/site'
import type { Envelope, PublicArticle } from '~/types/api'

const route = useRoute()
const slug = String(route.params.slug)
const { data, error } = await useFetch<Envelope<PublicArticle>>(`/api/v1/articles/${encodeURIComponent(slug)}`, { key: `article-${slug}` })
if (error.value || !data.value) {
  throw createError({ statusCode: error.value?.statusCode === 404 ? 404 : 500, statusMessage: 'Artikel tidak ditemukan', fatal: true })
}
const article = computed(() => data.value!.data)

const { siteUrl } = useRuntimeConfig().public
const a = article.value
usePageSeo({
  title: a.title,
  description: a.excerpt,
  path: `/blog/${a.slug}`,
  type: 'article',
  image: a.banner_url,
  imageAlt: a.banner_alt,
  publishedTime: a.published_at,
  modifiedTime: a.updated_at,
})
useJsonLd({
  '@type': a.category.key === 'agenda-sony' ? 'NewsArticle' : 'BlogPosting',
  '@id': `${siteUrl}/blog/${a.slug}#article`,
  mainEntityOfPage: `${siteUrl}/blog/${a.slug}`,
  headline: a.title,
  description: a.excerpt,
  image: a.banner_url ? [siteUrl + a.banner_url] : [siteUrl + site.ogImage],
  datePublished: a.published_at,
  dateModified: a.updated_at,
  inLanguage: 'id-ID',
  articleSection: a.category.label,
  timeRequired: `PT${a.reading_minutes}M`,
  author: { '@id': personId(siteUrl) },
  publisher: { '@id': personId(siteUrl) },
  isPartOf: { '@id': `${siteUrl}/blog#blog` },
})

// "Baca juga": other articles from the same category.
const { data: related } = await useFetch<Envelope<PublicArticle[]>>('/api/v1/articles', {
  query: { category: a.category.key, per_page: 4 },
  key: `related-${a.category.key}`,
  default: () => ({ data: [] }) as unknown as Envelope<PublicArticle[]>,
})
const relatedArticles = computed(() => (related.value?.data ?? []).filter((r) => r.slug !== a.slug).slice(0, 3))
</script>

<template>
  <article v-if="article">
    <header class="bg-navy-900 text-white">
      <div class="container-page max-w-4xl py-14 sm:py-20">
        <Breadcrumbs dark class="mb-6" :items="[{ name: 'Blog', path: '/blog' }, { name: article.category.label, path: `/blog/kategori/${article.category.key}` }, { name: article.title, path: `/blog/${article.slug}` }]" />
        <NuxtLink :to="`/blog/kategori/${article.category.key}`" class="text-[13px] font-semibold uppercase tracking-[0.14em] text-gold-500 hover:underline">
          {{ article.category.label }}
        </NuxtLink>
        <h1 class="mt-4 font-display text-4xl leading-tight font-semibold sm:text-5xl">{{ article.title }}</h1>
        <p class="mt-6 flex flex-wrap gap-x-3 text-navy-200">
          <span>{{ site.name }}</span>
          <span>· <time :datetime="article.published_at">{{ formatDate(article.published_at) }}</time></span>
          <span>· {{ article.reading_minutes }} menit baca</span>
          <span v-if="article.updated_at && formatDate(article.updated_at) !== formatDate(article.published_at)">
            · Diperbarui <time :datetime="article.updated_at">{{ formatDate(article.updated_at) }}</time>
          </span>
        </p>
      </div>
    </header>

    <figure v-if="article.banner_url" class="container-page max-w-5xl -mb-4 pt-10">
      <img :src="article.banner_url" :alt="article.banner_alt" fetchpriority="high" class="aspect-video w-full object-cover" width="1600" height="900" />
    </figure>

    <div class="container-page max-w-3xl py-14">
      <div class="prose-article">
        <BlockRenderer :blocks="article.content ?? []" />
      </div>
    </div>

    <aside v-if="relatedArticles.length" class="bg-cream-100">
      <div class="container-page py-16">
        <SectionHeading :title="`${article.category.label} lainnya`" />
        <div class="grid gap-x-8 gap-y-12 md:grid-cols-3">
          <ArticleCard v-for="r in relatedArticles" :key="r.slug" :article="r" />
        </div>
      </div>
    </aside>
  </article>
</template>
