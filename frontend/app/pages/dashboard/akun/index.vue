<script setup lang="ts">
// Kelola akun. Rules enforced by the backend (docs/PRD.md §Modul 9):
// the superadmin cannot be changed here; nobody can deactivate/delete themselves.
import type { Admin, Envelope } from '~/types/api'

definePageMeta({ layout: 'dashboard', middleware: 'auth', i18n: false })
useHead({ title: 'Kelola akun' })

const api = useAdminApi()
const { admin: me } = useAuth()
const list = ref<Admin[]>([])
const message = ref('')

async function load() {
  list.value = (await api<Envelope<Admin[]>>('/admin/accounts')).data
}
onMounted(load)

// One dialog, three modes.
type Mode = 'create' | 'edit' | 'password'
const dialog = ref<HTMLDialogElement>()
const mode = ref<Mode>('create')
const target = ref<Admin | null>(null)
const form = reactive({ name: '', email: '', password: '' })
const errors = ref<Record<string, string>>({})
const saving = ref(false)

function open(m: Mode, a: Admin | null = null) {
  mode.value = m
  target.value = a
  Object.assign(form, { name: a?.name ?? '', email: a?.email ?? '', password: '' })
  errors.value = {}
  dialog.value?.showModal()
}

async function submit() {
  saving.value = true
  errors.value = {}
  try {
    if (mode.value === 'create') await api('/admin/accounts', { method: 'POST', body: form })
    else if (mode.value === 'edit') await api(`/admin/accounts/${target.value!.id}`, { method: 'PUT', body: { name: form.name, email: form.email } })
    else await api(`/admin/accounts/${target.value!.id}/password`, { method: 'PUT', body: { new_password: form.password } })
    dialog.value?.close()
    message.value = { create: 'Akun dibuat.', edit: 'Akun diperbarui.', password: 'Password diganti. Sesi akun tersebut diakhiri.' }[mode.value]
    await load()
  } catch (e) {
    errors.value = apiFieldErrors(e)
    if (errors.value.new_password) errors.value.password = errors.value.new_password
    if (!Object.keys(errors.value).length) errors.value = { _: apiErrorMessage(e) }
  } finally {
    saving.value = false
  }
}

async function toggle(a: Admin) {
  const verb = a.is_active ? 'Nonaktifkan' : 'Aktifkan'
  if (!confirm(`${verb} akun ${a.name}?`)) return
  try {
    await api(`/admin/accounts/${a.id}/status`, { method: 'PATCH', body: { is_active: !a.is_active } })
    await load()
  } catch (e) {
    message.value = apiErrorMessage(e)
  }
}

async function remove(a: Admin) {
  if (!confirm(`Hapus permanen akun ${a.name}? Artikel yang ditulisnya tetap ada.`)) return
  try {
    await api(`/admin/accounts/${a.id}`, { method: 'DELETE' })
    await load()
  } catch (e) {
    message.value = apiErrorMessage(e)
  }
}

const canManage = (a: Admin) => !a.is_superadmin && a.id !== me.value?.id
</script>

<template>
  <div class="max-w-5xl">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-4xl font-semibold">Kelola akun</h1>
      <button type="button" class="btn-dark" @click="open('create')">+ Tambah admin</button>
    </div>
    <p v-if="message" role="status" class="mt-6 bg-white p-4">{{ message }}</p>

    <div class="mt-6 overflow-x-auto bg-white">
      <table class="w-full min-w-[720px] text-left text-[15px]">
        <thead class="border-b border-cream-300 text-sm text-ink-600">
          <tr>
            <th class="p-4 font-medium">Nama</th>
            <th class="p-4 font-medium">Status</th>
            <th class="p-4 font-medium">Login terakhir</th>
            <th class="p-4"><span class="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-cream-300">
          <tr v-for="a in list" :key="a.id">
            <td class="p-4">
              <p class="font-medium">
                {{ a.name }}
                <span v-if="a.is_superadmin" class="ml-1 bg-navy-900 px-2 py-0.5 text-xs text-white">Super admin</span>
                <span v-if="a.id === me?.id" class="ml-1 text-sm text-ink-600">(Anda)</span>
              </p>
              <p class="text-sm text-ink-600">{{ a.email }}</p>
            </td>
            <td class="p-4">
              <span class="px-2 py-1 text-xs font-semibold" :class="a.is_active ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'">{{ a.is_active ? 'Aktif' : 'Nonaktif' }}</span>
            </td>
            <td class="p-4 text-sm text-ink-600">{{ formatDateTime(a.last_login_at) || '—' }}</td>
            <td class="p-4">
              <div v-if="canManage(a)" class="flex justify-end gap-3 text-sm">
                <button type="button" class="underline" @click="open('edit', a)">Edit</button>
                <button type="button" class="underline" @click="open('password', a)">Ganti password</button>
                <button type="button" class="underline" @click="toggle(a)">{{ a.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
                <button type="button" class="text-red-700 underline" @click="remove(a)">Hapus</button>
              </div>
              <p v-else class="text-right text-sm text-ink-600">
                <NuxtLink v-if="a.id === me?.id" to="/dashboard/pengaturan" class="underline">Ubah di Pengaturan</NuxtLink>
                <template v-else>Dilindungi</template>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog ref="dialog" class="m-auto w-full max-w-md p-0 backdrop:bg-navy-900/60" aria-labelledby="dialog-title">
      <form class="p-8" @submit.prevent="submit">
        <h2 id="dialog-title" class="font-display text-2xl font-semibold">
          {{ { create: 'Tambah admin', edit: `Edit ${target?.name}`, password: `Ganti password ${target?.name}` }[mode] }}
        </h2>
        <div class="mt-6 space-y-4">
          <template v-if="mode !== 'password'">
            <div>
              <label for="acc-name" class="field-label">Nama</label>
              <input id="acc-name" v-model="form.name" required class="field-input" />
              <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
            </div>
            <div>
              <label for="acc-email" class="field-label">Email</label>
              <input id="acc-email" v-model="form.email" type="email" required class="field-input" />
              <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
            </div>
          </template>
          <div v-if="mode !== 'edit'">
            <label for="acc-pass" class="field-label">{{ mode === 'create' ? 'Password' : 'Password baru' }}</label>
            <input id="acc-pass" v-model="form.password" type="password" autocomplete="new-password" minlength="8" required class="field-input" />
            <p class="mt-1 text-sm text-ink-600">Minimal 8 karakter.</p>
            <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
          </div>
          <p v-if="errors._" role="alert" class="field-error">{{ errors._ }}</p>
        </div>
        <div class="mt-8 flex justify-end gap-3">
          <button type="button" class="btn-outline" @click="dialog?.close()">Batal</button>
          <button type="submit" class="btn-dark" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
        </div>
      </form>
    </dialog>
  </div>
</template>
