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

  // ------------------------------------------------------------ scroll lock
  // Single owner of "page scroll is locked" (menu sheet, lightbox, ...).
  // Each caller locks with its own id; scroll only resumes when every id is
  // released. Components must never call lenis.stop()/start() themselves: a
  // component unmounted while locked (e.g. the header that disappears when
  // navigating to the home page) would otherwise leave `lenis-stopped` on
  // <html> and freeze scrolling until a reload.
  const locks = new Set<string>()
  function applyLock() {
    const locked = locks.size > 0
    if (locked) lenis?.stop()
    else lenis?.start()
    root.style.overflow = locked ? 'hidden' : ''
  }
  const scrollLock = {
    lock(id: string) {
      locks.add(id)
      applyLock()
    },
    unlock(id: string) {
      if (!locks.delete(id)) return
      applyLock()
    },
    releaseAll() {
      locks.clear()
      applyLock()
    },
  }

  function startLenis() {
    if (reduced) return
    if (lenis) {
      applyLock()
      return
    }
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -96 },
      autoRaf: false,
      // let native scrolling happen inside dialogs, editors and vertical overlays
      prevent: (node) => !!node.closest?.('dialog, [data-lenis-prevent], .bn-container'),
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    applyLock()
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
        lenis?.resize()
        setupReveals()
        setupParallax()
        ScrollTrigger.refresh()
        const hash = router.currentRoute.value.hash
        if (hash) {
          const target = document.querySelector<HTMLElement>(hash)
          if (target) {
            lenis ? lenis.scrollTo(target, { offset: -96, force: true }) : target.scrollIntoView()
          }
        }
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
    // Nothing that locks scroll survives a navigation (the menu closes on
    // route change, the lightbox unmounts) — drop any lock left behind.
    locks.clear()
    if (isDashboard(path)) stopLenis()
    else startLenis()
    applyLock() // also covers reduced motion / dashboard, where there is no Lenis
    if (!router.currentRoute.value.hash) {
      lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0)
    }
    afterPage()
  })
  // Safety net for the reveal contract: [data-reveal]/[data-split] nodes that
  // mount AFTER a page has been scanned (tab panels, pagination, v-if content)
  // would otherwise stay at opacity 0 forever. Arm them as they appear.
  if (!reduced) {
    let queued = false
    const hasPending = (n: Node) =>
      n instanceof Element && (n.matches('[data-reveal]:not([data-revealed]), [data-split]:not([data-revealed])') || !!n.querySelector('[data-reveal]:not([data-revealed]), [data-split]:not([data-revealed])'))
    new MutationObserver((records) => {
      if (queued || isDashboard(router.currentRoute.value.path)) return
      if (!records.some((r) => Array.from(r.addedNodes).some(hasPending))) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        setupReveals()
        setupParallax()
      })
    }).observe(document.body, { childList: true, subtree: true })
  }

  // Refresh trigger positions once fonts and late images settle.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })

  return {
    provide: {
      gsap,
      ScrollTrigger,
      lenis: () => lenis,
      scrollLock,
      motionReduced: reduced,
      refreshReveals: afterPage,
    },
  }
})
