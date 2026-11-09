<script setup lang="ts">
// Uploads to /api/v1/admin/uploads; the backend converts to WebP (≤1920×1080, q80).
import type { Envelope, MediaUpload } from '~/types/api'

// labelClass: optional override so a page can match its own label style (default: field-label).
const props = defineProps<{ label: string; purpose: 'banner' | 'avatar' | 'article'; hint?: string; round?: boolean; labelClass?: string }>()
const url = defineModel<string | null>({ required: true })
const api = useAdminApi()
const uploading = ref(false)
const error = ref('')
const input = ref<HTMLInputElement>()
const id = useId()

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  error.value = ''
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('purpose', props.purpose)
    const res = await api<Envelope<MediaUpload>>('/admin/uploads', { method: 'POST', body: fd })
    url.value = res.data.url
  } catch (err) {
    error.value = apiFieldErrors(err).file ?? apiErrorMessage(err, 'Gagal mengunggah gambar')
  } finally {
    uploading.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div>
    <p :class="labelClass ?? 'field-label'" :id="`${id}-label`">{{ label }}</p>
    <div class="flex flex-wrap items-center gap-4">
      <img v-if="url" :src="url" alt="" class="flex-none border border-cream-300 object-cover" :class="round ? 'h-24 w-24 rounded-full' : 'aspect-video w-64'" />
      <div v-else class="flex flex-none items-center justify-center border border-dashed border-navy-200 bg-paper px-3 text-center text-[13px] leading-snug text-ink-600" :class="round ? 'h-24 w-24 rounded-full' : 'aspect-video w-64'">Belum ada gambar</div>
      <div class="flex flex-col gap-2">
        <label :for="id" class="btn-outline cursor-pointer" :class="{ 'opacity-50': uploading }">{{ uploading ? 'Mengunggah…' : url ? 'Ganti gambar' : 'Pilih gambar' }}</label>
        <input :id="id" ref="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="sr-only" :disabled="uploading" :aria-describedby="`${id}-hint`" @change="onFile" />
        <button v-if="url" type="button" class="text-left text-sm text-red-700 underline" @click="url = null">Hapus gambar</button>
      </div>
    </div>
    <p :id="`${id}-hint`" class="mt-1 text-sm text-ink-600">{{ hint ?? 'JPG, PNG, WebP, atau GIF, maks. 10 MB. Otomatis dikonversi ke WebP.' }}</p>
    <p v-if="error" role="alert" class="field-error">{{ error }}</p>
  </div>
</template>
