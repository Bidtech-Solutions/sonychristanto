<script setup lang="ts">
import { navigation, site } from '~/data/site'

const open = ref(false)
const route = useRoute()
watch(() => route.path, () => (open.value = false))

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <header class="sticky top-0 z-40 bg-navy-900 text-white">
    <div class="container-page flex min-h-16 items-center justify-between gap-6">
      <NuxtLink to="/" class="font-display text-xl font-semibold">{{ site.name }}</NuxtLink>

      <nav aria-label="Navigasi utama" class="hidden lg:block">
        <ul class="flex gap-1">
          <li v-for="item in navigation" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="block px-3 py-3 text-[15px] text-navy-100 hover:text-white"
              :class="{ 'text-white underline decoration-gold-500 decoration-2 underline-offset-8': isActive(item.to) }"
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        class="inline-flex min-h-11 min-w-11 items-center justify-center lg:hidden"
        :aria-expanded="open"
        aria-controls="menu-mobile"
        aria-label="Buka menu"
        @click="open = !open"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path v-if="!open" d="M4 7h16M4 12h16M4 17h16" />
          <path v-else d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <nav v-show="open" id="menu-mobile" aria-label="Navigasi utama" class="border-t border-navy-700 lg:hidden">
      <ul class="container-page py-2">
        <li v-for="item in navigation" :key="item.to">
          <NuxtLink :to="item.to" class="block py-3 text-navy-100" :class="{ 'font-semibold text-gold-500': isActive(item.to) }">
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
