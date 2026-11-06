<script setup lang="ts">
// Shared by /blog and /blog/kategori/[kategori].
import { categories } from '~/data/site'
import type { Envelope, PageMeta, PublicArticle } from '~/types/api'

const props = defineProps<{ category?: string }>()
const route = useRoute()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const { data, error } = await useFetch<Envelope<PublicArticle[], PageMeta>>('/api/v1/articles', {
  query: { category: props.category, page, per_page: 9 },
  key: `articles-${props.category ?? 'all'}`,
  watch: [page],
})
if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, statusMessage: 'Gagal memuat artikel', fatal: false })
}

const articles = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
const basePath = computed(() => (props.category ? `/blog/kategori/${props.category}` : '/blog'))
const pageLink = (p: number) => (p === 1 ? basePath.value : { path: basePath.value, query: { page: p } })
</script>

<template>
  <div>
    <nav aria-label="Kategori artikel" class="mb-12 flex flex-wrap gap-2">
      <NuxtLink to="/blog" class="btn border" :class="!category ? 'border-navy-900 bg-navy-900 text-white' : 'border-cream-300 hover:border-navy-900'">Semua</NuxtLink>
      <NuxtLink
        v-for="c in categories"
        :key="c.key"
        :to="`/blog/kategori/${c.key}`"
        class="btn border"
        :class="category === c.key ? 'border-navy-900 bg-navy-900 text-white' : 'border-cream-300 hover:border-navy-900'"
      >
        {{ c.label }}
      </NuxtLink>
    </nav>

    <div v-if="articles.length" class="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      <ArticleCard v-for="a in articles" :key="a.slug" :article="a" heading-level="h2" />
    </div>
    <EmptyState v-else title="Belum ada artikel" text="Artikel baru akan tampil di sini setelah diterbitkan." />

    <nav v-if="meta && meta.total_pages > 1" aria-label="Halaman" class="mt-16 flex items-center justify-center gap-2">
      <NuxtLink v-if="meta.page > 1" :to="pageLink(meta.page - 1)" rel="prev" class="btn-outline">Sebelumnya</NuxtLink>
      <span class="px-4 text-sm text-ink-600">Halaman {{ meta.page }} dari {{ meta.total_pages }}</span>
      <NuxtLink v-if="meta.page < meta.total_pages" :to="pageLink(meta.page + 1)" rel="next" class="btn-outline">Berikutnya</NuxtLink>
    </nav>
  </div>
</template>
