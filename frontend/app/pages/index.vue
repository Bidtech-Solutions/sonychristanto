<script setup lang="ts">
// Landing page — versi 1 dari usulan brainstorming (docs/PRD.md §Modul 1).
// Section order: Hero → Sekilas → Perspektif → Agenda → Kiprah → CTA kontak.
// ISR (not SSG) because it shows the latest articles.
import { biography } from '~/data/biography'
import { isOngoing, organizations, periodLabel } from '~/data/organizations'
import { site } from '~/data/site'
import type { Envelope, PublicArticle } from '~/types/api'

usePageSeo({ description: site.description, path: '/', type: 'profile', image: site.ogImage })

// Article sections degrade gracefully: if the API is down the page still renders.
const latest = (category: string) =>
  useFetch<Envelope<PublicArticle[]>>('/api/v1/articles', {
    query: { category, per_page: 3 },
    key: `home-${category}`,
    default: () => ({ data: [] }) as unknown as Envelope<PublicArticle[]>,
  })
const [{ data: perspektif }, { data: agenda }] = await Promise.all([latest('perspektif-sony'), latest('agenda-sony')])

const ongoing = organizations.filter((o) => o.kind === 'organisasi' && isOngoing(o)).slice(0, 6)
const stats = [
  { value: String(biography.career[biography.career.length - 1]!.start), label: 'Awal karier profesional' },
  { value: String(organizations.filter((o) => o.kind === 'organisasi').length), label: 'Organisasi & lembaga' },
  { value: String(site.jobSince), label: site.jobTitle },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-navy-900 text-white">
      <div class="container-page grid items-center gap-12 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
        <div>
          <p class="mb-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-gold-500">{{ site.jobTitle }} · {{ site.jobSince }} – sekarang</p>
          <h1 class="font-display text-5xl leading-[1.02] font-bold sm:text-7xl">{{ site.name }}</h1>
          <p class="mt-2 font-display text-2xl text-navy-200">{{ site.honorificSuffix }}</p>
          <p class="mt-8 max-w-xl text-lg text-navy-100">{{ biography.summary[0] }}</p>
          <div class="mt-10 flex flex-wrap gap-4">
            <NuxtLink to="/biografi" class="btn-primary">Kenali lebih dekat</NuxtLink>
            <NuxtLink to="/kontak" class="btn-outline text-white">Hubungi</NuxtLink>
          </div>
        </div>
        <div class="mx-auto w-full max-w-sm">
          <img
            :src="site.photo.src"
            :alt="site.photo.alt"
            :width="site.photo.width"
            :height="site.photo.height"
            fetchpriority="high"
            class="w-full bg-navy-800 object-cover shadow-[16px_16px_0_var(--color-gold-500)]"
          />
        </div>
      </div>
    </section>

    <!-- Sekilas -->
    <section class="bg-cream-100">
      <dl class="container-page grid gap-8 py-12 sm:grid-cols-3">
        <div v-for="s in stats" :key="s.label" class="flex flex-col-reverse">
          <dt class="mt-2 text-[15px] text-ink-600">{{ s.label }}</dt>
          <dd class="font-display text-5xl font-bold">{{ s.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- Perspektif Sony -->
    <section class="container-page py-20">
      <SectionHeading eyebrow="Pandangan" title="Perspektif Sony" :link="{ to: '/blog/kategori/perspektif-sony', label: 'Semua perspektif' }" />
      <div v-if="perspektif?.data.length" class="grid gap-x-8 gap-y-12 md:grid-cols-3">
        <ArticleCard v-for="a in perspektif.data" :key="a.slug" :article="a" />
      </div>
      <EmptyState v-else title="Segera hadir" text="Tulisan Perspektif Sony akan tampil di sini." />
    </section>

    <!-- Agenda Sony -->
    <section class="bg-cream-100">
      <div class="container-page py-20">
        <SectionHeading eyebrow="Kegiatan" title="Agenda Sony" :link="{ to: '/blog/kategori/agenda-sony', label: 'Semua agenda' }" />
        <div v-if="agenda?.data.length" class="grid gap-x-8 gap-y-12 md:grid-cols-3">
          <ArticleCard v-for="a in agenda.data" :key="a.slug" :article="a" />
        </div>
        <EmptyState v-else title="Segera hadir" text="Catatan kegiatan akan tampil di sini." />
      </div>
    </section>

    <!-- Kiprah -->
    <section class="container-page py-20">
      <SectionHeading eyebrow="Kiprah" title="Organisasi yang dipimpin saat ini" :link="{ to: '/organisasi', label: 'Semua organisasi' }" />
      <ul class="grid gap-px bg-cream-300 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="o in ongoing" :key="o.slug" class="bg-white">
          <NuxtLink :to="`/organisasi/${o.slug}`" class="block h-full p-6 hover:bg-cream-100">
            <p class="text-sm font-semibold text-gold-700">{{ periodLabel(o) }}</p>
            <p class="mt-2 font-display text-xl font-semibold">{{ o.name }}</p>
            <p v-if="o.role" class="mt-1 text-ink-600">{{ o.role }}</p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- CTA -->
    <section class="bg-navy-900 text-white">
      <div class="container-page flex flex-wrap items-center justify-between gap-8 py-16">
        <div>
          <h2 class="font-display text-4xl font-semibold">Sampaikan aspirasi Anda</h2>
          <p class="mt-3 max-w-xl text-navy-100">Untuk aspirasi, undangan kegiatan, atau korespondensi, hubungi kantor {{ site.name }}.</p>
        </div>
        <NuxtLink to="/kontak" class="btn-primary">Lihat kontak</NuxtLink>
      </div>
    </section>
  </div>
</template>
