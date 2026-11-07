<script setup lang="ts">
// Generic stone hero panel for inner pages without a bespoke design
// (awards, writings, gallery, organisation/award detail).
import type { RevealLine } from '~/components/motion/RevealText.vue'

withDefaults(defineProps<{ lines: (RevealLine | string)[]; lead?: string; crumbs?: { name: string; path: string }[]; ghost?: string; size?: 'xl' | 'md' }>(), { size: 'xl' })
</script>

<template>
  <section class="panel bg-stone">
    <span v-if="ghost" aria-hidden="true" class="font-display-x pointer-events-none absolute -right-[2%] top-[6%] whitespace-nowrap text-[30vw] font-bold leading-[0.8] tracking-[-0.04em] text-stone-ghost md:text-[15vw]">{{ ghost }}</span>
    <LightGrid class="absolute right-[6%] top-[14%] h-[60%] w-[34%] max-md:hidden" :opacity="0.32" interactive />
    <div class="relative z-10 flex min-h-[420px] flex-col justify-between gap-10 px-5 py-10 md:min-h-[520px] md:px-12 md:py-14">
      <Breadcrumbs v-if="crumbs?.length" :items="crumbs" />
      <div class="flex flex-col gap-6">
        <RevealText
          :lines="lines"
          as="h1"
          trigger="load"
          class="font-display-x m-0 font-bold leading-[0.88] tracking-[-0.035em]"
          :class="size === 'xl' ? 'text-[15vw] md:text-[clamp(64px,8vw,124px)]' : 'max-w-[1000px] text-[clamp(36px,9vw,56px)] md:text-[clamp(44px,5.4vw,84px)]'"
        />
        <p v-if="lead" data-reveal class="max-w-[560px] text-[18px] leading-relaxed text-ink-soft md:text-[19px]">{{ lead }}</p>
        <slot />
      </div>
    </div>
  </section>
</template>
