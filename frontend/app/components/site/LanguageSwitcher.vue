<script setup lang="ts">
// ID / EN toggle. The active pill slides between options (motion-v layout animation).
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
withDefaults(defineProps<{ tone?: 'ink' | 'paper' }>(), { tone: 'ink' })
const items = computed(() => locales.value.map((l) => ({ code: l.code, name: l.name ?? l.code, to: switchLocalePath(l.code) })))
const layoutId = useId()
</script>

<template>
  <nav :aria-label="t('nav.language')" class="relative flex items-center rounded-full p-1 text-[12px] font-semibold uppercase tracking-[0.1em]" :class="tone === 'paper' ? 'bg-white/10 text-paper' : 'bg-paper/70 text-ink'">
    <NuxtLink
      v-for="l in items"
      :key="l.code"
      :to="l.to"
      :hreflang="l.code"
      :lang="l.code"
      :aria-current="l.code === locale ? 'true' : undefined"
      :aria-label="t('nav.switchTo', { lang: l.name })"
      class="relative z-10 inline-flex h-9 min-w-11 items-center justify-center rounded-full px-3 transition-colors duration-300"
      :class="l.code === locale ? 'text-white' : 'hover:text-signal-ink'"
    >
      <Motion v-if="l.code === locale" :layout-id="layoutId" class="absolute inset-0 -z-10 rounded-full bg-signal" :transition="{ type: 'spring', stiffness: 420, damping: 32 }" />
      {{ l.code }}
    </NuxtLink>
  </nav>
</template>
