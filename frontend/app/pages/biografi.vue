<script setup lang="ts">
import { biography, biographyFaq } from '~/data/biography'
import { site } from '~/data/site'

const { siteUrl } = useRuntimeConfig().public
const description = `Biografi ${site.fullName}: perjalanan karier, pendidikan, dan kiprah organisasi.`
usePageSeo({ title: 'Biografi', description, path: '/biografi', type: 'profile', image: site.photo.src })
useJsonLd([
  { '@type': 'ProfilePage', url: `${siteUrl}/biografi`, name: `Biografi ${site.name}`, mainEntity: { '@id': personId(siteUrl) } },
  {
    '@type': 'FAQPage',
    mainEntity: biographyFaq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  },
])
</script>

<template>
  <div>
    <PageHero eyebrow="Profil" title="Biografi" :lead="`Perjalanan ${site.fullName}.`" :crumbs="[{ name: 'Biografi', path: '/biografi' }]" />

    <section class="container-page grid gap-12 py-16 lg:grid-cols-[1fr_320px]">
      <div class="prose-article">
        <p v-for="(p, i) in biography.summary" :key="i">{{ p }}</p>
      </div>
      <aside class="bg-cream-100 p-6 text-[15px]">
        <img :src="site.photo.src" :alt="site.photo.alt" :width="site.photo.width" :height="site.photo.height" class="mb-6 w-full" loading="lazy" />
        <dl class="space-y-4">
          <div><dt class="text-ink-600">Jabatan</dt><dd class="font-medium">{{ site.jobTitle }} ({{ site.jobSince }} – sekarang)</dd></div>
          <div><dt class="text-ink-600">Keahlian</dt><dd class="font-medium">{{ biography.skills.join(', ') }}</dd></div>
          <div><dt class="text-ink-600">Hobi</dt><dd class="font-medium">{{ biography.hobbies.join(', ') }}</dd></div>
        </dl>
      </aside>
    </section>

    <section class="bg-cream-100">
      <div class="container-page py-16">
        <SectionHeading eyebrow="Perjalanan" title="Karier" />
        <ol class="border-t-2 border-navy-900">
          <li v-for="c in biography.career" :key="c.org" class="grid gap-2 border-b border-cream-300 py-6 sm:grid-cols-[200px_1fr]">
            <p class="font-semibold text-gold-700">{{ c.period }}</p>
            <div>
              <h3 class="font-display text-2xl font-semibold">{{ c.role }}</h3>
              <p class="text-ink-600">{{ c.org }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="container-page py-16">
      <SectionHeading eyebrow="Latar belakang" title="Pendidikan" />
      <ol class="grid gap-6 md:grid-cols-2">
        <li v-for="e in biography.education" :key="e.level" class="bg-navy-900 p-7 text-white">
          <p class="text-sm font-semibold text-gold-500">{{ e.period }}</p>
          <h3 class="mt-2 font-display text-2xl font-semibold">{{ e.level }}</h3>
          <p class="mt-1 text-navy-200">{{ e.institution }}<template v-if="e.place">, {{ e.place }}</template></p>
        </li>
      </ol>
      <p class="mt-10">
        <NuxtLink to="/organisasi" class="font-semibold text-navy-700 underline underline-offset-4">Lihat kiprah organisasi →</NuxtLink>
      </p>
    </section>

    <section class="bg-cream-100">
      <div class="container-page py-16">
        <SectionHeading eyebrow="Tanya jawab" title="Pertanyaan umum" />
        <div class="divide-y divide-cream-300 border-y border-cream-300">
          <details v-for="f in biographyFaq" :key="f.q" class="group py-5">
            <summary class="cursor-pointer list-none font-display text-xl font-semibold">{{ f.q }}</summary>
            <p class="mt-3 text-ink-600">{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>
