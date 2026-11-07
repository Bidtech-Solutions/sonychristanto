// Small helpers around the motion plugin (plugins/motion.client.ts).
import type gsapType from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

type Gsap = typeof gsapType
type ST = typeof ScrollTriggerType

/** True when the visitor asked for reduced motion (always false during SSR). */
export function usePrefersReducedMotion() {
  const reduced = ref(false)
  onMounted(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches
    const on = (e: MediaQueryListEvent) => (reduced.value = e.matches)
    mq.addEventListener('change', on)
    onBeforeUnmount(() => mq.removeEventListener('change', on))
  })
  return reduced
}

/**
 * Run GSAP code scoped to a component. Everything created inside `setup`
 * (tweens, ScrollTriggers) is reverted on unmount. Not called at all when
 * reduced motion is requested — keep the static (SSR) state meaningful.
 */
export function useGsap(scope: Ref<HTMLElement | null | undefined>, setup: (gsap: Gsap, ScrollTrigger: ST, el: HTMLElement) => void | (() => void)) {
  let ctx: gsap.Context | undefined
  let cleanup: void | (() => void)
  onMounted(() => {
    const { $gsap, $ScrollTrigger, $motionReduced } = useNuxtApp()
    if ($motionReduced || !scope.value) return
    const gsap = $gsap as Gsap
    ctx = gsap.context(() => {
      cleanup = setup(gsap, $ScrollTrigger as ST, scope.value!)
    }, scope.value)
  })
  onBeforeUnmount(() => {
    if (typeof cleanup === 'function') cleanup()
    ctx?.revert()
  })
}

/** Lenis instance (null when reduced motion / dashboard / SSR). */
export const useLenis = () => (import.meta.client ? (useNuxtApp().$lenis as () => import('lenis').default | null)() : null)
