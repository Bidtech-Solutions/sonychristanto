<script setup lang="ts">
// Pulls its content gently toward the pointer (motion-v springs). Mouse only;
// disabled for touch and reduced motion.
const props = withDefaults(defineProps<{ strength?: number }>(), { strength: 0.28 })
const el = ref<HTMLElement>()
const x = useMotionValue(0)
const y = useMotionValue(0)
const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 })
const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 })
const reduced = usePrefersReducedMotion()

function move(e: PointerEvent) {
  if (reduced.value || e.pointerType !== 'mouse' || !el.value) return
  const r = el.value.getBoundingClientRect()
  x.set((e.clientX - (r.left + r.width / 2)) * props.strength)
  y.set((e.clientY - (r.top + r.height / 2)) * props.strength)
}
function leave() {
  x.set(0)
  y.set(0)
}
</script>

<template>
  <div ref="el" class="inline-block" @pointermove="move" @pointerleave="leave">
    <Motion as="div" class="will-change-transform" :style="{ x: sx, y: sy }">
      <slot />
    </Motion>
  </div>
</template>
