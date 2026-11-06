<script setup lang="ts">
import { categories } from '~/data/site'

const route = useRoute()
const category = categories.find((c) => c.key === route.params.kategori)
if (!category) throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan', fatal: true })

usePageSeo({ title: category.label, description: category.description, path: `/blog/kategori/${category.key}` })
</script>

<template>
  <div v-if="category">
    <PageHero
      eyebrow="Kategori"
      :title="category.label"
      :lead="category.description"
      :crumbs="[{ name: 'Blog', path: '/blog' }, { name: category.label, path: `/blog/kategori/${category.key}` }]"
    />
    <section class="container-page py-16">
      <BlogListing :category="category.key" />
    </section>
  </div>
</template>
