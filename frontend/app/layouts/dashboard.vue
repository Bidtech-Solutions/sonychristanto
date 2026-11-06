<script setup lang="ts">
const { admin, logout } = useAuth()
const route = useRoute()
const menu = [
  { label: 'Ringkasan', to: '/dashboard', exact: true },
  { label: 'Artikel', to: '/dashboard/artikel' },
  { label: 'Kelola akun', to: '/dashboard/akun' },
  { label: 'Pengaturan', to: '/dashboard/pengaturan' },
]
const active = (m: { to: string; exact?: boolean }) => (m.exact ? route.path === m.to : route.path.startsWith(m.to))
useHead({ titleTemplate: (t?: string) => (t ? `${t} — Dashboard` : 'Dashboard'), meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="flex min-h-screen flex-wrap bg-cream-100">
    <aside class="w-full bg-navy-900 text-white md:sticky md:top-0 md:h-screen md:w-64 md:flex-none">
      <div class="flex h-full flex-col p-5">
        <NuxtLink to="/dashboard" class="font-display text-xl font-semibold">Sony Christanto</NuxtLink>
        <p class="text-sm text-navy-200">Dashboard konten</p>
        <nav aria-label="Menu dashboard" class="mt-8 flex-1">
          <ul class="flex flex-wrap gap-1 md:flex-col">
            <li v-for="m in menu" :key="m.to">
              <NuxtLink :to="m.to" class="block px-3 py-2.5 text-[15px]" :class="active(m) ? 'bg-navy-800 font-semibold text-white' : 'text-navy-100 hover:bg-navy-800'">
                {{ m.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <div v-if="admin" class="mt-6 border-t border-navy-700 pt-4 text-sm">
          <div class="flex items-center gap-3">
            <img v-if="admin.avatar_url" :src="admin.avatar_url" alt="" class="h-9 w-9 rounded-full object-cover" />
            <div class="min-w-0">
              <p class="truncate font-medium">{{ admin.name }}</p>
              <p class="truncate text-navy-200">{{ admin.is_superadmin ? 'Super admin' : 'Admin' }}</p>
            </div>
          </div>
          <div class="mt-3 flex gap-3">
            <NuxtLink to="/" target="_blank" class="text-navy-200 underline hover:text-white">Lihat situs</NuxtLink>
            <button type="button" class="text-navy-200 underline hover:text-white" @click="logout">Keluar</button>
          </div>
        </div>
      </div>
    </aside>
    <main class="min-w-0 flex-[999_1_560px] p-5 md:p-10">
      <slot />
    </main>
  </div>
</template>
