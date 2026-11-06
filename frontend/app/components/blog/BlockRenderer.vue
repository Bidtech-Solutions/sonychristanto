<script setup lang="ts">
// Renders the BlockNote JSON stored by the backend as semantic HTML, on the
// server (SSR/ISR) and without shipping BlockNote/React to visitors.
// Supported blocks must match backend/internal/content (AllowedBlocks) and
// the editor schema in app/editor/blocknote.ts.
import type { Block } from '~/types/api'

const props = defineProps<{ blocks: Block[] }>()

// Group consecutive list items into one <ul>/<ol>.
type Group = { kind: 'ul' | 'ol' | 'check'; items: Block[] } | { kind: 'block'; block: Block }
const groups = computed<Group[]>(() => {
  const out: Group[] = []
  for (const b of props.blocks ?? []) {
    const kind = b.type === 'bulletListItem' ? 'ul' : b.type === 'numberedListItem' ? 'ol' : b.type === 'checkListItem' ? 'check' : null
    const last = out[out.length - 1]
    if (kind && last && last.kind === kind) last.items.push(b)
    else if (kind) out.push({ kind, items: [b] })
    else out.push({ kind: 'block', block: b })
  }
  return out
})

// The article title is the page <h1>, so editor H1 renders as <h2>, and so on.
const headingTag = (level: number) => `h${Math.min(6, Math.max(2, Number(level || 1) + 1))}`
const align = (b: Block) => {
  const a = b.props?.textAlignment
  return a && a !== 'left' ? { textAlign: a } : undefined
}
const imageWidth = (b: Block) => (b.props?.previewWidth ? Math.round(Number(b.props.previewWidth)) : undefined)
</script>

<template>
  <template v-for="(g, gi) in groups" :key="gi">
    <ul v-if="g.kind === 'ul'">
      <li v-for="it in g.items" :key="it.id"><InlineContent :nodes="it.content" /><BlockRenderer v-if="it.children?.length" :blocks="it.children" /></li>
    </ul>
    <ol v-else-if="g.kind === 'ol'">
      <li v-for="it in g.items" :key="it.id"><InlineContent :nodes="it.content" /><BlockRenderer v-if="it.children?.length" :blocks="it.children" /></li>
    </ol>
    <ul v-else-if="g.kind === 'check'" class="!list-none !pl-0">
      <li v-for="it in g.items" :key="it.id" class="flex gap-2">
        <span aria-hidden="true">{{ it.props?.checked ? '☑' : '☐' }}</span>
        <span><span class="sr-only">{{ it.props?.checked ? 'Selesai: ' : 'Belum: ' }}</span><InlineContent :nodes="it.content" /></span>
      </li>
    </ul>

    <template v-else-if="g.kind === 'block'">
      <p v-if="g.block.type === 'paragraph'" :style="align(g.block)"><InlineContent :nodes="g.block.content" /></p>

      <component :is="headingTag(g.block.props?.level)" v-else-if="g.block.type === 'heading'" :id="`h-${g.block.id}`" :style="align(g.block)">
        <InlineContent :nodes="g.block.content" />
      </component>

      <blockquote v-else-if="g.block.type === 'quote'"><InlineContent :nodes="g.block.content" /></blockquote>

      <hr v-else-if="g.block.type === 'divider'" class="border-cream-300" />

      <figure v-else-if="g.block.type === 'image' && g.block.props?.url" class="my-8">
        <img
          :src="g.block.props.url"
          :alt="g.block.props.caption || g.block.props.name || ''"
          :width="imageWidth(g.block)"
          loading="lazy"
          decoding="async"
          class="mx-auto h-auto max-w-full"
        />
        <figcaption v-if="g.block.props.caption" class="mt-2 text-center text-sm text-ink-600">{{ g.block.props.caption }}</figcaption>
      </figure>

      <div v-else-if="g.block.type === 'columnList'" class="grid gap-8 md:grid-cols-2">
        <div v-for="col in g.block.children" :key="col.id" class="prose-article">
          <BlockRenderer :blocks="col.children" />
        </div>
      </div>
      <!-- Unknown block types are skipped on purpose. -->
    </template>
  </template>
</template>
