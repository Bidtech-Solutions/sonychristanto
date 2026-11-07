<script setup lang="ts">
// /biografi (Biografi.dc.html): hero → profil → pengalaman (zig-zag) →
// pendidikan → organisasi → tanya-jawab (FAQPage JSON-LD).
import { biography, biographyFaq } from '~/data/biography'
import { organizations, orgStatus } from '~/data/organizations'
import { site } from '~/data/site'

const { t, tx, lp, period, date } = useL()
usePageSeo({ title: t('bio.title'), description: t('bio.description'), path: '/biografi', type: 'profile', image: site.ogImage })
const faq = computed(() => biographyFaq.map((f) => ({ q: tx(f.q), a: tx(f.a) })))
useJsonLd({
  '@type': 'FAQPage',
  mainEntity: faq.value.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

const active = organizations.filter((o) => orgStatus(o) === 'berjalan')
const past = organizations.filter((o) => orgStatus(o) === 'sebelumnya')
const cut = site.cutouts.crossedArms
const career = biography.career
const lastEdu = biography.education.length - 1

// Zig-zag line draws itself as the career section scrolls.
const careerLine = ref<HTMLElement>()
useGsap(careerLine, (gsap) => {
  gsap.fromTo(careerLine.value!, { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top center', ease: 'none', scrollTrigger: { trigger: careerLine.value!.parentElement!, start: 'top 75%', end: 'bottom 70%', scrub: 0.6 } })
})
</script>

<template>
  <div class="page-root">
    <!-- Hero -->
    <section class="panel grid min-h-[700px] bg-stone md:grid-cols-[1.1fr_0.9fr]">
      <span aria-hidden="true" class="font-display-x pointer-events-none absolute -right-[2%] top-[4%] whitespace-nowrap text-[30vw] font-bold leading-[0.8] tracking-[-0.04em] text-stone-ghost md:text-[15vw]">{{ t('bio.ghost') }}</span>
      <div class="relative z-[2] flex flex-col justify-between gap-10 px-5 py-10 md:px-12 md:py-14">
        <Breadcrumbs :items="[{ name: t('bio.title'), path: '/biografi' }]" />
        <div class="flex flex-col gap-5">
          <RevealText as="h1" trigger="load" class="font-display-x m-0 text-[15vw] font-bold leading-[0.86] tracking-[-0.035em] md:text-[clamp(64px,8.4vw,128px)]" :lines="[{ text: 'Sony' }, { text: 'Christanto', indent: '8%' }]" />
          <p data-reveal class="font-display-m m-0 text-[18px] font-semibold uppercase md:text-[22px]">
            {{ site.honorificSuffix }} <span class="text-signal">/</span> {{ tx(site.jobTitle) }} <span class="text-signal">/</span> {{ tx(site.commission) }}
          </p>
        </div>
        <span aria-hidden="true" />
      </div>
      <div class="relative min-h-[460px]">
        <LightGrid class="absolute left-[8%] top-[12%] h-[66%] w-[80%]" :opacity="0.45" interactive />
        <img data-reveal="up" :src="cut.src" :alt="tx(cut.alt)" :width="cut.width" :height="cut.height" fetchpriority="high" class="absolute -bottom-[30px] left-1/2 h-[460px] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_26px_34px_rgba(0,0,0,0.14)] md:h-[680px]" />
      </div>
    </section>

    <!-- 01 Profil -->
    <section id="profil" class="sec grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="flex flex-col gap-6">
        <span data-reveal class="eyebrow">01 · {{ t('bio.profile') }}</span>
        <p data-reveal class="font-display-m m-0 text-[26px] font-medium leading-[1.2] tracking-[-0.01em] md:text-[34px]">{{ tx(biography.lead) }}</p>
        <p v-for="(p, k) in biography.summary" :key="k" data-reveal class="m-0 text-[18px] leading-[1.7] text-ink-soft">{{ tx(p) }}</p>
        <blockquote data-reveal class="font-display-x mt-2 border-t border-ink pt-6 text-[34px] font-bold leading-[0.95] md:text-[44px]">“Yang Muda <span class="text-signal">Berkarya</span>.”</blockquote>
      </div>
      <aside class="flex flex-col gap-4 self-end" data-reveal>
        <dl class="m-0 mb-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink pt-5">
          <div v-if="site.showBirthDate"><dt class="label-sm text-ink-soft">{{ t('bio.born') }}</dt><dd class="font-display-m m-0 mt-1.5 text-[20px] font-semibold uppercase"><time :datetime="site.birthDate">{{ date(site.birthDate) }}</time></dd></div>
          <div><dt class="label-sm text-ink-soft">{{ t('bio.nationality') }}</dt><dd class="font-display-m m-0 mt-1.5 text-[20px] font-semibold uppercase">{{ tx(site.nationality) }}</dd></div>
          <div><dt class="label-sm text-ink-soft">{{ t('bio.degree') }}</dt><dd class="font-display-m m-0 mt-1.5 text-[20px] font-semibold uppercase">{{ site.honorificSuffix }}</dd></div>
          <div><dt class="label-sm text-ink-soft">{{ t('bio.office') }}</dt><dd class="font-display-m m-0 mt-1.5 text-[20px] font-semibold uppercase">{{ tx(site.commission) }} · {{ site.jobSince }}</dd></div>
        </dl>
        <span class="label-sm text-ink-soft">{{ t('bio.skills') }}</span>
        <ul class="flex flex-wrap gap-2">
          <li v-for="s in [...biography.skills, ...biography.hobbies]" :key="s.id" class="rounded-full border-[1.5px] border-ink px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-ink hover:text-paper">{{ tx(s) }}</li>
        </ul>
      </aside>
    </section>

    <!-- 02 Pengalaman kerja -->
    <section id="pengalaman" class="panel sec flex flex-col gap-10 bg-stone">
      <div class="flex flex-col gap-3.5">
        <span data-reveal class="eyebrow">02 · {{ t('bio.career') }}</span>
        <h2 data-reveal class="h2-display" v-html="t('bio.careerTitle')" />
      </div>
      <ol class="relative m-0 flex list-none flex-col gap-5 p-0">
        <span ref="careerLine" aria-hidden="true" class="absolute bottom-0 left-1/2 top-0 -ml-px w-0.5 bg-stone-deep max-md:hidden" />
        <li v-for="(c, k) in career" :key="c.org" class="relative grid items-center md:grid-cols-[1fr_80px_1fr]">
          <div class="flex md:justify-end" :class="k % 2 === 0 ? '' : 'md:order-1'">
            <div v-if="k % 2 === 0" :data-reveal="'left'" class="flex w-full max-w-[520px] flex-col gap-2.5 rounded-[22px] p-7 md:text-right" :class="c.end === null ? 'bg-signal text-white' : 'bg-white'">
              <span class="label-sm opacity-75">{{ period(c) }}</span>
              <h3 class="font-display-x m-0 text-[26px] font-semibold leading-[0.95] md:text-[30px]">{{ tx(c.role) }}</h3>
              <span class="text-[16px] opacity-80">{{ c.org }}<template v-if="c.orgNote"> · {{ tx(c.orgNote) }}</template></span>
            </div>
            <span v-else aria-hidden="true" class="font-display-x pr-6 text-[88px] font-bold leading-[0.85] text-stone-deep max-md:hidden">{{ c.start }}</span>
          </div>
          <div class="flex justify-center max-md:hidden" :class="k % 2 === 0 ? '' : 'md:order-2'">
            <span class="size-[22px] rounded-full border-4 border-stone shadow-[0_0_0_1.5px_#0B0B0B]" :class="c.end === null ? 'bg-signal' : 'bg-ink'" />
          </div>
          <div class="flex justify-start" :class="k % 2 === 0 ? '' : 'md:order-3'">
            <div v-if="k % 2 === 1" data-reveal="right" class="flex w-full max-w-[520px] flex-col gap-2.5 rounded-[22px] bg-white p-7">
              <span class="label-sm opacity-75">{{ period(c) }}</span>
              <h3 class="font-display-x m-0 text-[26px] font-semibold leading-[0.95] md:text-[30px]">{{ tx(c.role) }}</h3>
              <span class="text-[16px] opacity-80">{{ c.org }}</span>
            </div>
            <span v-else aria-hidden="true" class="font-display-x pl-6 text-[88px] font-bold leading-[0.85] text-stone-deep max-md:hidden">{{ c.start }}</span>
          </div>
        </li>
      </ol>
    </section>

    <!-- 03 Pendidikan -->
    <section id="pendidikan" class="sec flex flex-col gap-9">
      <div class="flex flex-wrap items-end justify-between gap-5">
        <div class="flex flex-col gap-3.5">
          <span data-reveal class="eyebrow">03 · {{ t('bio.education') }}</span>
          <h2 data-reveal class="h2-display" v-html="t('bio.educationTitle')" />
        </div>
        <span data-reveal class="label text-ink-soft">{{ t('bio.educationMeta', { n: biography.education.length }) }}</span>
      </div>
      <div class="flex flex-col gap-4">
        <figure
          v-for="(e, k) in biography.education"
          :key="e.code"
          data-reveal
          class="group m-0 grid overflow-hidden rounded-[22px] shadow-[0_1px_0_rgba(0,0,0,0.04)] md:grid-cols-[360px_minmax(0,1fr)]"
          :class="k === lastEdu ? 'bg-ink text-paper' : 'bg-white'"
        >
          <div class="relative aspect-[4/3] overflow-hidden bg-stone-deep">
            <img :src="e.image" :alt="tx(e.imageAlt)" class="size-full object-cover transition-transform duration-500 ease-[var(--ease-signal)] group-hover:scale-[1.04]" loading="lazy" decoding="async" width="1200" height="900" />
            <span aria-hidden="true" class="font-display-x absolute -bottom-2.5 left-3 text-[88px] font-bold leading-[0.85] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.25)]">{{ e.code }}</span>
          </div>
          <figcaption class="flex flex-col justify-center gap-2.5 px-6 py-7 md:px-10 md:py-8">
            <span class="label-sm opacity-75">{{ e.period }} · {{ tx(e.level) }}</span>
            <span class="font-display-m text-[28px] font-semibold uppercase leading-[0.95] tracking-[-0.01em] md:text-[40px]">{{ e.institution }}</span>
            <span class="text-[14px] opacity-80">{{ tx(e.place) }}</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- 04 Organisasi -->
    <section id="organisasi" class="panel sec flex flex-wrap items-center justify-between gap-8 bg-white md:py-14">
      <div class="flex max-w-[560px] flex-col gap-3.5">
        <span data-reveal class="eyebrow">04 · {{ t('bio.organisations') }}</span>
        <h2 data-reveal class="h2-display md:text-[48px]" v-html="t('bio.orgsTitle', { active: active.length, past: past.length })" />
        <MagneticWrap class="mt-2 self-start" data-reveal>
          <NuxtLink :to="lp('/organisasi')" class="btn-ink group">{{ t('bio.orgsCta') }} <span class="arrow-nudge text-signal group-hover:text-white">↗</span></NuxtLink>
        </MagneticWrap>
      </div>
      <ul class="flex flex-wrap gap-3">
        <li v-for="(o, k) in active" :key="o.slug" data-reveal="scale" :data-reveal-delay="k * 0.06">
          <NuxtLink :to="lp(`/organisasi/${o.slug}`)" :title="o.name" class="flex size-24 animate-floaty items-center justify-center rounded-full bg-paper transition-transform hover:scale-110" :style="{ animationDelay: `${-k * 1.1}s` }">
            <img :src="o.logo" :alt="`Logo ${o.name}`" class="size-[70%] object-contain" loading="lazy" />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- Tanya-jawab -->
    <section id="tanya-jawab" class="sec grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
      <div class="flex flex-col gap-3.5">
        <span data-reveal class="eyebrow">{{ t('bio.faq') }}</span>
        <h2 data-reveal class="h2-display" v-html="t('bio.faqTitle')" />
        <p data-reveal class="m-0 text-[15px] leading-relaxed text-ink-soft">{{ t('bio.faqLead') }}</p>
      </div>
      <FaqList :items="faq" />
    </section>
  </div>
</template>
