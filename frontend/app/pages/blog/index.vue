<script setup lang="ts">
const route = useRoute()
const { t, locale } = useL()
const page = Number(route.query.page) || 1
// Articles are Indonesian only: /en/blog keeps English chrome but is noindex
// with canonical -> /id/blog (no duplicate content).
usePageSeo({
  title: page > 1 ? t('blog.pageN', { n: page }) : t('blog.title'),
  description: t('blog.description'),
  path: page > 1 ? `/blog?page=${page}` : '/blog',
  noindex: locale.value === 'en',
  canonicalLocale: 'id',
})
const { siteUrl } = useRuntimeConfig().public
useJsonLd({ '@type': 'Blog', '@id': `${siteUrl}/id/blog#blog`, url: `${siteUrl}/id/blog`, name: 'Blog Sony Christanto', inLanguage: 'id-ID', author: { '@id': personId(siteUrl) } })
</script>

<template>
  <div class="page-root">
    <BlogMasthead :crumbs="[{ name: t('blog.title'), path: '/blog' }]" />
    <BlogListing />
  </div>
</template>
