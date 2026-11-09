<script setup lang="ts">
// Dashboard shell in the public site's language (DESIGN.md): warm paper with
// 16px-inset rounded panels; the one dark panel is the navigation.
//   lg+     plain full-height ink sidebar (logo, menu pills with a red active state, account)
//   < lg    ink pill top bar + a menu that drops down below it
// Page content is centred in one shared column (max 1120px) so every page
// lines up the same way.
import { ExternalLink, LayoutDashboard, LogOut, Menu, Newspaper, Settings, Users, X } from 'lucide-vue-next'

const { admin, logout } = useAuth()
const route = useRoute()
const menu = [
  { label: 'Ringkasan', to: '/dashboard', exact: true, icon: LayoutDashboard },
  { label: 'Artikel', to: '/dashboard/artikel', icon: Newspaper },
  { label: 'Kelola akun', to: '/dashboard/akun', icon: Users },
  { label: 'Pengaturan', to: '/dashboard/pengaturan', icon: Settings },
]
const active = (m: { to: string; exact?: boolean }) => (m.exact ? route.path === m.to : route.path.startsWith(m.to))
const open = ref(false)
watch(() => route.fullPath, () => (open.value = false))
const initials = computed(() =>
  (admin.value?.name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join(''),
)
useHead({ titleTemplate: (t?: string) => (t ? `${t} — Dashboard` : 'Dashboard'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="flex min-h-screen flex-col gap-2.5 bg-paper p-2.5 md:gap-4 md:p-4 lg:flex-row lg:gap-0 lg:p-0">
    <!-- Mobile / tablet top bar -->
    <!-- Not sticky: the article editor has its own sticky toolbar at top-0. -->
    <header class="relative z-40 lg:hidden">
      <div class="flex h-16 items-center justify-between rounded-full bg-ink pl-2.5 pr-2 text-paper">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5" aria-label="Ringkasan dashboard">
          <BrandMark :size="44" />
          <span class="flex flex-col">
            <span class="font-display-x text-[13px] font-bold leading-[0.9]">Sony<br>Christanto</span>
          </span>
        </NuxtLink>
        <button
          type="button"
          class="inline-flex h-11 items-center gap-2 rounded-full bg-paper px-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink"
          :aria-expanded="open"
          aria-controls="dash-menu"
          @click="open = !open"
        >
          <component :is="open ? X : Menu" class="size-4" aria-hidden="true" />{{ open ? 'Tutup' : 'Menu' }}
        </button>
      </div>
      <div v-show="open" id="dash-menu" class="mt-2 rounded-[24px] bg-ink p-4 text-paper shadow-[0_24px_50px_rgba(0,0,0,0.18)]">
        <nav aria-label="Menu dashboard">
          <ul class="flex flex-col gap-1">
            <li v-for="m in menu" :key="m.to">
              <NuxtLink
                :to="m.to"
                class="flex h-12 items-center gap-3 rounded-full px-4 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors"
                :class="active(m) ? 'bg-signal text-white' : 'text-paper/80 hover:bg-white/10 hover:text-paper'"
                :aria-current="active(m) ? 'page' : undefined"
              ><component :is="m.icon" class="size-[18px] flex-none" aria-hidden="true" />{{ m.label }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <div v-if="admin" class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
          <div class="flex min-w-0 items-center gap-3">
            <img v-if="admin.avatar_url" :src="admin.avatar_url" alt="" class="size-10 flex-none rounded-full object-cover" />
            <span v-else aria-hidden="true" class="font-display-x flex size-10 flex-none items-center justify-center rounded-full bg-signal text-[14px] font-bold text-white">{{ initials }}</span>
            <span class="min-w-0">
              <span class="block truncate text-[15px] font-semibold">{{ admin.name }}</span>
              <span class="label-sm block text-paper/60">{{ admin.is_superadmin ? 'Super admin' : 'Admin' }}</span>
            </span>
          </div>
          <div class="flex gap-2">
            <NuxtLink to="/id" target="_blank" class="label-sm inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 px-4 hover:bg-white/10"><ExternalLink class="size-3.5" aria-hidden="true" />Situs</NuxtLink>
            <button type="button" class="label-sm inline-flex h-10 items-center gap-1.5 rounded-full bg-paper px-4 text-ink hover:bg-signal hover:text-white" @click="logout"><LogOut class="size-3.5" aria-hidden="true" />Keluar</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Desktop sidebar -->
    <!-- Plain full-height sidebar, flush with the left edge (no inset, no rounding). -->
    <aside class="sticky top-0 hidden h-screen w-[264px] flex-none flex-col bg-ink p-5 text-paper lg:flex">
      <NuxtLink to="/dashboard" class="group flex items-center gap-3" aria-label="Ringkasan dashboard">
        <span class="block transition-transform duration-500 ease-[var(--ease-signal)] group-hover:rotate-[-8deg] group-hover:scale-105"><BrandMark :size="52" /></span>
        <span class="font-display-x text-[15px] font-bold leading-[0.88]">Sony<br>Christanto</span>
      </NuxtLink>
      <span class="label-sm mt-6 text-paper/50">Dashboard konten</span>
      <nav aria-label="Menu dashboard" class="mt-3 flex-1">
        <ul class="flex flex-col gap-1">
          <li v-for="m in menu" :key="m.to">
            <NuxtLink
              :to="m.to"
              class="group flex h-12 items-center gap-3 rounded-full px-4 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors"
              :class="active(m) ? 'bg-signal text-white' : 'text-paper/75 hover:bg-white/10 hover:text-paper'"
              :aria-current="active(m) ? 'page' : undefined"
            >
              <component :is="m.icon" class="size-[18px] flex-none" aria-hidden="true" />
              <span class="flex-1">{{ m.label }}</span>
              <span v-if="active(m)" aria-hidden="true" class="size-1.5 rounded-full bg-white" />
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div v-if="admin" class="mt-6 flex flex-col gap-4 rounded-[20px] bg-white/[0.06] p-4">
        <div class="flex min-w-0 items-center gap-3">
          <img v-if="admin.avatar_url" :src="admin.avatar_url" alt="" class="size-10 flex-none rounded-full object-cover" />
          <span v-else aria-hidden="true" class="font-display-x flex size-10 flex-none items-center justify-center rounded-full bg-signal text-[14px] font-bold text-white">{{ initials }}</span>
          <span class="min-w-0">
            <span class="block truncate text-[15px] font-semibold">{{ admin.name }}</span>
            <span class="label-sm block text-paper/60">{{ admin.is_superadmin ? 'Super admin' : 'Admin' }}</span>
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink to="/id" target="_blank" class="label-sm inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/25 hover:bg-white/10"><ExternalLink class="size-3.5" aria-hidden="true" />Situs</NuxtLink>
          <button type="button" class="label-sm inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-paper text-ink transition-colors hover:bg-signal hover:text-white" @click="logout"><LogOut class="size-3.5" aria-hidden="true" />Keluar</button>
        </div>
      </div>
    </aside>

    <!-- relative + overflow-x-clip: absolutely positioned bits inside the pages'
         own scroll boxes (e.g. the sr-only "Aksi" table header) would otherwise
         escape them and widen the whole page on phones. -->
    <!-- p-5 / md:p-10 on purpose: pages bleed full-width bars with -mx-5 / md:-mx-10
         (editor toolbar). -->
    <main class="relative min-w-0 flex-1 overflow-x-clip p-5 md:p-10 lg:pt-8">
      <div class="mx-auto w-full max-w-[1120px]">
        <slot />
      </div>
    </main>
  </div>
</template>
