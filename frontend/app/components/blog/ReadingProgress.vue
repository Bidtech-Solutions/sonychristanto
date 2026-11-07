<script setup lang="ts">
// Sticky red reading-progress bar tied to the article body (GSAP scrub).
const props = defineProps<{ target: HTMLElement | null | undefined }>()
const { t } = useL()
const bar = ref<HTMLElement>()
const value = ref(0)
useGsap(bar, (gsap, ScrollTrigger) => {
  if (!props.target) return
  const st = ScrollTrigger.create({
    trigger: props.target,
    start: 'top 20%',
    end: 'bottom 80%',
    onUpdate: (self) => {
      value.value = Math.round(self.progress * 100)
      gsap.set(bar.value!.firstElementChild!, { scaleX: self.progress })
    },
  })
  return () => st.kill()
})
</script>

<template>
  <div ref="bar" role="progressbar" :aria-label="t('blog.readingProgress')" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100" class="sticky top-0 z-30 h-1 w-full max-w-[1408px] overflow-hidden rounded-full bg-stone">
    <span class="block h-full origin-left scale-x-0 bg-signal" />
  </div>
</template>
