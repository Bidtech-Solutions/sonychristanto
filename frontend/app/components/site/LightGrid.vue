<script setup lang="ts">
// "Kisi Cahaya" — the signature red window-grid of light (DESIGN.md §5.1).
// Decorative only. Breathes slowly and drifts toward the pointer when motion is allowed.
const props = withDefaults(
  defineProps<{ cols?: number; rows?: number; blur?: number; opacity?: number; rotate?: number; gap?: number; radius?: number; interactive?: boolean }>(),
  { cols: 3, rows: 2, blur: 18, opacity: 0.45, rotate: -6, gap: 18, radius: 12, interactive: false },
)
const root = ref<HTMLElement>()

useGsap(root, (gsap) => {
  const cells = root.value!.querySelectorAll('span')
  gsap.from(cells, { opacity: 0, scale: 0.8, duration: 1.2, stagger: { each: 0.06, from: 'random' }, ease: 'power2.out', delay: 0.2 })
  gsap.to(root.value!, { opacity: props.opacity * 0.75, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.4 })
  if (!props.interactive) return
  const qx = gsap.quickTo(root.value!, 'x', { duration: 1.2, ease: 'power3.out' })
  const qy = gsap.quickTo(root.value!, 'y', { duration: 1.2, ease: 'power3.out' })
  const move = (e: PointerEvent) => {
    qx((e.clientX / window.innerWidth - 0.5) * 36)
    qy((e.clientY / window.innerHeight - 0.5) * 24)
  }
  window.addEventListener('pointermove', move, { passive: true })
  return () => window.removeEventListener('pointermove', move)
})
</script>

<template>
  <div
    ref="root"
    aria-hidden="true"
    class="pointer-events-none grid"
    :style="{
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: `${gap}px`,
      filter: `blur(${blur}px)`,
      opacity,
      transform: `rotate(${rotate}deg)`,
    }"
  >
    <span v-for="i in cols * rows" :key="i" class="bg-signal" :style="{ borderRadius: `${radius}px` }" />
  </div>
</template>
