<script setup lang="ts">
// Top bar (DESIGN.md §6). Two placements:
//   variant="hero"  floats inside the landing hero panel (transparent)
//   variant="pill"  stone pill at the top of inner pages
// Both get: a slim sticky paper bar that slides in after scrolling, and a
// full-screen mobile sheet with huge uppercase links.
import { navigation, navigationFull, site } from '~/data/site'

const props = withDefaults(defineProps<{ variant?: 'hero' | 'pill' }>(), { variant: 'pill' })
const { t, lp } = useL()
const route = useRoute()
const open = ref(false)
const stuck = ref(false)

const isActive = (to: string) => {
  const target = lp(to)
  return to === '/' ? route.path === target : route.path.startsWith(target)
}

watch(() => route.fullPath, () => (open.value = false))
watch(open, (v) => {
  const lenis = useLenis()
  if (v) lenis?.stop()
  else lenis?.start()
  if (import.meta.client) document.documentElement.style.overflow = v ? 'hidden' : ''
})

onMounted(() => {
  const onScroll = () => (stuck.value = window.scrollY > (props.variant === 'hero' ? 520 : 220))
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (open.value = false)
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('keydown', onKey)
    document.documentElement.style.overflow = ''
  })
})
const ease = [0.2, 0.7, 0.2, 1] as const
</script>

