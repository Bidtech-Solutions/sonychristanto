// Mirrors backend DTOs (docs/API.md). Keep in sync when the API changes.

export interface Envelope<T, M = undefined> {
  data: T
  meta: M
}

export interface PageMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ApiErrorBody {
  error: { code: string; message: string; fields?: Record<string, string>; current_version?: number }
}

/** A BlockNote block as stored by the backend (subset we allow). */
export interface Block {
  id: string
  type: string
  props: Record<string, any>
  content?: InlineNode[] | Record<string, any>
  children: Block[]
}

export type InlineNode =
  | { type: 'text'; text: string; styles: Record<string, boolean | string> }
  | { type: 'link'; href: string; content: InlineNode[] }

export interface PublicArticle {
  slug: string
  title: string
  excerpt: string
  category: { key: string; label: string }
  banner_url: string | null
  banner_alt: string
  reading_minutes: number
  published_at: string
  updated_at: string
  author?: { name: string }
  content?: Block[]
  content_text?: string
}

export type ArticleStatus = 'draft' | 'published' | 'inactive'

export interface AdminArticle {
  id: string
  status: ArticleStatus
  slug: string | null
  has_unpublished_changes: boolean
  published: { title: string; excerpt: string; category: string | null; banner_url: string | null } | null
  draft: {
    title: string
    slug: string
    excerpt: string
    category: string
    banner_url: string | null
    banner_alt: string
    content?: Block[]
    version: number
    updated_at: string
  }
  author: { name: string; avatar_url: string | null } | null
  published_at: string | null
  last_published_at: string | null
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  name: string
  email: string
  avatar_url: string | null
  is_superadmin: boolean
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface MediaUpload {
  id: string
  url: string
  width: number
  height: number
  size_bytes: number
}
