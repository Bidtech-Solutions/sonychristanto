<script setup lang="ts">
// Display headline whose words rise out of a mask (GSAP, plugins/motion.client.ts).
// `lines` keeps the staggered "left / pushed right" rhythm of DESIGN.md §5.5.
// Screen readers get the plain text via aria-label; the split spans are hidden.
export interface RevealLine {
  text: string
  indent?: string // e.g. '8%'
  class?: string
}
const props = withDefaults(defineProps<{ lines: (RevealLine | string)[]; as?: string; trigger?: 'load' | 'scroll'; delay?: number }>(), { as: 'h2', trigger: 'scroll', delay: 0 })
const norm = computed(() => props.lines.map((l) => (typeof l === 'string' ? { text: l } : l)))
const label = computed(() => norm.value.map((l) => l.text).join(' '))
</script>

<template>
  <component :is="as" :aria-label="label" :data-split="trigger" :data-reveal-delay="delay || undefined">
    <span v-for="(line, li) in norm" :key="li" aria-hidden="true" class="block" :class="line.class" :style="line.indent ? { paddingLeft: line.indent } : undefined">
      <template v-for="(w, wi) in line.text.split(' ')" :key="wi">
        <span class="split-word"><span>{{ w }}</span></span>{{ wi < line.text.split(' ').length - 1 ? ' ' : '' }}
      </template>
      <slot :name="`line-${li}`" />
    </span>
  </component>
</template>
