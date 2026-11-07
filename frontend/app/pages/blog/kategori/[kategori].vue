<script setup lang="ts">
import { categories } from '~/data/site'

const route = useRoute()
const { t, tx, locale } = useL()
const category = categories.find((c) => c.key === route.params.kategori)
if (!category) throw createError({ statusCode: 404, statusMessage: t('error.notFound'), fatal: true })

usePageSeo({ title: tx(category.label), description: tx(category.description), path: `/blog/kategori/${category.key}`, noindex: locale.value === 'en', canonicalLocale: 'id' })
</script>

<template>
  <div v-if="category" class="page-root">
    <BlogMasthead :title="tx(category.label)" :lead="tx(category.description)" :crumbs="[{ name: t('blog.title'), path: '/blog' }, { name: tx(category.label), path: `/blog/kategori/${category.key}` }]" />
    <BlogListing :category="category.key" />
  </div>
</template>
