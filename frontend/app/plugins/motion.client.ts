// Motion stack (docs/DESIGN.md §9):
//   Lenis        smooth scroll (wheel/trackpad), drives GSAP's ticker
//   GSAP         ScrollTrigger reveals, scroll-linked ink fill, marquee, timelines
//   motion-v     component micro-interactions (springs, presence, layout) — used in components
//
// Everything is skipped when the visitor prefers reduced motion: no smooth
// scroll, no reveals (content is never hidden), no marquee.
//
// Reveal contract: elements with [data-reveal] are visible in SSR HTML. The
// inline head script in app.vue adds `html.js` (only when motion is allowed),
// CSS hides [data-reveal] under html.js, and this plugin animates them in once
// they enter the viewport. A CSS fallback reveals everything if JS never runs.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement
  let lenis: Lenis | null = null

  const isDashboard = (path: string) => path.startsWith('/dashboard')

  function startLenis() {
    if (reduced || lenis) return
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -96 },
      autoRaf: false,
      // let native scrolling happen inside dialogs, editors and horizontal scrollers
      prevent: (node) => !!node.closest?.('dialog, [data-lenis-prevent], .bn-container'),
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
  }
  function raf(time: number) {
    lenis?.raf(time * 1000)
  }
  function stopLenis() {
    if (!lenis) return
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenis = null
  }

  // ---------------------------------------------------------------- reveals
  function setupReveals() {
    if (reduced) return
    const els = gsap.utils.toArray<HTMLElement>('[data-reveal]:not([data-revealed])')
    els.forEach((el) => {
      el.setAttribute('data-revealed', '')
      const kind = el.dataset.reveal || 'up'
      const delay = Number(el.dataset.revealDelay || 0)
      const from: gsap.TweenVars =
        kind === 'fade' ? { opacity: 0 } : kind === 'scale' ? { opacity: 0, scale: 0.94 } : kind === 'left' ? { opacity: 0, x: -32 } : kind === 'right' ? { opacity: 0, x: 32 } : { opacity: 0, y: 28 }
      gsap.fromTo(el, from, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    })
    // Masked word reveals (RevealText / [data-split])
    gsap.utils.toArray<HTMLElement>('[data-split]:not([data-revealed])').forEach((el) => {
      el.setAttribute('data-revealed', '')
      const words = el.querySelectorAll<HTMLElement>('.split-word > span')
      const onLoad = el.dataset.split === 'load'
      gsap.fromTo(
        words,
        // y:0 too — GSAP parses the CSS translateY(110%) pre-hide into `y` (px)
        { yPercent: 110, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.06,
          delay: Number(el.dataset.revealDelay || 0),
          ...(onLoad ? {} : { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }),
        },
      )
    })
  }

  // Gentle scroll parallax for photos only (never text — DESIGN.md §9).
  function setupParallax() {
    if (reduced) return
    gsap.utils.toArray<HTMLElement>('[data-parallax]:not([data-parallaxed])').forEach((el) => {
      el.setAttribute('data-parallaxed', '')
      const amount = Number(el.dataset.parallax || 8)
      gsap.fromTo(el, { yPercent: amount / 2 }, { yPercent: -amount / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
  }

  function afterPage() {
    nextTick(() => {
      requestAnimationFrame(() => {
        setupReveals()
        setupParallax()
        ScrollTrigger.refresh()
      })
    })
  }

  // ---------------------------------------------------------------- lifecycle
  const router = useRouter()
  nuxtApp.hook('app:mounted', () => {
    if (!isDashboard(router.currentRoute.value.path)) startLenis()
    root.classList.add('motion-ready')
    afterPage()
  })
  nuxtApp.hook('page:finish', () => {
    const path = router.currentRoute.value.path
    if (isDashboard(path)) stopLenis()
    else startLenis()
    if (!router.currentRoute.value.hash) {
      lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0)
    }
    afterPage()
  })
  // Refresh trigger positions once fonts and late images settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })

  return {
    provide: {
      gsap,
      ScrollTrigger,
      lenis: () => lenis,
      motionReduced: reduced,
      refreshReveals: afterPage,
    },
  }
})
