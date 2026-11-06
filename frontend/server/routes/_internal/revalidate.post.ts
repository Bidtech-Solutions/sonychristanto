// On-demand ISR purge. The backend calls this after publish / unpublish /
// delete (backend/internal/revalidate). Nitro stores route-rule (swr) caches
// under "cache:nitro:routes:*"; we drop them all — the cached set is small
// (landing + blog pages + feeds) and they rebuild on the next request.
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
  const storage = useStorage('cache')
  const keys = await storage.getKeys('nitro:routes')
  await Promise.all(keys.map((k) => storage.removeItem(k)))
  return { ok: true, purged: keys.length, paths: body?.paths ?? [] }
})
