<script setup lang="ts">
// Full-screen photo viewer on a native <dialog> (focus trap + Esc for free);
// photos cross-fade/slide with motion-v.
import type { GalleryItem } from '~/data/gallery'

const props = defineProps<{ items: GalleryItem[] }>()
const index = defineModel<number | null>({ required: true })
const { t, tx } = useL()
const dialog = ref<HTMLDialogElement>()
const current = computed(() => (index.value === null ? null : props.items[index.value]))
const dir = ref(1)

watch(index, (i) => {
  const lenis = useLenis()
  if (i === null) {
    dialog.value?.close()
    lenis?.start()
  } else if (!dialog.value?.open) {
    dialog.value?.showModal()
    lenis?.stop()
  }
})

const go = (step: number) => {
  if (index.value === null) return
  dir.value = step
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
    class="m-0 h-full max-h-none w-full max-w-none bg-ink/95 p-0 text-paper backdrop:bg-ink/80"
    :aria-label="t('gallery.viewer')"
    @close="index = null"
    @keydown="onKey"
  >
    <div v-if="current" class="flex h-full flex-col">
      <div class="flex items-center justify-between p-4">
        <p class="label-sm text-paper/70">{{ (index ?? 0) + 1 }} / {{ items.length }}</p>
        <button type="button" class="btn h-11 bg-paper/10 text-paper hover:bg-signal" :aria-label="t('nav.close')" @click="index = null">{{ t('nav.close') }} ✕</button>
      </div>
      <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 md:px-16">
        <AnimatePresence mode="popLayout" :custom="dir">
          <Motion
            :key="current.src"
            as="figure"
            class="m-0 flex max-h-full flex-col items-center"
            :initial="{ opacity: 0, x: dir * 80, scale: 0.98 }"
            :animate="{ opacity: 1, x: 0, scale: 1 }"
            :exit="{ opacity: 0, x: -dir * 80, scale: 0.98 }"
            :transition="{ type: 'spring', stiffness: 260, damping: 30 }"
          >
            <img :src="current.src" :alt="tx(current.alt)" class="max-h-[78vh] max-w-full rounded-[14px] object-contain" />
            <figcaption v-if="current.caption" class="mt-3 text-center text-paper/80">{{ tx(current.caption) }}</figcaption>
          </Motion>
        </AnimatePresence>
      </div>
      <div class="flex justify-between p-4">
        <button type="button" class="btn-line-paper" @click="go(-1)">← {{ t('common.prev') }}</button>
        <button type="button" class="btn-line-paper" @click="go(1)">{{ t('common.next') }} →</button>
      </div>
    </div>
  </dialog>
</template>
