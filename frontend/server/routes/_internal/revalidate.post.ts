// On-demand ISR purge. The backend calls this after publish / unpublish /
// delete (backend/internal/revalidate). Nitro keeps route-rule (swr) caches
// in the "cache" mount and @nuxtjs/sitemap in the "sitemap" mount.
// The cached set is small (landing + blog pages + feeds, x2 locales), so we
// drop everything in the cache mount; pages rebuild on the next request.
// Paths sent by the backend are locale-less (/blog/slug); both /id and /en
// variants are covered because the whole cache is cleared.
import { timingSafeEqual } from 'node:crypto'

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export default defineEventHandler(async (event) => {
  const { revalidateSecret } = useRuntimeConfig(event)
  const provided = getHeader(event, 'x-revalidate-secret') ?? ''
  if (!revalidateSecret || !safeEqual(provided, revalidateSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const body = await readBody<{ paths?: string[] }>(event).catch(() => ({}) as { paths?: string[] })
  let purged = 0
  for (const mount of ['cache', 'sitemap']) {
    const storage = useStorage(mount)
    const keys = await storage.getKeys()
    await Promise.all(keys.map((k) => storage.removeItem(k)))
    purged += keys.length
  }
  return { ok: true, purged, paths: body?.paths ?? [] }
})
