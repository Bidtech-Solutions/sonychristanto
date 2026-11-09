<script setup lang="ts">
import { ArrowUpRight, CircleCheck, ExternalLink, PowerOff, FilePen, PenLine, Plus } from 'lucide-vue-next'
import type { AdminArticle, Envelope, PageMeta } from '~/types/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth', i18n: false })
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

const stats = [
  { key: 'published', label: 'Terbit', icon: CircleCheck, tone: 'bg-[#E3F2E7] text-[#1D6B38]' },
  { key: 'draft', label: 'Draft', icon: FilePen, tone: 'bg-stone text-ink' },
  { key: 'inactive', label: 'Nonaktif', icon: PowerOff, tone: 'bg-signal-tint text-signal-ink' },
] as const

const creating = ref(false)
async function create() {
  creating.value = true
  try {
    const res = await api<Envelope<AdminArticle>>('/admin/articles', { method: 'POST', body: {} })
    await navigateTo(`/dashboard/artikel/${res.data.id}`)
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <DashPageHeader eyebrow="Ringkasan" :title="`Halo, ${admin?.name ?? 'Admin'}`" description="Pantau jumlah artikel per status dan lanjutkan tulisan yang terakhir diubah.">
      <template #actions>
        <a href="/id" target="_blank" class="btn-line"><ExternalLink class="size-4" aria-hidden="true" />Lihat situs</a>
        <button type="button" class="btn-signal" :disabled="creating" @click="create"><Plus class="size-4" aria-hidden="true" />{{ creating ? 'Membuat…' : 'Tulis artikel' }}</button>
      </template>
    </DashPageHeader>

    <div class="grid gap-4 sm:grid-cols-3">
      <div v-for="s in stats" :key="s.key" class="flex flex-col gap-5 rounded-[20px] bg-white p-6">
        <div class="flex items-center justify-between">
          <span class="label-sm text-ink-soft">{{ s.label }}</span>
          <span aria-hidden="true" class="flex size-10 items-center justify-center rounded-xl" :class="s.tone"><component :is="s.icon" class="size-5" /></span>
        </div>
        <span class="font-display-x text-[48px] font-bold leading-none">{{ counts[s.key] }}</span>
        <NuxtLink :to="{ path: '/dashboard/artikel', query: { status: s.key } }" class="label-sm inline-flex items-center gap-1.5 self-start rounded-full border-[1.5px] border-ink px-4 py-2 transition-colors hover:bg-ink hover:text-paper">
          Lihat <ArrowUpRight class="size-3.5" aria-hidden="true" />
        </NuxtLink>
      </div>
    </div>

    <section class="rounded-[20px] bg-white p-6 md:p-8">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-stone pb-4">
        <h2 class="font-display-m m-0 text-[20px] font-bold uppercase leading-none">Terakhir diubah</h2>
        <NuxtLink to="/dashboard/artikel" class="label-sm inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-ink-soft transition-colors hover:bg-stone hover:text-ink">Semua artikel <ArrowUpRight class="size-3.5" aria-hidden="true" /></NuxtLink>
      </div>
      <ul class="m-0 flex list-none flex-col p-0">
        <li v-for="a in recent" :key="a.id" class="flex flex-wrap items-center justify-between gap-3 border-b border-stone py-4 last:border-b-0 last:pb-0">
          <span class="flex min-w-0 items-center gap-3">
            <span aria-hidden="true" class="flex size-9 flex-none items-center justify-center rounded-xl bg-paper text-ink-soft"><PenLine class="size-4" /></span>
            <span class="truncate font-medium">{{ a.draft.title || '(Tanpa judul)' }}</span>
          </span>
          <span class="flex items-center gap-3">
            <ArticleStatusBadge :article="a" />
            <NuxtLink :to="`/dashboard/artikel/${a.id}`" class="label-sm inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-paper transition-colors hover:bg-signal">
              <PenLine class="size-3.5" aria-hidden="true" />Edit
            </NuxtLink>
          </span>
        </li>
        <li v-if="!recent.length" class="py-8 text-center text-ink-soft">Belum ada artikel.</li>
      </ul>
    </section>
  </div>
</template>

