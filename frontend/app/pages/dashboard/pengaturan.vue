<script setup lang="ts">
import { KeyRound, Lock, LogOut, Save, UserRound } from 'lucide-vue-next'
import type { Admin, Envelope } from '~/types/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth', i18n: false })
useHead({ title: 'Pengaturan' })

const api = useAdminApi()
const { admin, logout } = useAuth()

// Same field style as the sign-in page (pages/dashboard/login.vue).
const inputCls =
  'h-12 w-full rounded-xl border-[1.5px] border-stone-deep bg-paper px-4 text-[16px] text-ink transition-colors focus:border-ink focus:bg-white focus:outline-none aria-[invalid=true]:border-signal'

const profile = reactive({ name: admin.value?.name ?? '', email: admin.value?.email ?? '', avatar_url: admin.value?.avatar_url ?? null })
const profileErrors = ref<Record<string, string>>({})
const profileMsg = ref('')
const profileOk = ref(false)
const savingProfile = ref(false)

async function saveProfile() {
  savingProfile.value = true
  profileErrors.value = {}
  profileMsg.value = ''
  profileOk.value = false
  try {
    const res = await api<Envelope<Admin>>('/admin/profile', { method: 'PUT', body: { ...profile, avatar_url: profile.avatar_url ?? '' } })
    admin.value = res.data
    profileMsg.value = 'Profil disimpan.'
    profileOk.value = true
  } catch (e) {
    profileErrors.value = apiFieldErrors(e)
    if (!Object.keys(profileErrors.value).length) profileMsg.value = apiErrorMessage(e)
  } finally {
    savingProfile.value = false
  }
}

const pw = reactive({ current_password: '', new_password: '', confirm: '' })
const pwErrors = ref<Record<string, string>>({})
const pwMsg = ref('')
const pwOk = ref(false)
const savingPw = ref(false)

