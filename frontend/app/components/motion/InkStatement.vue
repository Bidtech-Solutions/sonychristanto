<script setup lang="ts">
// Scroll-linked ink fill (DESIGN.md §5.5): words go from ink-ghost to ink as the
// statement scrolls through the viewport. Reduced motion: all words in ink.
const props = withDefaults(defineProps<{ lines: { text: string; indent?: string; accentLast?: boolean }[]; as?: string }>(), { as: 'p' })
const root = ref<HTMLElement>()
const words = computed(() => props.lines.map((l) => l.text.split(' ')))

useGsap(root, (gsap) => {
  const els = root.value!.querySelectorAll<HTMLElement>('[data-ink]')
  gsap.set(els, { color: '#B4B1AB' })
  gsap.to(els, {
    color: '#0B0B0B',
    stagger: 0.12,
    ease: 'none',
    scrollTrigger: { trigger: root.value!, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
  })
})
</script>

<template>
  <component :is="as" ref="root">
    <span v-for="(line, li) in lines" :key="li" class="block" :style="line.indent ? { paddingLeft: line.indent } : undefined">
      <template v-for="(w, wi) in words[li]" :key="wi">
        <span data-ink>{{ w }}</span><span v-if="wi < words[li]!.length - 1"> </span>
      </template>
      <span v-if="line.accentLast" class="text-signal">.</span>
    </span>
  </component>
</template>
