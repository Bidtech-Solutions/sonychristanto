<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth', i18n: false })
useHead({ title: 'Masuk — Dashboard', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { login } = useAuth()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    await navigateTo((route.query.redirect as string) || '/dashboard')
  } catch (e) {
    error.value = apiErrorMessage(e, 'Gagal masuk. Periksa koneksi Anda.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-navy-900 p-5">
    <form class="w-full max-w-sm bg-white p-8" @submit.prevent="submit">
      <h1 class="font-display text-3xl font-semibold">Masuk dashboard</h1>
      <p class="mt-1 text-ink-600">Situs Sony Christanto</p>
      <div class="mt-8 space-y-5">
        <div>
          <label for="email" class="field-label">Email</label>
          <input id="email" v-model="email" type="email" autocomplete="username" required class="field-input" />
        </div>
        <div>
          <label for="password" class="field-label">Password</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required class="field-input" />
        </div>
      </div>
      <p v-if="error" role="alert" class="field-error mt-4">{{ error }}</p>
      <button type="submit" class="btn-dark mt-8 w-full" :disabled="loading">{{ loading ? 'Memproses…' : 'Masuk' }}</button>
    </form>
  </main>
</template>
