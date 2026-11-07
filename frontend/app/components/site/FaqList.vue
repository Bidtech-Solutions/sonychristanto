<script setup lang="ts">
// Accordion (Biografi.dc.html "Tanya-jawab"); answers animate open with motion-v.
// The full Q&A is also emitted as FAQPage JSON-LD by the page.
defineProps<{ items: { q: string; a: string }[] }>()
const open = ref(0)
const base = useId()
</script>

<template>
  <div class="flex flex-col border-t border-ink">
    <div v-for="(f, i) in items" :key="i" class="border-b border-stone-deep" data-reveal>
      <h3 class="m-0">
        <button
          :id="`${base}-q${i}`"
          type="button"
          :aria-expanded="open === i"
          :aria-controls="`${base}-a${i}`"
          class="font-display-m flex min-h-[72px] w-full cursor-pointer items-center justify-between gap-5 bg-transparent px-1 py-[18px] text-left text-[19px] font-semibold uppercase transition-colors md:text-[22px]"
          :class="open === i ? 'text-signal-ink' : 'text-ink hover:text-signal-ink'"
          @click="open = open === i ? -1 : i"
        >
          {{ f.q }}
          <Motion
            as="span"
            aria-hidden="true"
            class="flex size-10 flex-none items-center justify-center rounded-full font-sans text-[20px]"
            :animate="{ rotate: open === i ? 45 : 0, backgroundColor: open === i ? '#E10600' : 'rgba(0,0,0,0)', color: open === i ? '#FFFFFF' : '#0B0B0B' }"
            :transition="{ type: 'spring', stiffness: 300, damping: 22 }"
          >+</Motion>
        </button>
      </h3>
      <AnimatePresence :initial="false">
        <Motion
          v-if="open === i"
          :id="`${base}-a${i}`"
          as="div"
          role="region"
          :aria-labelledby="`${base}-q${i}`"
          class="overflow-hidden"
          :initial="{ height: 0, opacity: 0 }"
          :animate="{ height: 'auto', opacity: 1 }"
          :exit="{ height: 0, opacity: 0 }"
          :transition="{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }"
        >
          <p class="m-0 px-1 pb-6 pr-16 text-[17px] leading-[1.7] text-ink-soft">{{ f.a }}</p>
        </Motion>
      </AnimatePresence>
    </div>
  </div>
</template>
