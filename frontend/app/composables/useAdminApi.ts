import type { ApiErrorBody } from '~/types/api'

/**
 * $fetch for the dashboard. The session lives in an httpOnly cookie, so no
 * token handling is needed here. A 401 sends the user back to the login page.
 */
export function useAdminApi() {
  return $fetch.create({
    baseURL: '/api/v1',
    onResponseError({ response }) {
      const code = (response._data as ApiErrorBody | undefined)?.error?.code
      if (response.status === 401 || code === 'ACCOUNT_INACTIVE') {
        useState('auth.admin').value = null
        const route = useRoute()
        if (route.path !== '/dashboard/login') {
          navigateTo({ path: '/dashboard/login', query: { redirect: route.fullPath } })
        }
      }
    },
  })
}

/** Human message from any fetch error. */
export function apiErrorMessage(err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.') {
  const body = (err as { data?: ApiErrorBody })?.data
  return body?.error?.message ?? fallback
}

/** Per-field validation errors (422). */
export function apiFieldErrors(err: unknown): Record<string, string> {
  return (err as { data?: ApiErrorBody })?.data?.error?.fields ?? {}
}

export function apiErrorCode(err: unknown): string | undefined {
  return (err as { data?: ApiErrorBody })?.data?.error?.code
}
