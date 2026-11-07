<script setup lang="ts">
// Number that counts up when it scrolls into view. SSR renders the final
// value, so the fact is always in the HTML.
const props = withDefaults(defineProps<{ value: number; duration?: number; from?: number }>(), { duration: 1.6 })
const el = ref<HTMLElement>()
const display = ref(props.value)

useGsap(el, (gsap) => {
  const start = props.from ?? (props.value > 1900 ? props.value - 40 : 0)
  const obj = { n: start }
  display.value = start
  gsap.to(obj, {
    n: props.value,
    duration: props.duration,
    ease: 'power3.out',
    onUpdate: () => (display.value = Math.round(obj.n)),
    scrollTrigger: { trigger: el.value!, start: 'top 90%', once: true },
  })
})
</script>

<template>
  <span ref="el" class="tabular-nums">{{ display }}</span>
</template>
