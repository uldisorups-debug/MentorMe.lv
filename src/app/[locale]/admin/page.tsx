import type { Metadata } from 'next'
import { ACTION_LABELS } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/admin/admin-row'

export const metadata: Metadata = { title: 'Administrācija', robots: { index: false } }

const dateTime = new Intl.DateTimeFormat('lv-LV', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-5">
      <p className="font-display text-3xl text-gold">{value}</p>
      <p className="mt-1 text-sm">{label}</p>
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Skaitām ar head: true — atgriež tikai skaitu, ne rindas
  const HEAD = { count: 'exact' as const, head: true }

  const [users, coaches, published, reviews, hidden, posts, drafts, reports] =
    await Promise.all([
      supabase.from('profiles').select('*', HEAD),
      supabase.from('coach_profiles').select('*', HEAD),
      supabase.from('coach_profiles').select('*', HEAD).eq('is_published', true),
      supabase.from('reviews').select('*', HEAD),
      supabase.from('reviews').select('*', HEAD).eq('is_visible', false),
      supabase.from('posts').select('*', HEAD),
      supabase.from('posts').select('*', HEAD).eq('status', 'draft'),
      supabase.from('review_reports').select('*', HEAD).eq('handled', false),
    ]).then((results) => results.map((r) => r.count ?? 0))

  const { data: log } = await supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-xl">Skaitļi</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Lietotāji" value={users} />
          <Stat label="Profili" value={coaches} hint={`${published} publicēti`} />
          <Stat label="Atsauksmes" value={reviews} hint={`${hidden} paslēptas`} />
          <Stat label="Raksti" value={posts} hint={`${drafts} melnraksti`} />
        </div>

        {reports > 0 && (
          <p className="mt-4 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-soft">
            {reports} neapstrādāts ziņojums par atsauksmēm — skaties sadaļā Atsauksmes.
          </p>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl">Darbību žurnāls</h2>
        <p className="mt-1 text-sm text-mist">
          Šo ierakstu izdzēst nevar neviens, arī administrators.
        </p>

        {!log || log.length === 0 ? (
          <div className="mt-4">
            <EmptyState>Vēl nav neviena ieraksta.</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {log.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-hairline bg-surface px-4 py-3 text-sm"
              >
                <span className="text-cream">
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </span>
                {entry.target_label && (
                  <span className="text-mist">— {entry.target_label}</span>
                )}
                <span className="ml-auto text-xs text-mist">
                  {entry.admin_name ?? '—'} · {dateTime.format(new Date(entry.created_at))}
                </span>
                {entry.reason && (
                  <span className="w-full text-xs text-mist italic">
                    {entry.reason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
