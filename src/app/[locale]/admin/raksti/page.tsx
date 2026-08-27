import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { AdminRow, EmptyState } from '@/components/admin/admin-row'
import { PostActions } from '@/components/admin/moderation-actions'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Raksti', robots: { index: false } }

const date = new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium' })

export default async function AdminPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: posts }, me] = await Promise.all([
    supabase
      .from('posts')
      .select('id, slug, title, status, view_count, created_at, coach_profiles(full_name)')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('display_name').eq('id', user!.id).maybeSingle(),
  ])

  const admin = { adminId: user!.id, adminName: me.data?.display_name ?? null }
  const authorName = (row: unknown) => {
    const v = Array.isArray(row) ? row[0] : row
    return (v as { full_name?: string } | null)?.full_name ?? '—'
  }

  return (
    <div>
      <h2 className="font-display text-xl">Raksti</h2>
      <p className="mt-1 text-sm text-mist">
        Noņemot no publikācijas, raksts kļūst par melnrakstu — autors to
        joprojām redz un var labot.
      </p>

      {!posts || posts.length === 0 ? (
        <div className="mt-6"><EmptyState>Nav neviena raksta.</EmptyState></div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {posts.map((p) => (
            <AdminRow
              key={p.id}
              title={p.title}
              subtitle={
                <>
                  {authorName(p.coach_profiles)} · {date.format(new Date(p.created_at))}
                  {p.view_count > 0 && ` · ${p.view_count} skatījumi`}
                </>
              }
              badges={
                <Badge variant={p.status === 'published' ? 'default' : 'outline'}>
                  {p.status === 'published' ? 'Publicēts' : 'Melnraksts'}
                </Badge>
              }
              actions={
                <PostActions
                  id={p.id}
                  label={p.title}
                  isPublished={p.status === 'published'}
                  admin={admin}
                />
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}
