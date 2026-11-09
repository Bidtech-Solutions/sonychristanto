<script setup lang="ts">
// Dashboard sign-in, styled like the public site (DESIGN.md): warm paper,
// inset stone panel, display headline with a red full stop, light grid
// (desktop), white form card. No scroll reveals: the dashboard runs without
// the motion layer on purpose.
definePageMeta({ layout: false, middleware: 'auth', i18n: false })
useHead({ title: 'Masuk — Dashboard', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { login } = useAuth()
const route = useRoute()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
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
  <div class="page-wrap min-h-screen">
    <main class="panel grid min-h-[calc(100vh-20px)] grid-cols-1 bg-stone md:min-h-[calc(100vh-32px)] lg:grid-cols-[1.1fr_0.9fr]">
      <!-- Brand side -->
      <div class="relative flex min-w-0 flex-col justify-between gap-8 overflow-hidden px-5 pb-6 pt-8 md:px-12 md:pb-10 md:pt-12 lg:pb-14">
        <NuxtLink to="/id" class="group flex items-center gap-3 self-start" aria-label="Kembali ke situs Sony Christanto">
          <span class="block transition-transform duration-500 ease-[var(--ease-signal)] group-hover:rotate-[-8deg] group-hover:scale-105"><BrandMark :size="52" /></span>
          <span class="font-display-x text-[15px] font-bold leading-[0.88]">Sony<br>Christanto</span>
        </NuxtLink>
        <LightGrid class="absolute right-[6%] top-[14%] h-[52%] w-[58%] max-lg:hidden" :opacity="0.4" interactive />
        <!-- Headline sized to its own column (cqw): "DASHBOARD." is ~7.8× its font
             size wide, so 12cqw fits a phone (no indent) and 11cqw + the 8cqw md
             indent fits wider columns. -->
        <div class="@container relative z-[1] flex flex-col gap-4">
          <span class="eyebrow">Dashboard konten</span>
          <h1 class="font-display-x m-0 text-[min(12cqw,104px)] font-bold leading-[0.86] tracking-[-0.035em] md:text-[min(11cqw,104px)]">
            Masuk<br><span class="md:pl-[8cqw]">dashboard<span class="text-signal">.</span></span>
          </h1>
          <p class="m-0 max-w-[420px] text-[17px] leading-relaxed text-ink-soft md:text-[18px]">Kelola artikel, akun admin, dan pengaturan situs Sony Christanto.</p>
        </div>
      </div>

      <!-- Form side -->
      <div class="flex items-center justify-center px-5 pb-8 md:px-12 md:pb-12 lg:py-14 lg:pl-0">
        <form class="flex w-full max-w-[440px] flex-col gap-6 rounded-[20px] bg-white p-6 shadow-[0_24px_50px_rgba(0,0,0,0.06)] md:p-9" @submit.prevent="submit">
          <div class="flex flex-col gap-1.5">
            <span class="label-sm text-signal-ink">Akses admin</span>
            <h2 class="font-display-m m-0 text-[26px] font-bold uppercase leading-none tracking-[-0.01em]">Masuk ke akun</h2>
          </div>

          <div class="flex flex-col gap-2">
            <label for="email" class="label-sm text-ink-soft">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              inputmode="email"
              required
              placeholder="nama@email.com"
              class="h-13 w-full rounded-xl border-[1.5px] border-stone-deep bg-paper px-4 text-[16px] text-ink transition-colors placeholder:text-ink-ghost focus:border-ink focus:bg-white focus:outline-none"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="label-sm text-ink-soft">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="h-13 w-full rounded-xl border-[1.5px] border-stone-deep bg-paper pl-4 pr-24 text-[16px] text-ink transition-colors focus:border-ink focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                class="label-sm absolute inset-y-1.5 right-1.5 rounded-lg px-3 text-ink-soft transition-colors hover:bg-stone hover:text-ink"
                :aria-pressed="showPassword"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              >{{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}</button>
            </div>
          </div>

          <p v-if="error" role="alert" class="m-0 rounded-xl bg-signal-tint px-4 py-3 text-[14px] font-medium text-signal-ink">{{ error }}</p>

          <button type="submit" class="btn-signal group w-full justify-between px-6" :disabled="loading">
            <span>{{ loading ? 'Memproses…' : 'Masuk' }}</span>
            <span class="arrow-nudge" aria-hidden="true">↗</span>
          </button>

          <NuxtLink to="/id" class="label-sm self-start text-ink-soft transition-colors hover:text-signal-ink">← Kembali ke situs</NuxtLink>
        </form>
      </div>
    </main>
  </div>
</template>
