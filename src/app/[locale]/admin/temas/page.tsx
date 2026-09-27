import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { AdminRow, EmptyState } from '@/components/admin/admin-row'
import { TopicActions } from '@/components/admin/topic-actions'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Tēmas', robots: { index: false } }

const date = new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium' })

/**
 * Tēmu ieteikumi no profila redaktora ("Nevari atrast savu tēmu?").
 *
 * Apstiprinot tēma parādās sarakstā un uzreiz ieteicēja profilā, ja
 * tajā ir mazāk par četrām tēmām. Tulkojumus angliski un krieviski var
 * pielikt vēlāk — līdz tam visās valodās rādās latviskais nosaukums.
 */
export default async function AdminTopicsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: suggestions }, { data: spheres }, me] = await Promise.all([
    supabase
      .from('topic_suggestions')
      .select('id, user_id, text, status, category_slug, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('spheres').select('slug, name_lv').order('sort_order'),
    supabase.from('profiles').select('display_name').eq('id', user!.id).maybeSingle(),
  ])

  const admin = { adminId: user!.id, adminName: me.data?.display_name ?? null }
  const sphereOptions = (spheres ?? []).map((s) => ({ value: s.slug, label: s.name_lv }))

  // Kurš ieteica — pēc profila vārda; ieteikumam nav tiešas saites uz profilu
  const userIds = [...new Set((suggestions ?? []).map((s) => s.user_id))]
  const { data: authors } = userIds.length
    ? await supabase.from('coach_profiles').select('user_id, full_name, slug').in('user_id', userIds)
    : { data: [] }
  const authorOf = new Map((authors ?? []).map((a) => [a.user_id, a]))

  const pending = (suggestions ?? []).filter((s) => s.status === 'pending')
  const handled = (suggestions ?? []).filter((s) => s.status !== 'pending')

  const who = (userId: string) => authorOf.get(userId)?.full_name ?? 'Bez profila'

  return (
    <div>
      <h2 className="font-display text-xl">Tēmu ieteikumi</h2>
      <p className="mt-1 text-sm text-mist">
        Pielabo nosaukumu, izvēlies nozari un apstiprini. Tēma parādīsies sarakstā
        un uzreiz ieteicēja profilā, ja tajā ir vieta.
      </p>

      {pending.length === 0 ? (
        <div className="mt-6"><EmptyState>Nav neviena gaidoša ieteikuma.</EmptyState></div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {pending.map((s) => (
            <AdminRow
              key={s.id}
              title={`„${s.text}”`}
              subtitle={`${who(s.user_id)} · ${date.format(new Date(s.created_at))}`}
              actions={
                <TopicActions id={s.id} text={s.text} spheres={sphereOptions} admin={admin} />
              }
            />
          ))}
        </ul>
      )}

      {handled.length > 0 && (
        <>
          <h3 className="mt-10 text-sm font-medium text-mist">Izskatītie</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {handled.map((s) => (
              <AdminRow
                key={s.id}
                title={`„${s.text}”`}
                subtitle={`${who(s.user_id)} · ${date.format(new Date(s.created_at))}`}
                badges={
                  s.status === 'approved' ? (
                    <Badge variant="outline" className="text-gold">
                      Apstiprināta{s.category_slug ? ` · ${s.category_slug}` : ''}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-mist">Noraidīta</Badge>
                  )
                }
              />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
