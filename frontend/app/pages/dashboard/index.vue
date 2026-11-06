<script setup lang="ts">
import type { AdminArticle, Envelope, PageMeta } from '~/types/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Ringkasan' })

const api = useAdminApi()
const { admin } = useAuth()
const counts = reactive({ published: 0, draft: 0, inactive: 0 })
const recent = ref<AdminArticle[]>([])

onMounted(async () => {
  const count = (status: string) =>
    api<Envelope<AdminArticle[], PageMeta>>('/admin/articles', { query: { status, per_page: 1 } }).then((r) => r.meta.total)
  const [p, d, i, r] = await Promise.all([
    count('published'),
    count('draft'),
    count('inactive'),
    api<Envelope<AdminArticle[], PageMeta>>('/admin/articles', { query: { per_page: 5 } }),
  ])
  Object.assign(counts, { published: p, draft: d, inactive: i })
  recent.value = r.data
})
</script>

<template>
  <div class="max-w-5xl">
    <h1 class="font-display text-4xl font-semibold">Halo, {{ admin?.name }}</h1>
    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <NuxtLink v-for="(c, key) in { published: 'Terbit', draft: 'Draft', inactive: 'Nonaktif' }" :key="key" :to="{ path: '/dashboard/artikel', query: { status: key } }" class="bg-white p-6 hover:shadow">
        <p class="text-ink-600">{{ c }}</p>
        <p class="font-display text-4xl font-bold">{{ counts[key] }}</p>
      </NuxtLink>
    </div>
    <div class="mt-10 flex items-center justify-between">
      <h2 class="text-xl font-semibold">Terakhir diubah</h2>
      <NuxtLink to="/dashboard/artikel" class="text-navy-700 underline">Semua artikel</NuxtLink>
    </div>
    <ul class="mt-4 divide-y divide-cream-300 bg-white">
      <li v-for="a in recent" :key="a.id">
        <NuxtLink :to="`/dashboard/artikel/${a.id}`" class="flex items-center justify-between gap-4 p-4 hover:bg-cream-100">
          <span class="truncate font-medium">{{ a.draft.title || '(Tanpa judul)' }}</span>
          <ArticleStatusBadge :article="a" />
        </NuxtLink>
      </li>
      <li v-if="!recent.length" class="p-4 text-ink-600">Belum ada artikel.</li>
    </ul>
  </div>
</template>
