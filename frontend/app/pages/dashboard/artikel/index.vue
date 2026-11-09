<script setup lang="ts">
import { ChevronLeft, ChevronRight, Eye, PowerOff, Plus, Search, Send, Trash2 } from 'lucide-vue-next'
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
// Same field style as the sign-in and settings pages.
const inputCls =
  'h-12 w-full rounded-xl border-[1.5px] border-stone-deep bg-paper px-4 text-[15px] text-ink transition-colors focus:border-ink focus:bg-white focus:outline-none'
const iconBtn = 'inline-flex size-9 items-center justify-center rounded-full border-[1.5px] transition-colors'
const categoryLabel = (k?: string | null) => categories.find((c) => c.key === k)?.label.id ?? '—'
</script>

<template>
  <div class="flex flex-col gap-8">
    <DashPageHeader eyebrow="Konten" title="Artikel" description="Tulis, terbitkan, dan kelola semua artikel blog.">
      <template #actions>
        <button type="button" class="btn-signal" @click="create"><Plus class="size-4" aria-hidden="true" />Tulis artikel</button>
      </template>
    </DashPageHeader>

    <div class="grid gap-3 rounded-[20px] bg-white p-4 md:grid-cols-[minmax(0,1fr)_200px_220px] md:p-5">
      <div class="relative">
        <label class="sr-only" for="q">Cari judul</label>
        <Search class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
        <input id="q" v-model="filters.q" type="search" placeholder="Cari judul…" :class="[inputCls, 'pl-11']" />
      </div>
      <div>
        <label class="sr-only" for="status">Status</label>
        <select id="status" v-model="filters.status" :class="inputCls">
          <option value="">Semua status</option>
          <option value="draft">Draft</option>
          <option value="published">Terbit</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
      <div>
        <label class="sr-only" for="category">Kategori</label>
        <select id="category" v-model="filters.category" :class="inputCls">
          <option value="">Semua kategori</option>
          <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label.id }}</option>
        </select>
      </div>
    </div>

    <p v-if="message" role="alert" class="m-0 rounded-xl bg-signal-tint px-4 py-3 text-[14px] font-medium text-signal-ink">{{ message }}</p>

    <div class="overflow-x-auto rounded-[20px] bg-white">
      <table class="w-full min-w-[760px] text-left text-[15px]">
        <thead class="border-b border-stone">
          <tr class="label-sm text-ink-soft">
            <th class="px-5 py-4 font-semibold">Judul</th>
            <th class="px-5 py-4 font-semibold">Kategori</th>
            <th class="px-5 py-4 font-semibold">Status</th>
            <th class="px-5 py-4 font-semibold">Diubah</th>
            <th class="px-5 py-4 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in list" :key="a.id" class="border-b border-stone transition-colors last:border-b-0 hover:bg-paper/60">
            <td class="px-5 py-4">
              <NuxtLink :to="`/dashboard/artikel/${a.id}`" class="font-semibold hover:text-signal-ink">{{ a.draft.title || '(Tanpa judul)' }}</NuxtLink>
              <p v-if="a.author" class="m-0 text-[13px] text-ink-soft">{{ a.author.name }}</p>
            </td>
            <td class="px-5 py-4">{{ categoryLabel(a.draft.category) }}</td>
            <td class="px-5 py-4"><ArticleStatusBadge :article="a" /></td>
            <td class="px-5 py-4 text-[13px] text-ink-soft">{{ formatDateTime(a.draft.updated_at) }}</td>
            <td class="px-5 py-4">
              <div class="flex justify-end gap-2">
                <a v-if="a.status === 'published'" :href="`/id/blog/${a.slug}`" target="_blank" :class="[iconBtn, 'border-stone-deep hover:border-ink hover:bg-ink hover:text-paper']" title="Lihat di situs" aria-label="Lihat di situs"><Eye class="size-4" /></a>
                <button v-if="a.status !== 'published' || a.has_unpublished_changes" type="button" :class="[iconBtn, 'border-stone-deep hover:border-ink hover:bg-ink hover:text-paper']" title="Terbitkan" aria-label="Terbitkan" @click="act(a, 'publish')"><Send class="size-4" /></button>
                <button v-if="a.status === 'published'" type="button" :class="[iconBtn, 'border-stone-deep hover:border-ink hover:bg-ink hover:text-paper']" title="Nonaktifkan" aria-label="Nonaktifkan" @click="act(a, 'unpublish')"><PowerOff class="size-4" /></button>
                <button type="button" :class="[iconBtn, 'border-signal-tint bg-signal-tint text-signal-ink hover:border-signal hover:bg-signal hover:text-white']" title="Hapus" aria-label="Hapus" @click="act(a, 'delete')"><Trash2 class="size-4" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="!list.length && !loading">
            <td colspan="5" class="px-5 py-12 text-center text-ink-soft">Tidak ada artikel.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav v-if="meta && meta.total_pages > 1" class="flex items-center justify-center gap-3" aria-label="Halaman">
      <button type="button" class="btn-line" :disabled="filters.page <= 1" @click="(filters.page--, load())"><ChevronLeft class="size-4" aria-hidden="true" />Sebelumnya</button>
      <span class="label-sm text-ink-soft">{{ meta.page }} / {{ meta.total_pages }}</span>
      <button type="button" class="btn-line" :disabled="filters.page >= meta.total_pages" @click="(filters.page++, load())">Berikutnya<ChevronRight class="size-4" aria-hidden="true" /></button>
    </nav>
  </div>
</template>
