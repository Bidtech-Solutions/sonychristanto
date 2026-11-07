<script setup lang="ts">
import { categories } from '~/data/site'
import type { AdminArticle, Envelope, PageMeta } from '~/types/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth', i18n: false })
useHead({ title: 'Artikel' })

const api = useAdminApi()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  status: (route.query.status as string) || '',
  category: (route.query.category as string) || '',
  q: (route.query.q as string) || '',
  page: Number(route.query.page) || 1,
})
const list = ref<AdminArticle[]>([])
const meta = ref<PageMeta>()
const loading = ref(false)
const message = ref('')

async function load() {
  loading.value = true
  try {
    const res = await api<Envelope<AdminArticle[], PageMeta>>('/admin/articles', { query: { ...filters, per_page: 20 } })
    list.value = res.data
    meta.value = res.meta
    router.replace({ query: Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== 1)) })
  } finally {
    loading.value = false
  }
}
let t: ReturnType<typeof setTimeout>
watch(() => [filters.status, filters.category], () => ((filters.page = 1), load()))
watch(() => filters.q, () => {
  clearTimeout(t)
  t = setTimeout(() => ((filters.page = 1), load()), 350)
})
onMounted(load)

async function create() {
  const res = await api<Envelope<AdminArticle>>('/admin/articles', { method: 'POST', body: {} })
  await navigateTo(`/dashboard/artikel/${res.data.id}`)
}

async function act(a: AdminArticle, action: 'publish' | 'unpublish' | 'delete') {
  const title = a.draft.title || '(Tanpa judul)'
  const confirmText = {
    publish: `Terbitkan "${title}"?`,
    unpublish: `Nonaktifkan "${title}"? Artikel tidak akan terlihat publik sampai diterbitkan lagi.`,
    delete: `Hapus permanen "${title}"? Tindakan ini tidak dapat dibatalkan.`,
  }[action]
  if (!confirm(confirmText)) return
  message.value = ''
  try {
    if (action === 'delete') await api(`/admin/articles/${a.id}`, { method: 'DELETE' })
    else await api(`/admin/articles/${a.id}/${action}`, { method: 'POST' })
    await load()
  } catch (e) {
    const fields = apiFieldErrors(e)
    message.value = Object.keys(fields).length ? `Belum bisa terbit: ${Object.values(fields).join('; ')}` : apiErrorMessage(e)
  }
}
const categoryLabel = (k?: string | null) => categories.find((c) => c.key === k)?.label.id ?? '—'
</script>

<template>
  <div class="max-w-6xl">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-4xl font-semibold">Artikel</h1>
      <button type="button" class="btn-dark" @click="create">+ Tulis artikel</button>
    </div>

    <div class="mt-8 flex flex-wrap gap-3 bg-white p-4">
      <label class="sr-only" for="q">Cari judul</label>
      <input id="q" v-model="filters.q" type="search" placeholder="Cari judul…" class="field-input max-w-xs" />
      <label class="sr-only" for="status">Status</label>
      <select id="status" v-model="filters.status" class="field-input w-auto">
        <option value="">Semua status</option>
        <option value="draft">Draft</option>
        <option value="published">Terbit</option>
        <option value="inactive">Nonaktif</option>
      </select>
      <label class="sr-only" for="category">Kategori</label>
      <select id="category" v-model="filters.category" class="field-input w-auto">
        <option value="">Semua kategori</option>
        <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label.id }}</option>
      </select>
    </div>

    <p v-if="message" role="alert" class="mt-4 bg-red-50 p-3 text-red-800">{{ message }}</p>

    <div class="mt-4 overflow-x-auto bg-white">
      <table class="w-full min-w-[720px] text-left text-[15px]">
        <thead class="border-b border-cream-300 text-sm text-ink-600">
          <tr>
            <th class="p-4 font-medium">Judul</th>
            <th class="p-4 font-medium">Kategori</th>
            <th class="p-4 font-medium">Status</th>
            <th class="p-4 font-medium">Diubah</th>
            <th class="p-4 font-medium"><span class="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-cream-300">
          <tr v-for="a in list" :key="a.id">
            <td class="p-4">
              <NuxtLink :to="`/dashboard/artikel/${a.id}`" class="font-medium hover:underline">{{ a.draft.title || '(Tanpa judul)' }}</NuxtLink>
              <p v-if="a.author" class="text-sm text-ink-600">{{ a.author.name }}</p>
            </td>
            <td class="p-4">{{ categoryLabel(a.draft.category) }}</td>
            <td class="p-4"><ArticleStatusBadge :article="a" /></td>
            <td class="p-4 text-sm text-ink-600">{{ formatDateTime(a.draft.updated_at) }}</td>
            <td class="p-4">
              <div class="flex justify-end gap-3 text-sm">
                <a v-if="a.status === 'published'" :href="`/id/blog/${a.slug}`" target="_blank" class="underline">Lihat</a>
                <button v-if="a.status !== 'published' || a.has_unpublished_changes" type="button" class="underline" @click="act(a, 'publish')">Terbitkan</button>
                <button v-if="a.status === 'published'" type="button" class="underline" @click="act(a, 'unpublish')">Nonaktifkan</button>
                <button type="button" class="text-red-700 underline" @click="act(a, 'delete')">Hapus</button>
              </div>
            </td>
          </tr>
          <tr v-if="!list.length && !loading">
            <td colspan="5" class="p-8 text-center text-ink-600">Tidak ada artikel.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav v-if="meta && meta.total_pages > 1" class="mt-6 flex items-center gap-3" aria-label="Halaman">
      <button type="button" class="btn-outline" :disabled="filters.page <= 1" @click="(filters.page--, load())">Sebelumnya</button>
      <span class="text-sm">{{ meta.page }} / {{ meta.total_pages }}</span>
      <button type="button" class="btn-outline" :disabled="filters.page >= meta.total_pages" @click="(filters.page++, load())">Berikutnya</button>
    </nav>
  </div>
</template>