<template>
  <div>
    <!-- In-flow bar -->
    <nav
      :aria-label="t('nav.mainMenu')"
      class="flex items-center justify-between text-[12px] font-medium uppercase tracking-[0.1em] text-ink-soft"
      :class="variant === 'pill' ? 'h-[72px] w-full max-w-[1408px] rounded-full bg-stone pl-3.5 pr-3 md:pl-5' : 'absolute inset-x-4 top-[14px] z-20 md:left-7 md:right-[18px] md:top-[18px]'"
    >
      <BrandLockup class="hidden sm:flex" />
      <NuxtLink :to="lp('/')" :aria-label="t('nav.homeAria')" class="sm:hidden"><BrandMark :size="46" /></NuxtLink>

      <ul class="hidden items-center gap-3.5 lg:flex">
        <template v-for="(item, i) in navigation" :key="item.key">
          <li v-if="i > 0" aria-hidden="true">/</li>
          <li>
            <NuxtLink
              :to="lp(item.to)"
              class="relative py-1 transition-colors hover:text-signal-ink"
              :class="isActive(item.to) ? 'text-ink' : ''"
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              {{ t(`nav.${item.key}`) }}
              <span class="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-signal transition-transform duration-500 ease-[var(--ease-signal)]" :class="isActive(item.to) ? 'scale-x-100' : 'scale-x-0'" />
            </NuxtLink>
          </li>
        </template>
      </ul>

      <div class="flex items-center gap-2">
        <LanguageSwitcher class="hidden md:flex" />
        <div class="hidden lg:block"><MagneticWrap>
          <NuxtLink
            :to="lp('/kontak')"
            class="group inline-flex h-11 items-center rounded-full px-5 font-semibold"
            :class="variant === 'pill' ? 'bg-ink text-paper hover:bg-signal' : 'text-ink hover:text-signal-ink'"
          >
            {{ t('nav.contactCta') }}<span class="arrow-nudge ml-2" :class="variant === 'pill' ? 'text-signal group-hover:text-white' : 'text-signal'">↗</span>
          </NuxtLink>
        </MagneticWrap></div>
        <button type="button" class="inline-flex h-11 items-center rounded-full bg-ink px-[18px] text-[12px] font-semibold uppercase tracking-[0.1em] text-paper lg:hidden" :aria-expanded="open" aria-controls="menu-sheet" @click="open = true">
          {{ t('nav.menu') }}
        </button>
      </div>
    </nav>

    <!-- Slim sticky bar -->
    <AnimatePresence>
      <Motion
        v-if="stuck && !open"
        as="div"
        class="fixed inset-x-0 top-0 z-40 border-b border-stone-deep bg-paper"
        :initial="{ y: '-100%' }"
        :animate="{ y: 0 }"
        :exit="{ y: '-100%' }"
        :transition="{ duration: 0.45, ease }"
      >
        <div class="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-soft md:px-8">
          <NuxtLink :to="lp('/')" :aria-label="t('nav.homeAria')" class="flex items-center gap-2.5 text-ink">
            <BrandMark :size="38" />
            <span class="font-display-x hidden text-[13px] font-bold leading-[0.9] sm:block">Sony<br>Christanto</span>
          </NuxtLink>
          <ul class="hidden items-center gap-3 lg:flex">
            <template v-for="(item, i) in navigation" :key="item.key">
              <li v-if="i > 0" aria-hidden="true">/</li>
              <li><NuxtLink :to="lp(item.to)" class="hover:text-signal-ink" :class="isActive(item.to) ? 'text-ink' : ''">{{ t(`nav.${item.key}`) }}</NuxtLink></li>
            </template>
          </ul>
          <div class="flex items-center gap-2">
            <LanguageSwitcher class="hidden md:flex" />
            <NuxtLink :to="lp('/kontak')" class="hidden h-10 items-center rounded-full bg-ink px-4 font-semibold text-paper hover:bg-signal lg:inline-flex">{{ t('nav.contactCta') }} <span class="ml-2 text-signal">↗</span></NuxtLink>
            <button type="button" class="inline-flex h-10 items-center rounded-full bg-ink px-4 font-semibold text-paper lg:hidden" :aria-expanded="open" aria-controls="menu-sheet" @click="open = true">{{ t('nav.menu') }}</button>
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <!-- Mobile / full menu sheet -->
    <AnimatePresence>
      <Motion
        v-if="open"
        id="menu-sheet"
        as="div"
        role="dialog"
        aria-modal="true"
        :aria-label="t('nav.mainMenu')"
        class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper p-4"
        data-lenis-prevent
        :initial="{ clipPath: 'inset(0 0 100% 0 round 0 0 28px 28px)' }"
        :animate="{ clipPath: 'inset(0 0 0% 0 round 0 0 0px 0px)' }"
        :exit="{ clipPath: 'inset(0 0 100% 0 round 0 0 28px 28px)' }"
        :transition="{ duration: 0.6, ease }"
      >
        <div class="flex items-center justify-between">
          <BrandLockup />
          <button type="button" class="inline-flex h-11 items-center rounded-full bg-ink px-[18px] text-[12px] font-semibold uppercase tracking-[0.1em] text-paper" @click="open = false">{{ t('nav.close') }} ✕</button>
        </div>
        <ul class="mt-10 flex flex-1 flex-col justify-center gap-1">
          <li v-for="(item, i) in navigationFull" :key="item.key" class="overflow-hidden">
            <Motion
              as="div"
              :initial="{ y: '110%' }"
              :animate="{ y: 0, transition: { delay: 0.18 + i * 0.05, duration: 0.7, ease } }"
              :exit="{ y: '110%', transition: { duration: 0.25 } }"
            >
              <NuxtLink
                :to="lp(item.to)"
                class="font-display-x group flex items-baseline gap-3 text-[clamp(32px,9.5vw,88px)] [overflow-wrap:anywhere] font-bold leading-[0.95] hover:text-signal-ink"
                :class="isActive(item.to) ? 'text-signal-ink' : ''"
              >
                <span class="text-[13px] font-semibold tracking-[0.1em] text-ink-ghost">0{{ i + 1 }}</span>{{ t(`nav.${item.key}`) }}
              </NuxtLink>
            </Motion>
          </li>
        </ul>
        <div class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-deep pt-5">
          <LanguageSwitcher />
          <p class="label text-ink-soft">
            <a :href="`https://wa.me/${site.contact.whatsapp}`" class="hover:text-signal-ink">WA</a> /
            <a :href="`mailto:${site.contact.email}`" class="hover:text-signal-ink">Email</a> /
            <a :href="site.social[0].url" class="hover:text-signal-ink">IG</a>
          </p>
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>
