// Guards every /dashboard page except the login page (dashboard is client-only).
export default defineNuxtRouteMiddleware(async (to) => {
  const { admin, fetchMe } = useAuth()
  if (!admin.value) await fetchMe()
  if (to.path === '/dashboard/login') {
    if (admin.value) return navigateTo((to.query.redirect as string) || '/dashboard')
    return
  }
  if (!admin.value) return navigateTo({ path: '/dashboard/login', query: { redirect: to.fullPath } })
})
