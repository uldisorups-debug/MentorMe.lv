import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { AdminRow, EmptyState } from '@/components/admin/admin-row'
import { InviteForm } from '@/components/admin/invite-form'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Uzaicinājumi',
  robots: { index: false },
}

const date = new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium' })

type Status = { openedInvite: boolean; email: string | null }

/**
 * Kurš uzaicinājumu jau atvēris.
 *
 * Šis nāk no auth tabulas, kuru parastais klients neredz. Ja atslēgas
 * nav vai Supabase neatbild, saraksts paliek bez statusa — tā ir mazāka
 * bēda nekā lapa, kas nekā nerāda.
 */
async function loadStatus(): Promise<Map<string, Status>> {
  const map = new Map<string, Status>()

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })
    if (error) throw error

    for (const user of data.users) {
      map.set(user.id, {
        openedInvite: Boolean(user.last_sign_in_at),
        email: user.email ?? null,
      })
    }
  } catch (error) {
    console.error('Neizdevās nolasīt kontu statusu:', error)
  }

  return map
}

export default async function AdminInvitesPage() {
  const supabase = await createClient()

  const [{ data: drafts, error }, status] = await Promise.all([
    supabase
      .from('coach_profiles')
      .select('id, user_id, slug, full_name, tagline, created_at')
      .eq('is_published', false)
      .order('created_at', { ascending: false }),
    loadStatus(),
  ])

  if (error) console.error('Neizdevās ielādēt melnrakstus:', error.message)

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-xl">Uzaicināt meistaru</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mist">
          Cilvēks saņem vēstuli, uzstāda paroli un atrod savu profilu jau
          iesāktu. Publisks tas kļūst tikai tad, kad viņš pats nospiež
          publicēt — līdz tam neviens svešs to neredz.
        </p>

        <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
          <InviteForm />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl">Gaida savu cilvēku</h2>
        <p className="mt-1 text-sm text-mist">
          Visi profili, kas vēl nav publicēti — gan uzaicinātie, gan tie, ko
          cilvēki sākuši paši.
        </p>

        {!drafts || drafts.length === 0 ? (
          <div className="mt-4">
            <EmptyState>Nav neviena nepublicēta profila.</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {drafts.map((draft) => {
              const info = draft.user_id ? status.get(draft.user_id) : undefined

              return (
                <AdminRow
                  key={draft.id}
                  title={draft.full_name}
                  subtitle={
                    <>
                      /{draft.slug}
                      {draft.tagline && ` · ${draft.tagline}`}
                      {info?.email && ` · ${info.email}`}
                      {` · izveidots ${date.format(new Date(draft.created_at))}`}
                    </>
                  }
                  badges={
                    info === undefined ? null : info.openedInvite ? (
                      <Badge variant="outline" className="text-mist">
                        Ienācis
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-mist">
                        Vēstule nav atvērta
                      </Badge>
                    )
                  }
                />
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
