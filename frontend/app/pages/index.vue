<script setup lang="ts">
// Landing page (DESIGN.md §7, Landing.dc.html):
// Hero "Sampul Majalah" → Statement + fakta → Mengenal (kartu) → Jejak pendidikan
// → Kabar & gagasan → Kiprah organisasi → CTA (panel tinta).
// ISR (not SSG) because it shows the latest articles.
import { biography, profileCards } from '~/data/biography'
import { ongoingOrganizations } from '~/data/organizations'
import { categories, site } from '~/data/site'
import type { Envelope, PublicArticle } from '~/types/api'

const { t, tx, lp } = useL()
usePageSeo({ description: tx(site.description), path: '/', type: 'profile', image: site.ogImage })
useJsonLd({ '@type': 'ProfilePage', mainEntity: { '@id': personId(useRuntimeConfig().public.siteUrl) } })

// Article sections degrade gracefully: if the API is down the page still renders.
const latest = (category: string) =>
  useFetch<Envelope<PublicArticle[]>>('/api/v1/articles', {
    query: { category, per_page: 3 },
    key: `home-${category}`,
    default: () => ({ data: [] }) as unknown as Envelope<PublicArticle[]>,
  })
const results = await Promise.all(categories.map((c) => latest(c.key)))
const byCategory = computed(() => Object.fromEntries(categories.map((c, k) => [c.key, results[k]!.data.value?.data ?? []])))
const latestPerspective = computed(() => byCategory.value['perspektif-sony']?.[0] ?? null)

const ongoing = ongoingOrganizations()
const firstCareer = biography.career[biography.career.length - 1]!.start
const stats = computed(() => [
  { value: firstCareer, label: t('home.statCareer') },
  { value: ongoing.length, label: t('home.statOrgs') },
  { value: site.jobSince, label: t('home.statCouncil') },
  { value: biography.education.length, label: t('home.statEdu') },
])

// Biography card scroller
const scroller = ref<HTMLElement>()
const scrollCards = (dir: number) => scroller.value?.scrollBy({ left: dir * 316, behavior: 'smooth' })
</script>

<template>
  <div class="page-root">
    <HomeHero :latest="latestPerspective" />

    <!-- Statement + quick facts -->
    <section class="sec flex flex-col gap-[72px] md:pb-[72px] md:pt-24">
      <div class="grid items-end gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <InkStatement
          class="font-display-x m-0 text-[13vw] font-bold leading-[0.88] tracking-[-0.035em] md:text-[clamp(52px,7vw,104px)]"
          :lines="[{ text: 'Yang' }, { text: 'Muda', indent: '14%' }, { text: 'Berkarya', accentLast: true }]"
        />
        <div class="flex flex-col gap-6 pb-3">
          <span data-reveal class="label text-ink-soft">{{ t('home.statementLabel') }}</span>
          <p data-reveal class="m-0 text-[19px] leading-relaxed md:text-[20px]">{{ tx(biography.short[0]) }}</p>
          <p data-reveal class="m-0 text-[17px] leading-relaxed text-ink-soft">{{ tx(biography.short[1]) }}</p>
          <MagneticWrap class="self-start" data-reveal>
            <NuxtLink :to="lp('/biografi')" class="btn-ink group">{{ t('home.readBio') }} <span class="arrow-nudge text-signal group-hover:text-white">↗</span></NuxtLink>
          </MagneticWrap>
        </div>
      </div>
      <dl class="grid grid-cols-2 gap-y-7 border-t border-stone-deep pt-8 lg:grid-cols-4">
        <div v-for="(s, k) in stats" :key="s.label" data-reveal :data-reveal-delay="k * 0.08" class="flex flex-col-reverse gap-2.5 px-0 lg:px-6" :class="k > 0 ? 'lg:border-l lg:border-stone-deep' : 'lg:pl-0'">
          <dt class="label flex items-center gap-2 text-ink-soft"><span aria-hidden="true" class="size-2 bg-signal" />{{ s.label }}</dt>
          <dd class="font-display-x m-0 text-[48px] font-semibold leading-[0.9] md:text-[72px]"><CountUp :value="s.value" /></dd>
        </div>
      </dl>
    </section>

    <!-- Mengenal Sony Christanto -->
    <section id="biografi" class="panel sec flex flex-col gap-10 bg-stone">
      <SectionHead :title="t('home.getToKnow')">
        <div class="flex items-center gap-3" data-reveal>
          <NuxtLink :to="lp('/biografi')" class="label group mr-2 hover:text-signal-ink">{{ t('home.fullBio') }} <span class="arrow-nudge text-signal">↗</span></NuxtLink>
          <button type="button" :aria-label="t('home.prevCard')" class="inline-flex size-12 items-center justify-center rounded-full border-[1.5px] border-ink transition-colors hover:bg-ink hover:text-paper" @click="scrollCards(-1)">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" :aria-label="t('home.nextCard')" class="inline-flex size-12 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-signal" @click="scrollCards(1)">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </SectionHead>
      
      <div ref="scroller" class="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-1 py-2 [scrollbar-width:thin]">
        <NuxtLink
          v-for="(c, k) in profileCards"
          :key="c.no"
          :to="lp(`/biografi#${c.anchor}`)"
          data-reveal
          :data-reveal-delay="k * 0.06"
          class="group flex min-h-[340px] flex-[0_0_300px] snap-start flex-col justify-between rounded-[20px] p-7 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-transform duration-500 ease-[var(--ease-signal)] hover:-translate-y-1.5"
          :class="c.featured ? 'bg-signal text-white' : 'bg-white'"
        >
          <span class="font-display-x text-[72px] font-semibold leading-[0.85] transition-transform duration-700 ease-[var(--ease-signal)] group-hover:-translate-y-1" :class="c.featured ? 'text-white/45' : 'text-stone-deep group-hover:text-signal'">{{ c.no }}</span>
          <span class="flex flex-col gap-3">
            <span class="font-display-x text-[24px] font-semibold">{{ tx(c.title) }}</span>
            <span class="text-[15px] leading-normal" :class="c.featured ? '' : 'text-ink-soft'">{{ tx(c.text) }}</span>
            <span class="label">{{ t('common.more') }} <span class="arrow-nudge" :class="c.featured ? '' : 'text-signal'">↗</span></span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <EduJourney />

    <HomeNews :by-category="byCategory" />

    <!-- Kiprah organisasi -->
    <section id="organisasi" class="sec flex flex-col gap-10 md:pb-24 md:pt-6">
      <SectionHead :title="t('home.orgTitle')">
        <span class="label text-ink-soft" data-reveal>{{ t('home.orgCurrent') }}</span>
      </SectionHead>
      <div class="flex flex-col border-t border-ink">
        <OrgIndexRow v-for="o in ongoing.slice(0, 4)" :key="o.slug" :org="o" />
      </div>
      <MagneticWrap class="self-start">
        <NuxtLink :to="lp('/organisasi')" class="btn-line group">{{ t('home.allOrgs') }} <span class="arrow-nudge text-signal group-hover:text-white">↗</span></NuxtLink>
      </MagneticWrap>
    </section>

    <HomeCta />
  </div>
</template>
