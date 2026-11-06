<script setup lang="ts">
// Client-only wrapper that hosts the React BlockNote editor.
import type { Block, Envelope, MediaUpload } from '~/types/api'

const props = defineProps<{ initialContent: Block[] }>()
const emit = defineEmits<{ change: [doc: Block[]] }>()
const el = ref<HTMLElement>()
const ready = ref(false)
const api = useAdminApi()
let destroy: (() => void) | undefined

async function uploadFile(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('purpose', 'article')
  const res = await api<Envelope<MediaUpload>>('/admin/uploads', { method: 'POST', body: fd })
  return res.data.url
}

onMounted(async () => {
  const { mountEditor } = await import('~/editor/blocknote')
  destroy = mountEditor(el.value!, {
    initialContent: props.initialContent,
    uploadFile,
    onChange: (doc) => emit('change', doc as Block[]),
  })
  ready.value = true
})
onBeforeUnmount(() => destroy?.())
</script>

<template>
  <div class="relative min-h-[420px] bg-white py-6">
    <p v-if="!ready" class="absolute inset-0 flex items-center justify-center text-ink-600">Memuat editor…</p>
    <div ref="el" />
  </div>
</template>
