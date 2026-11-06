import type { Admin, Envelope } from '~/types/api'

export function useAuth() {
  const admin = useState<Admin | null>('auth.admin', () => null)
  const api = useAdminApi()

  async function fetchMe() {
    try {
      const res = await $fetch<Envelope<Admin>>('/api/v1/auth/me')
      admin.value = res.data
    } catch {
      admin.value = null
    }
    return admin.value
  }

  async function login(email: string, password: string) {
    const res = await $fetch<Envelope<{ admin: Admin }>>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    admin.value = res.data.admin
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    admin.value = null
    await navigateTo('/dashboard/login')
  }

  return { admin, fetchMe, login, logout }
}
