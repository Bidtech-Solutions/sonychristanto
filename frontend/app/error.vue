<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t, lp } = useL()
const notFound = computed(() => props.error.statusCode === 404)
useHead({ title: notFound.value ? t('error.notFound') : t('error.generic') })
useSeoMeta({ robots: 'noindex' })
</script>

<template>
  <NuxtLayout name="default">
    <div class="page-root">
      <section class="panel flex min-h-[560px] flex-col items-start justify-center gap-6 bg-stone px-5 py-14 md:px-12">
        <LightGrid class="absolute right-[6%] top-[14%] h-[60%] w-[34%] max-md:hidden" :opacity="0.35" />
        <span class="font-display-x relative text-[28vw] font-bold leading-[0.8] text-stone-deep md:text-[220px]">{{ error.statusCode }}</span>
        <h1 class="font-display-x relative m-0 text-[44px] font-bold leading-[0.9] md:text-[72px]">{{ notFound ? t('error.notFound') : t('error.generic') }}<span class="text-signal">.</span></h1>
        <p class="relative m-0 max-w-md text-[18px] text-ink-soft">{{ notFound ? t('error.notFoundText') : t('error.genericText') }}</p>
        <button type="button" class="btn-ink relative" @click="clearError({ redirect: lp('/') })">{{ t('common.backHome') }} <span class="text-signal">↗</span></button>
      </section>
    </div>
  </NuxtLayout>
</template>
