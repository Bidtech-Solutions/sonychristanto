<script setup lang="ts">
import type { InlineNode } from '~/types/api'

defineProps<{ nodes?: InlineNode[] | Record<string, any> }>()

// Only http(s), mailto and tel links survive; anything else (javascript:, data:) is dropped.
const safeHref = (href: string) => (/^(https?:|mailto:|tel:|\/)/i.test(href) ? href : undefined)
const isExternal = (href: string) => /^https?:/i.test(href)

function classes(styles: Record<string, boolean | string>) {
  return {
    'font-semibold': !!styles.bold,
    italic: !!styles.italic,
    underline: !!styles.underline,
    'line-through': !!styles.strike,
  }
}
</script>

<template>
  <template v-if="Array.isArray(nodes)">
    <template v-for="(n, i) in nodes" :key="i">
      <template v-if="n.type === 'text'">
        <code v-if="n.styles?.code">{{ n.text }}</code>
        <span v-else-if="Object.keys(n.styles ?? {}).length" :class="classes(n.styles)">{{ n.text }}</span>
        <template v-else>{{ n.text }}</template>
      </template>
      <a
        v-else-if="n.type === 'link'"
        :href="safeHref(n.href)"
        :target="isExternal(n.href) ? '_blank' : undefined"
        :rel="isExternal(n.href) ? 'noopener' : undefined"
      >
        <InlineContent :nodes="n.content" />
      </a>
    </template>
  </template>
</template>
