<script setup lang="ts">
import { gallery } from '~/data/gallery'

usePageSeo({ title: 'Galeri', description: 'Dokumentasi foto kegiatan Sony Christanto.', path: '/galeri', image: gallery[0]?.src })
const { siteUrl } = useRuntimeConfig().public
if (gallery.length) {
  useJsonLd({
    '@type': 'ImageGallery',
    name: 'Galeri Sony Christanto',
    url: `${siteUrl}/galeri`,
    image: gallery.map((g) => ({ '@type': 'ImageObject', contentUrl: siteUrl + g.src, caption: g.caption ?? g.alt, width: g.width, height: g.height })),
  })
}

const tile: Record<string, string> = {
  sm: '',
  wide: 'sm:col-span-2',
  tall: 'sm:row-span-2',
  lg: 'sm:col-span-2 sm:row-span-2',
}
const active = ref<number | null>(null)
</script>

<template>
  <div>
    <PageHero eyebrow="Dokumentasi" title="Galeri" lead="Potret kegiatan dan perjalanan Sony Christanto." :crumbs="[{ name: 'Galeri', path: '/galeri' }]" />
    <section class="container-page py-16">
      <ul v-if="gallery.length" class="grid auto-rows-[220px] grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(g, i) in gallery" :key="g.src" :class="tile[g.size ?? 'sm']">
          <button type="button" class="group relative block h-full w-full overflow-hidden bg-cream-100" :aria-label="`Lihat foto: ${g.alt}`" @click="active = i">
            <img :src="g.src" :alt="g.alt" :width="g.width" :height="g.height" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          </button>
        </li>
      </ul>
      <EmptyState v-else title="Segera hadir" text="Foto kegiatan sedang dikurasi." />
    </section>
    <GalleryLightbox v-model="active" :items="gallery" />
  </div>
</template>