async function changePassword() {
  pwErrors.value = {}
  pwMsg.value = ''
  pwOk.value = false
  if (pw.new_password !== pw.confirm) {
    pwErrors.value = { confirm: 'Konfirmasi password tidak sama' }
    return
  }
  savingPw.value = true
  try {
    await api('/admin/profile/password', { method: 'PUT', body: { current_password: pw.current_password, new_password: pw.new_password } })
    Object.assign(pw, { current_password: '', new_password: '', confirm: '' })
    pwMsg.value = 'Password diganti. Sesi di perangkat lain telah diakhiri.'
    pwOk.value = true
  } catch (e) {
    pwErrors.value = apiFieldErrors(e)
    if (!Object.keys(pwErrors.value).length) pwMsg.value = apiErrorMessage(e)
  } finally {
    savingPw.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <DashPageHeader eyebrow="Akun Anda" title="Pengaturan" description="Perbarui profil yang tampil di dashboard dan ganti password akun Anda.">
      <template #actions>
        <button type="button" class="btn-line" @click="logout"><LogOut class="size-4" aria-hidden="true" />Keluar</button>
      </template>
    </DashPageHeader>

    <!-- Profil -->
    <form class="grid gap-6 rounded-[20px] bg-white p-6 md:p-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10" @submit.prevent="saveProfile">
      <div class="flex flex-col gap-2">
        <span aria-hidden="true" class="mb-1 flex size-10 items-center justify-center rounded-xl bg-paper text-ink"><UserRound class="size-5" /></span>
        <h2 class="font-display-m m-0 text-[22px] font-bold uppercase leading-none">Profil</h2>
        <p class="m-0 text-[14px] leading-relaxed text-ink-soft">Nama dan foto dipakai di sidebar dashboard. Email dipakai untuk masuk.</p>
      </div>
      <div class="flex min-w-0 flex-col gap-6">
        <ImageUploadField v-model="profile.avatar_url" label="Foto profil" purpose="avatar" round label-class="label-sm mb-2 text-ink-soft" hint="Dipotong persegi 512×512, WebP." />
        <div class="grid gap-5 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label for="p-name" class="label-sm text-ink-soft">Nama</label>
            <input id="p-name" v-model="profile.name" required :class="inputCls" :aria-invalid="!!profileErrors.name" />
            <p v-if="profileErrors.name" class="m-0 text-[14px] text-signal-ink">{{ profileErrors.name }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <label for="p-email" class="label-sm text-ink-soft">Email</label>
            <input id="p-email" v-model="profile.email" type="email" required autocomplete="email" :class="inputCls" :aria-invalid="!!profileErrors.email" />
            <p v-if="profileErrors.email" class="m-0 text-[14px] text-signal-ink">{{ profileErrors.email }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4 border-t border-stone pt-5">
          <p v-if="profileMsg" role="status" class="m-0 rounded-xl px-4 py-2.5 text-[14px] font-medium" :class="profileOk ? 'bg-stone text-ink' : 'bg-signal-tint text-signal-ink'">{{ profileOk ? '✓ ' : '' }}{{ profileMsg }}</p>
          <span v-else />
          <button type="submit" class="btn-ink" :disabled="savingProfile"><Save class="size-4" aria-hidden="true" />{{ savingProfile ? 'Menyimpan…' : 'Simpan profil' }}</button>
        </div>
      </div>
    </form>

    <!-- Password -->
    <form class="grid gap-6 rounded-[20px] bg-white p-6 md:p-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10" @submit.prevent="changePassword">
      <div class="flex flex-col gap-2">
        <span aria-hidden="true" class="mb-1 flex size-10 items-center justify-center rounded-xl bg-paper text-ink"><Lock class="size-5" /></span>
        <h2 class="font-display-m m-0 text-[22px] font-bold uppercase leading-none">Ganti password</h2>
        <p class="m-0 text-[14px] leading-relaxed text-ink-soft">Minimal 8 karakter. Setelah diganti, sesi di perangkat lain otomatis diakhiri.</p>
      </div>
      <div class="flex min-w-0 flex-col gap-5">
        <div class="flex flex-col gap-2 md:max-w-[calc(50%-10px)]">
          <label for="pw-current" class="label-sm text-ink-soft">Password saat ini</label>
          <input id="pw-current" v-model="pw.current_password" type="password" autocomplete="current-password" required :class="inputCls" :aria-invalid="!!pwErrors.current_password" />
          <p v-if="pwErrors.current_password" class="m-0 text-[14px] text-signal-ink">{{ pwErrors.current_password }}</p>
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label for="pw-new" class="label-sm text-ink-soft">Password baru</label>
            <input id="pw-new" v-model="pw.new_password" type="password" autocomplete="new-password" minlength="8" required :class="inputCls" :aria-invalid="!!pwErrors.new_password" />
            <p v-if="pwErrors.new_password" class="m-0 text-[14px] text-signal-ink">{{ pwErrors.new_password }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <label for="pw-confirm" class="label-sm text-ink-soft">Ulangi password baru</label>
            <input id="pw-confirm" v-model="pw.confirm" type="password" autocomplete="new-password" required :class="inputCls" :aria-invalid="!!pwErrors.confirm" />
            <p v-if="pwErrors.confirm" class="m-0 text-[14px] text-signal-ink">{{ pwErrors.confirm }}</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4 border-t border-stone pt-5">
          <p v-if="pwMsg" role="status" class="m-0 rounded-xl px-4 py-2.5 text-[14px] font-medium" :class="pwOk ? 'bg-stone text-ink' : 'bg-signal-tint text-signal-ink'">{{ pwOk ? '✓ ' : '' }}{{ pwMsg }}</p>
          <span v-else />
          <button type="submit" class="btn-ink" :disabled="savingPw"><KeyRound class="size-4" aria-hidden="true" />{{ savingPw ? 'Menyimpan…' : 'Ganti password' }}</button>
        </div>
      </div>
    </form>
  </div>
</template>
