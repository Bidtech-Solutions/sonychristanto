<script setup lang="ts">
// Kelola akun. Rules enforced by the backend (docs/PRD.md §Modul 9):
// the superadmin cannot be changed here; nobody can deactivate/delete themselves.
import { KeyRound, Pencil, Power, PowerOff, Save, ShieldCheck, Trash2, UserPlus, X } from 'lucide-vue-next'
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

// Same field style as the sign-in and settings pages.
const inputCls =
  'h-12 w-full rounded-xl border-[1.5px] border-stone-deep bg-paper px-4 text-[16px] text-ink transition-colors focus:border-ink focus:bg-white focus:outline-none'
const iconBtn = 'inline-flex size-9 items-center justify-center rounded-full border-[1.5px] border-stone-deep transition-colors hover:border-ink hover:bg-ink hover:text-paper'
const modeIcon = { create: UserPlus, edit: Pencil, password: KeyRound }
const dialogTitle = computed(() => ({ create: 'Tambah admin', edit: `Edit ${target.value?.name ?? ''}`, password: `Ganti password ${target.value?.name ?? ''}` })[mode.value])
const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
const canManage = (a: Admin) => !a.is_superadmin && a.id !== me.value?.id
</script>

<template>
  <div class="flex flex-col gap-8">
    <DashPageHeader eyebrow="Akses" title="Kelola akun" description="Tambah admin, ubah data, atur password, dan aktif/nonaktifkan akses.">
      <template #actions>
        <button type="button" class="btn-signal" @click="open('create')"><UserPlus class="size-4" aria-hidden="true" />Tambah admin</button>
      </template>
    </DashPageHeader>

    <p v-if="message" role="status" class="m-0 rounded-xl bg-stone px-4 py-3 text-[14px] font-medium text-ink">{{ message }}</p>

    <div class="overflow-x-auto rounded-[20px] bg-white">
      <table class="w-full min-w-[760px] text-left text-[15px]">
        <thead class="border-b border-stone">
          <tr class="label-sm text-ink-soft">
            <th class="px-5 py-4 font-semibold">Nama</th>
            <th class="px-5 py-4 font-semibold">Status</th>
            <th class="px-5 py-4 font-semibold">Login terakhir</th>
            <th class="px-5 py-4 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in list" :key="a.id" class="border-b border-stone transition-colors last:border-b-0 hover:bg-paper/60">
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <img v-if="a.avatar_url" :src="a.avatar_url" alt="" class="size-10 flex-none rounded-full object-cover" />
                <span v-else aria-hidden="true" class="font-display-x flex size-10 flex-none items-center justify-center rounded-full bg-ink text-[13px] font-bold text-paper">{{ initials(a.name) }}</span>
                <div class="min-w-0">
                  <p class="m-0 flex flex-wrap items-center gap-2 font-semibold">
                    {{ a.name }}
                    <span v-if="a.is_superadmin" class="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-paper"><ShieldCheck class="size-3" aria-hidden="true" />Super admin</span>
                    <span v-if="a.id === me?.id" class="text-[13px] font-normal text-ink-soft">(Anda)</span>
                  </p>
                  <p class="m-0 text-[13px] text-ink-soft">{{ a.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-4">
              <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]" :class="a.is_active ? 'bg-[#E3F2E7] text-[#1D6B38]' : 'bg-signal-tint text-signal-ink'">
                <span aria-hidden="true" class="size-1.5 rounded-full bg-current" />{{ a.is_active ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="px-5 py-4 text-[13px] text-ink-soft">{{ formatDateTime(a.last_login_at) || '—' }}</td>
            <td class="px-5 py-4">
              <div v-if="canManage(a)" class="flex justify-end gap-2">
                <button type="button" :class="iconBtn" title="Edit" aria-label="Edit" @click="open('edit', a)"><Pencil class="size-4" /></button>
                <button type="button" :class="iconBtn" title="Ganti password" aria-label="Ganti password" @click="open('password', a)"><KeyRound class="size-4" /></button>
                <button type="button" :class="iconBtn" :title="a.is_active ? 'Nonaktifkan' : 'Aktifkan'" :aria-label="a.is_active ? 'Nonaktifkan' : 'Aktifkan'" @click="toggle(a)"><component :is="a.is_active ? PowerOff : Power" class="size-4" /></button>
                <button type="button" class="inline-flex size-9 items-center justify-center rounded-full border-[1.5px] border-signal-tint bg-signal-tint text-signal-ink transition-colors hover:border-signal hover:bg-signal hover:text-white" title="Hapus" aria-label="Hapus" @click="remove(a)"><Trash2 class="size-4" /></button>
              </div>
              <div v-else class="flex justify-end">
                <NuxtLink v-if="a.id === me?.id" to="/dashboard/pengaturan" class="label-sm inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-ink px-4 transition-colors hover:bg-ink hover:text-paper"><Pencil class="size-3.5" aria-hidden="true" />Ubah di Pengaturan</NuxtLink>
                <span v-else class="label-sm inline-flex items-center gap-1.5 text-ink-soft"><ShieldCheck class="size-3.5" aria-hidden="true" />Dilindungi</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog ref="dialog" class="m-auto w-[calc(100%-32px)] max-w-md rounded-[24px] bg-white p-0 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop:bg-ink/60" aria-labelledby="dialog-title">
      <form class="flex flex-col gap-6 p-6 md:p-8" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <span aria-hidden="true" class="flex size-11 flex-none items-center justify-center rounded-2xl bg-signal text-white"><component :is="modeIcon[mode]" class="size-5" /></span>
            <h2 id="dialog-title" class="font-display-m m-0 text-[20px] font-bold uppercase leading-tight">{{ dialogTitle }}</h2>
          </div>
          <button type="button" class="inline-flex size-9 flex-none items-center justify-center rounded-full hover:bg-stone" aria-label="Tutup" @click="dialog?.close()"><X class="size-4" /></button>
        </div>
        <div class="flex flex-col gap-4">
          <template v-if="mode !== 'password'">
            <div class="flex flex-col gap-2">
              <label for="acc-name" class="label-sm text-ink-soft">Nama</label>
              <input id="acc-name" v-model="form.name" required :class="inputCls" />
              <p v-if="errors.name" class="m-0 text-[14px] text-signal-ink">{{ errors.name }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="acc-email" class="label-sm text-ink-soft">Email</label>
              <input id="acc-email" v-model="form.email" type="email" required :class="inputCls" />
              <p v-if="errors.email" class="m-0 text-[14px] text-signal-ink">{{ errors.email }}</p>
            </div>
          </template>
          <div v-if="mode !== 'edit'" class="flex flex-col gap-2">
            <label for="acc-pass" class="label-sm text-ink-soft">{{ mode === 'create' ? 'Password' : 'Password baru' }}</label>
            <input id="acc-pass" v-model="form.password" type="password" autocomplete="new-password" minlength="8" required :class="inputCls" />
            <p class="m-0 text-[13px] text-ink-soft">Minimal 8 karakter.</p>
            <p v-if="errors.password" class="m-0 text-[14px] text-signal-ink">{{ errors.password }}</p>
          </div>
          <p v-if="errors._" role="alert" class="m-0 rounded-xl bg-signal-tint px-4 py-3 text-[14px] font-medium text-signal-ink">{{ errors._ }}</p>
        </div>
        <div class="flex flex-wrap justify-end gap-2 border-t border-stone pt-5">
          <button type="button" class="btn-line" @click="dialog?.close()"><X class="size-4" aria-hidden="true" />Batal</button>
          <button type="submit" class="btn-ink" :disabled="saving"><Save class="size-4" aria-hidden="true" />{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
        </div>
      </form>
    </dialog>
  </div>
</template>
