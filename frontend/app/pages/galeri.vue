<script setup lang="ts">
import { gallery } from '~/data/gallery'

const { t, tx, lp } = useL()
usePageSeo({ title: t('gallery.title'), description: t('gallery.description'), path: '/galeri', image: gallery[0]?.src })
const { siteUrl } = useRuntimeConfig().public
if (gallery.length) {
  useJsonLd({
    '@type': 'ImageGallery',
    name: t('gallery.title'),
    url: siteUrl + lp('/galeri'),
    image: gallery.map((g) => ({ '@type': 'ImageObject', contentUrl: siteUrl + g.src, caption: tx(g.caption ?? g.alt), width: g.width, height: g.height })),
  })
}

// Bento tiles: 'lg' = 2x2, 'wide' = 2x1, 'tall' = 1x2, 'sm' = 1x1.
const tile: Record<string, string> = { sm: '', wide: 'sm:col-span-2', tall: 'sm:row-span-2', lg: 'sm:col-span-2 sm:row-span-2' }
const active = ref<number | null>(null)
</script>

<template>
  <div class="page-root">
    <PageHero :lines="[t('gallery.title')]" :lead="t('gallery.lead')" :crumbs="[{ name: t('gallery.title'), path: '/galeri' }]" />
    <section class="sec">
      <ul v-if="gallery.length" class="m-0 grid list-none auto-rows-[220px] grid-flow-dense grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(g, i) in gallery" :key="g.src" :class="tile[g.size ?? 'sm']" data-reveal="scale" :data-reveal-delay="(i % 8) * 0.05">
          <button type="button" class="group relative block size-full overflow-hidden rounded-[20px] bg-stone" :aria-label="t('gallery.view', { alt: tx(g.alt) })" @click="active = i">
            <img :src="g.src" :alt="tx(g.alt)" :width="g.width" :height="g.height" loading="lazy" decoding="async" class="size-full object-cover transition-transform duration-700 ease-[var(--ease-signal)] group-hover:scale-[1.05]" />
            <span v-if="g.caption" class="absolute inset-x-3 bottom-3 translate-y-2 rounded-xl bg-paper/95 px-3 py-2 text-left text-[13px] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">{{ tx(g.caption) }}</span>
          </button>
        </li>
      </ul>
      <EmptyState v-else :text="t('gallery.emptyText')" />
    </section>
    <GalleryLightbox v-model="active" :items="gallery" />
  </div>
</template>
