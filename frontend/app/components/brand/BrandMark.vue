<script setup lang="ts">
// Logo icon (DESIGN.md §10a), served as cached SVG files generated from
// app/assets/brand/logo-paths.ts by `npm run brand:build`.
import type { LogoVariant } from '~/assets/brand/logo-paths'

const props = withDefaults(defineProps<{ size?: number; variant?: LogoVariant; alt?: string }>(), { size: 52, variant: 'red', alt: '' })
const src = computed(() => `/images/logo/logo-sony-christanto${props.variant === 'red' ? '' : `-${props.variant}`}.svg`)
</script>

<template>
  <img :src="src" :alt="alt" :width="size" :height="size" class="block shrink-0" decoding="async" />
</template>
