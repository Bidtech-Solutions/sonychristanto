// 301 for "/" and pre-i18n URLs without a locale prefix, e.g. /biografi ->
// /id/biografi, /blog/slug?page=2 -> /id/blog/slug?page=2.
// Root is a fixed redirect to Indonesian (cacheable); visitors switch with the ID/EN toggle.
const LEGACY = /^\/(biografi|organisasi|penghargaan|karya-tulis|galeri|kontak|blog)(\/|$)/

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  if (path === '/' || LEGACY.test(path)) {
    return sendRedirect(event, `/id${path === '/' ? '' : path}${url.search}`, 301)
  }
})
