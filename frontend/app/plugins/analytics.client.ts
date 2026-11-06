// Client-side navigations do not reload the page, so GTM would only see the
// first page view. Push a `virtual_page_view` event on every later route
// change; in GTM, fire the GA4 page_view tag on this custom event.
export default defineNuxtPlugin(() => {
  const { gtmId } = useRuntimeConfig().public
  if (!gtmId) return
  const router = useRouter()
  let first = true
  router.afterEach((to) => {
    if (first) {
      first = false
      return
    }
    if (to.path.startsWith('/dashboard')) return
    nextTick(() => {
      const w = window as unknown as { dataLayer?: unknown[] }
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push({ event: 'virtual_page_view', page_path: to.fullPath, page_title: document.title })
    })
  })
})
