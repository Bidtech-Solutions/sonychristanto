<script setup lang="ts">
import type { Admin, Envelope } from '~/types/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth', i18n: false })
useHead({ title: 'Pengaturan' })

const api = useAdminApi()
const { admin } = useAuth()

const profile = reactive({ name: admin.value?.name ?? '', email: admin.value?.email ?? '', avatar_url: admin.value?.avatar_url ?? null })
const profileErrors = ref<Record<string, string>>({})
const profileMsg = ref('')
const savingProfile = ref(false)

async function saveProfile() {
  savingProfile.value = true
  profileErrors.value = {}
  profileMsg.value = ''
  try {
    const res = await api<Envelope<Admin>>('/admin/profile', { method: 'PUT', body: { ...profile, avatar_url: profile.avatar_url ?? '' } })
    admin.value = res.data
    profileMsg.value = 'Profil disimpan.'
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
const savingPw = ref(false)

async function changePassword() {
  pwErrors.value = {}
  pwMsg.value = ''
  if (pw.new_password !== pw.confirm) {
    pwErrors.value = { confirm: 'Konfirmasi password tidak sama' }
    return
  }
  savingPw.value = true
  try {
    await api('/admin/profile/password', { method: 'PUT', body: { current_password: pw.current_password, new_password: pw.new_password } })
    Object.assign(pw, { current_password: '', new_password: '', confirm: '' })
    pwMsg.value = 'Password diganti. Sesi di perangkat lain telah diakhiri.'
  } catch (e) {
    pwErrors.value = apiFieldErrors(e)
    if (!Object.keys(pwErrors.value).length) pwMsg.value = apiErrorMessage(e)
  } finally {
    savingPw.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-10">
    <h1 class="font-display text-4xl font-semibold">Pengaturan</h1>

    <form class="space-y-5 bg-white p-6" @submit.prevent="saveProfile">
      <h2 class="text-xl font-semibold">Profil</h2>
      <ImageUploadField v-model="profile.avatar_url" label="Foto profil" purpose="avatar" round hint="Dipotong persegi 512×512, WebP." />
      <div>
        <label for="p-name" class="field-label">Nama</label>
        <input id="p-name" v-model="profile.name" required class="field-input" />
        <p v-if="profileErrors.name" class="field-error">{{ profileErrors.name }}</p>
      </div>
      <div>
        <label for="p-email" class="field-label">Email</label>
        <input id="p-email" v-model="profile.email" type="email" required class="field-input" />
        <p v-if="profileErrors.email" class="field-error">{{ profileErrors.email }}</p>
      </div>
      <p v-if="profileMsg" role="status">{{ profileMsg }}</p>
      <button type="submit" class="btn-dark" :disabled="savingProfile">{{ savingProfile ? 'Menyimpan…' : 'Simpan profil' }}</button>
    </form>

    <form class="space-y-5 bg-white p-6" @submit.prevent="changePassword">
      <h2 class="text-xl font-semibold">Ganti password</h2>
      <div>
        <label for="pw-current" class="field-label">Password saat ini</label>
        <input id="pw-current" v-model="pw.current_password" type="password" autocomplete="current-password" required class="field-input" />
        <p v-if="pwErrors.current_password" class="field-error">{{ pwErrors.current_password }}</p>
      </div>
      <div>
        <label for="pw-new" class="field-label">Password baru</label>
        <input id="pw-new" v-model="pw.new_password" type="password" autocomplete="new-password" minlength="8" required class="field-input" />
        <p v-if="pwErrors.new_password" class="field-error">{{ pwErrors.new_password }}</p>
      </div>
      <div>
        <label for="pw-confirm" class="field-label">Ulangi password baru</label>
        <input id="pw-confirm" v-model="pw.confirm" type="password" autocomplete="new-password" required class="field-input" />
        <p v-if="pwErrors.confirm" class="field-error">{{ pwErrors.confirm }}</p>
      </div>
      <p v-if="pwMsg" role="status">{{ pwMsg }}</p>
      <button type="submit" class="btn-dark" :disabled="savingPw">{{ savingPw ? 'Menyimpan…' : 'Ganti password' }}</button>
    </form>
  </div>
</template>
