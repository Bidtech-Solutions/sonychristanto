<script setup lang="ts">
// Full-screen photo viewer on a native <dialog> (focus trap + Esc for free).
import type { GalleryItem } from '~/data/gallery'

const props = defineProps<{ items: GalleryItem[] }>()
const index = defineModel<number | null>({ required: true })
const dialog = ref<HTMLDialogElement>()
const current = computed(() => (index.value === null ? null : props.items[index.value]))

watch(index, (i) => {
  if (i === null) dialog.value?.close()
  else if (!dialog.value?.open) dialog.value?.showModal()
})

const go = (step: number) => {
  if (index.value === null) return
  index.value = (index.value + step + props.items.length) % props.items.length
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-0 h-full max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
    aria-label="Penampil foto"
    @close="index = null"
    @keydown="onKey"
  >
    <div v-if="current" class="flex h-full flex-col">
      <div class="flex items-center justify-between p-3">
        <p class="text-sm text-white/70">{{ (index ?? 0) + 1 }} / {{ items.length }}</p>
        <button type="button" class="min-h-11 min-w-11 text-2xl" aria-label="Tutup" @click="index = null">✕</button>
      </div>
      <figure class="flex min-h-0 flex-1 flex-col items-center justify-center px-14">
        <img :src="current.src" :alt="current.alt" class="max-h-full max-w-full object-contain" />
        <figcaption v-if="current.caption" class="mt-3 text-center text-white/80">{{ current.caption }}</figcaption>
      </figure>
      <div class="flex justify-between p-3">
        <button type="button" class="btn-outline text-white" @click="go(-1)">← Sebelumnya</button>
        <button type="button" class="btn-outline text-white" @click="go(1)">Berikutnya →</button>
      </div>
    </div>
  </dialog>
</template>
