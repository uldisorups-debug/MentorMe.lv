import { createPublicClient } from '@/lib/supabase/public'
import { autoExcerpt } from '@/lib/markdown'
import type { PostStatus } from '@/types/database'

export type PostAuthor = {
  full_name: string
  slug: string
  avatar_url: string | null
}

export type PostSummary = {
  id: string
  slug: string
  title: string
  excerpt: string
  published_at: string | null
  view_count: number
  author: PostAuthor | null
}

export type PostDetail = PostSummary & {
  content: string
  status: PostStatus
}

/** PostgREST ligzdoto autoru atgriež kā objektu vai masīvu atkarībā no saites. */
function firstAuthor(value: unknown): PostAuthor | null {
  if (!value) return null
  const row = Array.isArray(value) ? value[0] : value
  if (!row || typeof row !== 'object') return null
  const author = row as Partial<PostAuthor>
  if (!author.full_name || !author.slug) return null
  return {
    full_name: author.full_name,
    slug: author.slug,
    avatar_url: author.avatar_url ?? null,
  }
}

const AUTHOR_SELECT = 'coach_profiles(full_name, slug, avatar_url)'

export async function listPublishedPosts(): Promise<PostSummary[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('posts')
    /*
     * content šeit vairs nav. Agrāk to vilka tikai tāpēc, ka kopsavilkums
     * varēja izrādīties tukšs — tas nozīmēja lejupielādēt visus rakstus
     * pilnībā, lai parādītu divas rindiņas. Tagad kopsavilkumu aizpilda
     * redaktors saglabāšanas brīdī.
     */
    .select(
      `id, slug, title, excerpt, published_at, view_count, ${AUTHOR_SELECT}`
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Neizdevās ielādēt rakstus:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt?.trim() ?? '',
    published_at: row.published_at,
    view_count: row.view_count,
    author: firstAuthor(row.coach_profiles),
  }))
}

export async function loadPost(slug: string): Promise<PostDetail | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('posts')
    .select(
      `id, slug, title, excerpt, content, published_at, view_count, status, ${AUTHOR_SELECT}`
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) console.error('Neizdevās ielādēt rakstu:', error.message)
  if (!data) return null

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt?.trim() || autoExcerpt(data.content),
    content: data.content,
    published_at: data.published_at,
    view_count: data.view_count,
    status: data.status,
    author: firstAuthor(data.coach_profiles),
  }
}

export async function listPostSlugs(): Promise<string[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published')

  if (error) {
    console.error('Neizdevās ielādēt rakstu slug sarakstu:', error.message)
    return []
  }
  return (data ?? []).map((row) => row.slug)
}
