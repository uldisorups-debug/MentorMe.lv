import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { AdminRow, EmptyState } from '@/components/admin/admin-row'
import { UserActions } from '@/components/admin/user-actions'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Lietotāji', robots: { index: false } }

const date = new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium' })

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profiles }, { data: coaches }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, role, is_admin, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('coach_profiles').select('user_id, slug, is_published'),
  ])

  const coachByUser = new Map((coaches ?? []).map((c) => [c.user_id, c]))
  const me = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .maybeSingle()

  return (
    <div>
      <h2 className="font-display text-xl">Lietotāji</h2>
      <p className="mt-1 text-sm text-mist">
        Dzēšot lietotāju, aiziet arī viņa profils, bildes, raksti un saņemtās
        atsauksmes. Administratoru vispirms jāatbrīvo no tiesībām.
      </p>

      {!profiles || profiles.length === 0 ? (
        <div className="mt-6">
          <EmptyState>Nav neviena lietotāja.</EmptyState>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {profiles.map((p) => {
            const coach = coachByUser.get(p.id)
            return (
              <AdminRow
                key={p.id}
                title={p.display_name ?? '(bez vārda)'}
                subtitle={
                  <>
                    Reģistrējies {date.format(new Date(p.created_at))}
                    {coach && ` · /profils/${coach.slug}`}
                  </>
                }
                badges={
                  <>
                    {p.is_admin && <Badge>Administrators</Badge>}
                    {coach?.is_published && (
                      <Badge variant="outline" className="text-mist">
                        Publicēts
                      </Badge>
                    )}
                  </>
                }
                actions={
                  <UserActions
                    userId={p.id}
                    userName={p.display_name ?? '(bez vārda)'}
                    isAdmin={p.is_admin}
                    isSelf={p.id === user!.id}
                    adminId={user!.id}
                    adminName={me.data?.display_name ?? null}
                  />
                }
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}
