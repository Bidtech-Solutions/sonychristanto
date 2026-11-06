<script setup lang="ts">
const route = useRoute()
const page = Number(route.query.page) || 1
usePageSeo({
  title: page > 1 ? `Blog — halaman ${page}` : 'Blog',
  description: 'Tulisan Sony Christanto: Perspektif Sony (pandangan atas isu) dan Agenda Sony (catatan kegiatan).',
  path: page > 1 ? `/blog?page=${page}` : '/blog',
})
const { siteUrl } = useRuntimeConfig().public
useJsonLd({ '@type': 'Blog', '@id': `${siteUrl}/blog#blog`, url: `${siteUrl}/blog`, name: 'Blog Sony Christanto', inLanguage: 'id-ID', author: { '@id': personId(siteUrl) } })
</script>

<template>
  <div>
    <PageHero eyebrow="Tulisan" title="Blog" lead="Pandangan dan catatan kegiatan Sony Christanto." :crumbs="[{ name: 'Blog', path: '/blog' }]" />
    <section class="container-page py-16">
      <BlogListing />
    </section>
  </div>
</template>
