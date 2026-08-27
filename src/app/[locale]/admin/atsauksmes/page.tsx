import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { AdminRow, EmptyState } from '@/components/admin/admin-row'
import { ReviewActions } from '@/components/admin/moderation-actions'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Atsauksmes', robots: { index: false } }

const date = new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium' })

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: reviews }, { data: reports }, me] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, body, is_visible, is_anonymous, created_at, coach_id, coach_profiles(full_name)')
      .order('created_at', { ascending: false }),
    supabase.from('review_reports').select('review_id, created_at, handled').eq('handled', false),
    supabase.from('profiles').select('display_name').eq('id', user!.id).maybeSingle(),
  ])

  const admin = { adminId: user!.id, adminName: me.data?.display_name ?? null }
  const reported = new Set((reports ?? []).map((r) => r.review_id))

  const coachName = (row: unknown) => {
    const v = Array.isArray(row) ? row[0] : row
    return (v as { full_name?: string } | null)?.full_name ?? '—'
  }

  return (
    <div>
      <h2 className="font-display text-xl">Atsauksmes</h2>
      <p className="mt-1 text-sm text-mist">
        Paslēptā atsauksme pazūd no profila un neietekmē reitingu, bet paliek
        datubāzē. Dzēšana ir neatgriezeniska.
      </p>

      {!reviews || reviews.length === 0 ? (
        <div className="mt-6"><EmptyState>Nav nevienas atsauksmes.</EmptyState></div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {reviews.map((r) => (
            <AdminRow
              key={r.id}
              danger={reported.has(r.id)}
              title={`${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} — ${coachName(r.coach_profiles)}`}
              subtitle={
                <>
                  {date.format(new Date(r.created_at))}
                  {r.body && <span className="mt-1 block text-mist">{r.body}</span>}
                </>
              }
              badges={
                <>
                  {reported.has(r.id) && <Badge variant="destructive">Ziņots</Badge>}
                  {!r.is_visible && <Badge variant="outline" className="text-mist">Paslēpta</Badge>}
                  {r.is_anonymous && <Badge variant="ghost" className="text-mist">Anonīma</Badge>}
                </>
              }
              actions={
                <ReviewActions
                  id={r.id}
                  label={`${r.rating}★ — ${coachName(r.coach_profiles)}`}
                  isVisible={r.is_visible}
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
