<script setup lang="ts">
// Logo "Sahabat Sony" (DESIGN.md §10a), WebP generated from
// app/assets/brand/logo-source.jpeg by `npm run brand:build`.
const props = withDefaults(defineProps<{ size?: number; alt?: string }>(), { size: 52, alt: '' })
const base = '/images/logo/logo-sony-christanto'
const src = computed(() => `${base}-${props.size > 64 ? 256 : 128}.webp`)
const srcset = `${base}-128.webp 128w, ${base}-256.webp 256w, ${base}-512.webp 512w`
</script>

<template>
  <img :src="src" :srcset="srcset" :sizes="`${size}px`" :alt="alt" :width="size" :height="size" class="block shrink-0" decoding="async" />
</template>
