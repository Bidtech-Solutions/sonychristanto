<script setup lang="ts">
// Article editor. Every change autosaves the DRAFT (debounced). The public
// page only changes when "Terbitkan" is pressed. See docs/PRD.md §Modul 3.
import { categories } from '~/data/site'
import type { AdminArticle, Block, Envelope } from '~/types/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const api = useAdminApi()
const id = String(route.params.id)

const article = ref<AdminArticle>()
const loadError = ref('')
const form = reactive({ title: '', slug: '', excerpt: '', category: '', banner_url: null as string | null, banner_alt: '' })
const content = shallowRef<Block[]>([])
const initialContent = shallowRef<Block[]>([])
const version = ref(0)

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict'
const saveState = ref<SaveState>('idle')
const savedAt = ref<string>()
const fieldErrors = ref<Record<string, string>>({})
const actionMessage = ref('')
const busy = ref(false)

useHead({ title: () => form.title || 'Artikel tanpa judul' })

async function load() {
  try {
    const res = await api<Envelope<AdminArticle>>(`/admin/articles/${id}`)
    applyArticle(res.data, true)
  } catch (e) {
    loadError.value = apiErrorMessage(e, 'Artikel tidak dapat dimuat')
  }
}

let applying = false
function applyArticle(a: AdminArticle, withContent: boolean) {
  applying = true
  article.value = a
  Object.assign(form, {
    title: a.draft.title,
    slug: a.draft.slug,
    excerpt: a.draft.excerpt,
    category: a.draft.category,
    banner_url: a.draft.banner_url,
    banner_alt: a.draft.banner_alt,
  })
  if (withContent) {
    content.value = a.draft.content ?? []
    initialContent.value = a.draft.content ?? []
  }
  version.value = a.draft.version
  savedAt.value = a.draft.updated_at
  saveState.value = 'idle'
  applying = false
}
onMounted(load)

// ---- autosave -------------------------------------------------------------
const AUTOSAVE_MS = 1500
let timer: ReturnType<typeof setTimeout> | undefined
let inFlight: Promise<void> | null = null
let again = false

function markDirty() {
  if (applying || !article.value || saveState.value === 'conflict') return
  saveState.value = 'dirty'
  clearTimeout(timer)
  timer = setTimeout(save, AUTOSAVE_MS)
}
watch(form, markDirty, { deep: true, flush: 'sync' })

function onContentChange(doc: Block[]) {
  content.value = doc
  markDirty()
}

async function save(): Promise<void> {
  clearTimeout(timer)
  if (saveState.value === 'conflict') return
  if (inFlight) {
    again = true
    return inFlight
  }
  saveState.value = 'saving'
  inFlight = (async () => {
    try {
      const res = await api<Envelope<{ version: number; updated_at: string }>>(`/admin/articles/${id}/draft`, {
        method: 'PUT',
        body: { ...form, content: content.value, version: version.value },
      })
      version.value = res.data.version
      savedAt.value = res.data.updated_at
      fieldErrors.value = {}
      saveState.value = again ? 'dirty' : 'saved'
    } catch (e) {
      if (apiErrorCode(e) === 'DRAFT_CONFLICT') saveState.value = 'conflict'
      else {
        fieldErrors.value = apiFieldErrors(e)
        saveState.value = 'error'
      }
    } finally {
      inFlight = null
    }
  })()
  await inFlight
  if (again) {
    again = false
    return save()
  }
}

