<script setup lang="ts">
// Icon + two-line wordmark. nav = 52px icon / 15px wordmark; footer = 88px / 34px + tagline.
import { site } from '~/data/site'

const props = withDefaults(defineProps<{ size?: 'nav' | 'footer'; tone?: 'ink' | 'paper' }>(), { size: 'nav', tone: 'ink' })
const { t, lp } = useL()
const footer = computed(() => props.size === 'footer')
</script>

<template>
  <NuxtLink :to="lp('/')" :aria-label="t('nav.homeAria')" class="group flex items-center" :class="footer ? 'gap-[18px]' : 'gap-3'">
    <span class="block transition-transform duration-500 ease-[var(--ease-signal)] group-hover:rotate-[-8deg] group-hover:scale-105">
      <BrandMark :size="footer ? 88 : 52" />
    </span>
    <span class="flex flex-col" :class="footer ? 'gap-2' : ''">
      <span
        class="font-display-x font-bold leading-[0.88]"
        :class="[footer ? 'text-[26px] md:text-[34px]' : 'text-[15px]', tone === 'paper' ? 'text-paper' : 'text-ink']"
      >Sony<br>Christanto</span>
      <span v-if="footer" class="text-[11px] font-semibold uppercase tracking-[0.22em] text-signal-ink">{{ site.tagline }}</span>
    </span>
  </NuxtLink>
</template>
