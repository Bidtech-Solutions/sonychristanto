<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useHead({ title: notFound.value ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan' })
useSeoMeta({ robots: 'noindex' })
</script>

<template>
  <NuxtLayout name="default">
    <section class="container-page py-24 text-center">
      <p class="eyebrow">{{ error.statusCode }}</p>
      <h1 class="heading-xl mt-3">{{ notFound ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan' }}</h1>
      <p class="mx-auto mt-4 max-w-md text-ink-600">
        {{ notFound ? 'Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.' : 'Silakan coba beberapa saat lagi.' }}
      </p>
      <button type="button" class="btn-dark mt-8" @click="clearError({ redirect: '/' })">Kembali ke beranda</button>
    </section>
  </NuxtLayout>
</template>
