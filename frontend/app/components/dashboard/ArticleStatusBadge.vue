<script setup lang="ts">
import type { AdminArticle } from '~/types/api'

defineProps<{ article: Pick<AdminArticle, 'status' | 'has_unpublished_changes'> }>()
const label = { draft: 'Draft', published: 'Terbit', inactive: 'Nonaktif' }
// Pill badges (dashboard restyle): green = live, stone = draft, signal tint = inactive.
const color = { draft: 'bg-stone text-ink', published: 'bg-[#E3F2E7] text-[#1D6B38]', inactive: 'bg-signal-tint text-signal-ink' }
</script>

<template>
  <span class="inline-flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]">
    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" :class="color[article.status]">
      <span aria-hidden="true" class="size-1.5 rounded-full bg-current" />{{ label[article.status] }}
    </span>
    <span v-if="article.has_unpublished_changes" class="rounded-full bg-[#FFF1D6] px-2.5 py-1 text-[#8A5A00]">Ada perubahan belum terbit</span>
  </span>
</template>