const unsaved = computed(() => ['dirty', 'saving', 'error'].includes(saveState.value))
function beforeUnload(e: BeforeUnloadEvent) {
  if (unsaved.value) e.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
onBeforeRouteLeave(async () => {
  if (saveState.value === 'dirty') await save()
})

const saveLabel = computed(
  () =>
    ({
      idle: savedAt.value ? `Tersimpan ${formatDateTime(savedAt.value)}` : '',
      dirty: 'Perubahan belum disimpan…',
      saving: 'Menyimpan…',
      saved: `Draft tersimpan ${formatDateTime(savedAt.value)}`,
      error: 'Gagal menyimpan — periksa isian',
      conflict: 'Draft diubah di tab/akun lain',
    })[saveState.value],
)

// ---- actions --------------------------------------------------------------
async function run(fn: () => Promise<unknown>, ok: string) {
  busy.value = true
  actionMessage.value = ''
  try {
    if (saveState.value === 'dirty' || saveState.value === 'saving') await save()
    if (saveState.value === 'error' || saveState.value === 'conflict') throw new Error('save-failed')
    await fn()
    actionMessage.value = ok
  } catch (e) {
    if ((e as Error).message === 'save-failed') actionMessage.value = 'Simpan draft gagal. Perbaiki isian terlebih dahulu.'
    else {
      fieldErrors.value = apiFieldErrors(e)
      actionMessage.value = Object.keys(fieldErrors.value).length ? 'Belum bisa diterbitkan. Lengkapi isian yang ditandai.' : apiErrorMessage(e)
    }
  } finally {
    busy.value = false
  }
}

const publish = () =>
  run(async () => {
    const res = await api<Envelope<AdminArticle>>(`/admin/articles/${id}/publish`, { method: 'POST' })
    applyArticle(res.data, false)
  }, 'Artikel diterbitkan.')

const unpublish = () => {
  if (!confirm('Nonaktifkan artikel ini? Artikel tidak akan terlihat publik sampai diterbitkan lagi.')) return
  run(async () => {
    const res = await api<Envelope<AdminArticle>>(`/admin/articles/${id}/unpublish`, { method: 'POST' })
    applyArticle(res.data, false)
  }, 'Artikel dinonaktifkan.')
}

const discard = () => {
  if (!confirm('Buang semua perubahan draft dan kembali ke versi yang sedang terbit?')) return
  run(async () => {
    const res = await api<Envelope<AdminArticle>>(`/admin/articles/${id}/discard-draft`, { method: 'POST' })
    article.value = undefined // remount editor with the restored content
    await nextTick()
    applyArticle(res.data, true)
  }, 'Draft dikembalikan ke versi terbit.')
}

async function remove() {
  if (!confirm('Hapus permanen artikel ini? Tindakan ini tidak dapat dibatalkan.')) return
  busy.value = true
  try {
    await api(`/admin/articles/${id}`, { method: 'DELETE' })
    saveState.value = 'idle'
    await navigateTo('/dashboard/artikel')
  } catch (e) {
    actionMessage.value = apiErrorMessage(e)
  } finally {
    busy.value = false
  }
}

const slugLocked = computed(() => !!article.value?.slug)
const isPublished = computed(() => article.value?.status === 'published')
</script>

<template>
  <div class="max-w-5xl">
    <p v-if="loadError" role="alert" class="bg-red-50 p-4 text-red-800">{{ loadError }}</p>

    <template v-else-if="article">
      <div class="sticky top-0 z-10 -mx-5 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-cream-300 bg-cream-100/95 px-5 py-3 backdrop-blur md:-mx-10 md:px-10">
        <div class="flex items-center gap-3">
          <NuxtLink to="/dashboard/artikel" class="text-sm underline">← Artikel</NuxtLink>
          <ArticleStatusBadge :article="article" />
          <span class="text-sm text-ink-600" aria-live="polite">{{ saveLabel }}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <a v-if="isPublished" :href="`/blog/${article.slug}`" target="_blank" class="btn-outline">Lihat</a>
          <button v-if="article.has_unpublished_changes" type="button" class="btn-outline" :disabled="busy" @click="discard">Buang perubahan</button>
          <button v-if="isPublished" type="button" class="btn-outline" :disabled="busy" @click="unpublish">Nonaktifkan</button>
          <button type="button" class="btn-primary" :disabled="busy || saveState === 'conflict'" @click="publish">
            {{ article.status === 'draft' ? 'Terbitkan' : isPublished ? 'Terbitkan perubahan' : 'Terbitkan ulang' }}
          </button>
        </div>
      </div>

      <div v-if="saveState === 'conflict'" role="alert" class="mb-6 bg-red-50 p-4 text-red-800">
        Draft ini sudah diubah di tempat lain. Perubahan terakhir Anda belum tersimpan.
        <button type="button" class="ml-2 font-semibold underline" @click="() => { article = undefined; load() }">Muat versi terbaru</button>
      </div>
      <p v-if="actionMessage" role="status" class="mb-6 bg-white p-4">{{ actionMessage }}</p>

      <div class="space-y-6">
        <div>
          <label for="title" class="sr-only">Judul</label>
          <input id="title" v-model="form.title" type="text" maxlength="200" placeholder="Judul artikel" class="w-full bg-transparent font-display text-4xl font-semibold placeholder:text-navy-200 focus:outline-none" />
          <p v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</p>
        </div>

        <div class="grid gap-6 bg-white p-6 md:grid-cols-2">
          <div>
            <label for="category" class="field-label">Kategori</label>
            <select id="category" v-model="form.category" class="field-input">
              <option value="">Pilih kategori</option>
              <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label }}</option>
            </select>
            <p v-if="fieldErrors.category" class="field-error">{{ fieldErrors.category }}</p>
          </div>
          <div>
            <label for="slug" class="field-label">Slug URL</label>
            <input id="slug" v-model="form.slug" type="text" :disabled="slugLocked" placeholder="otomatis dari judul" class="field-input disabled:bg-cream-100" />
            <p class="mt-1 text-sm text-ink-600">{{ slugLocked ? 'Slug dikunci setelah terbit (menjaga tautan & SEO).' : 'Kosongkan untuk dibuat otomatis saat terbit.' }}</p>
            <p v-if="fieldErrors.slug" class="field-error">{{ fieldErrors.slug }}</p>
          </div>
          <div class="md:col-span-2">
            <label for="excerpt" class="field-label">Ringkasan (meta description)</label>
            <textarea id="excerpt" v-model="form.excerpt" rows="2" maxlength="300" class="field-input" placeholder="1–2 kalimat. Kosongkan untuk diambil otomatis dari isi." />
            <p class="mt-1 text-right text-sm text-ink-600">{{ form.excerpt.length }}/300</p>
            <p v-if="fieldErrors.excerpt" class="field-error">{{ fieldErrors.excerpt }}</p>
          </div>
          <div class="md:col-span-2 grid gap-4 md:grid-cols-[auto_1fr]">
            <ImageUploadField v-model="form.banner_url" label="Banner" purpose="banner" hint="Rasio 16:9 disarankan. Otomatis dikonversi ke WebP maks. 1920×1080." />
            <div>
              <label for="banner_alt" class="field-label">Teks alternatif banner</label>
              <input id="banner_alt" v-model="form.banner_alt" type="text" maxlength="200" class="field-input" placeholder="Deskripsikan isi gambar" />
              <p v-if="fieldErrors.banner_alt" class="field-error">{{ fieldErrors.banner_alt }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="field-label">Isi artikel <span class="font-normal text-ink-600">— ketik "/" untuk menambah blok (judul, gambar, 2 kolom, dll.)</span></p>
          <ArticleEditor :initial-content="initialContent" @change="onContentChange" />
          <p v-if="fieldErrors.content" class="field-error">{{ fieldErrors.content }}</p>
        </div>

        <div class="border-t border-cream-300 pt-6">
          <button type="button" class="text-red-700 underline" :disabled="busy" @click="remove">Hapus artikel permanen</button>
        </div>
      </div>
    </template>

    <p v-else class="text-ink-600">Memuat…</p>
  </div>
</template>
