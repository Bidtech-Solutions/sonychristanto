<script setup lang="ts">
import type { AdminArticle } from '~/types/api'

defineProps<{ article: Pick<AdminArticle, 'status' | 'has_unpublished_changes'> }>()
const label = { draft: 'Draft', published: 'Terbit', inactive: 'Nonaktif' }
const color = { draft: 'bg-cream-300 text-navy-900', published: 'bg-green-100 text-green-900', inactive: 'bg-red-100 text-red-900' }
</script>

<template>
  <span class="inline-flex flex-wrap items-center gap-1.5 text-xs font-semibold">
    <span class="px-2 py-1" :class="color[article.status]">{{ label[article.status] }}</span>
    <span v-if="article.has_unpublished_changes" class="bg-gold-500/30 px-2 py-1 text-gold-700">Ada perubahan belum terbit</span>
  </span>
</template>
