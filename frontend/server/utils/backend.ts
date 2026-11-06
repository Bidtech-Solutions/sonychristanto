import type { H3Event } from 'h3'

export interface FeedArticle {
  slug: string
  title: string
  excerpt: string
  category: { key: string; label: string }
  published_at: string
  updated_at: string
  banner_url: string | null
  content_text?: string
}

/** Every published article (for sitemap, RSS, llms.txt). Never throws. */
export async function fetchArticleFeed(event: H3Event, includeText = false): Promise<FeedArticle[]> {
  const { apiInternalUrl } = useRuntimeConfig(event)
  try {
    const res = await $fetch<{ data: FeedArticle[] }>(`${apiInternalUrl}/api/v1/feeds/articles`, {
      query: includeText ? { include_text: 1 } : undefined,
      timeout: 8000,
    })
    return res.data
  } catch (err) {
    console.error('[feed] backend unavailable:', (err as Error).message)
    return []
  }
}

export const siteUrlOf = (event: H3Event) => useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')

export const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
