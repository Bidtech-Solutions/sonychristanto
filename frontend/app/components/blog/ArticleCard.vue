<script setup lang="ts">
import type { PublicArticle } from '~/types/api'

defineProps<{ article: PublicArticle; headingLevel?: 'h2' | 'h3' }>()
</script>

<template>
  <article class="group flex flex-col">
    <NuxtLink :to="`/blog/${article.slug}`" class="block overflow-hidden bg-cream-100" tabindex="-1" aria-hidden="true">
      <img
        v-if="article.banner_url"
        :src="article.banner_url"
        :alt="article.banner_alt"
        loading="lazy"
        decoding="async"
        width="640"
        height="360"
        class="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div v-else class="flex aspect-video items-center justify-center font-display text-3xl text-navy-200">{{ article.category.label }}</div>
    </NuxtLink>
    <div class="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-ink-600">
      <NuxtLink :to="`/blog/kategori/${article.category.key}`" class="font-semibold text-gold-700 hover:underline">{{ article.category.label }}</NuxtLink>
      <time :datetime="article.published_at">{{ formatDate(article.published_at) }}</time>
      <span>· {{ article.reading_minutes }} menit baca</span>
    </div>
    <component :is="headingLevel ?? 'h3'" class="mt-2 font-display text-2xl leading-snug font-semibold">
      <NuxtLink :to="`/blog/${article.slug}`" class="hover:underline">{{ article.title }}</NuxtLink>
    </component>
    <p class="mt-2 line-clamp-3 text-ink-600">{{ article.excerpt }}</p>
  </article>
</template>
