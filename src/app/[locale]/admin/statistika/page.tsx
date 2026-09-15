import type { Metadata } from 'next'
import { EmptyState } from '@/components/admin/admin-row'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Statistika', robots: { index: false } }

/** Cik dienas atpakaļ skatāmies. */
const DAYS = 30

function Bar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <span
      aria-hidden="true"
      className="block h-1.5 rounded-full bg-gold/70"
      style={{ width: `${width}%` }}
    />
  )
}

function Table({
  title,
  note,
  rows,
}: {
  title: string
  note: string
  rows: { label: string; value: number }[]
}) {
  const max = rows[0]?.value ?? 0

  return (
    <section>
      <h2 className="font-display text-xl">{title}</h2>
      <p className="mt-1 text-sm text-mist">{note}</p>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState>Vēl nav neviena ieraksta.</EmptyState>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-4 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 font-medium tabular-nums text-gold">
                  {row.value}
                </span>
              </span>
              <Bar value={row.value} max={max} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default async function AdminStatsPage() {
  const supabase = await createClient()

  const since = new Date()
  since.setDate(since.getDate() - DAYS)
  const sinceDay = since.toISOString().slice(0, 10)

  const [{ data, error }, { data: visitorRows, error: visitorError }] =
    await Promise.all([
      supabase
        .from('page_views')
        .select('path, viewed_on, source, views')
        .gte('viewed_on', sinceDay),
      supabase
        .from('daily_visitors')
        .select('viewed_on, visitors')
        .gte('viewed_on', sinceDay),
    ])

  if (error) {
    console.error('Neizdevās ielādēt statistiku:', error.message)
  }
  if (visitorError) {
    console.error('Neizdevās ielādēt apmeklētājus:', visitorError.message)
  }

  const rows = data ?? []
  const visitorDays = visitorRows ?? []
  const visitors = visitorDays.reduce((acc, row) => acc + row.visitors, 0)

  /*
   * Apkopojam serverī, ne SQL: rindu skaits te ir dienas × lapas × avoti,
   * un pie šāda apjoma tas ir mazāk darba nekā vēl viens skats datubāzē.
   * Ja tas kādreiz kļūs par tūkstošiem, pārceļams uz materializētu skatu.
   */
  const sum = (key: 'path' | 'source') => {
    const totals = new Map<string, number>()
    for (const row of rows) {
      totals.set(row[key], (totals.get(row[key]) ?? 0) + row.views)
    }
    return [...totals.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }

  const byPath = sum('path')
  const bySource = sum('source')
  const total = rows.reduce((acc, row) => acc + row.views, 0)

  const days = new Map<string, number>()
  for (const row of rows) {
    days.set(row.viewed_on, (days.get(row.viewed_on) ?? 0) + row.views)
  }
  const recent = [...days.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 14)
    .map(([label, value]) => ({ label, value }))

  const recentVisitors = [...visitorDays]
    .sort((a, b) => b.viewed_on.localeCompare(a.viewed_on))
    .slice(0, 14)
    .map((row) => ({ label: row.viewed_on, value: row.visitors }))

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="font-display text-xl">Pēdējās {DAYS} dienas</h2>
        <p className="mt-1 text-sm leading-relaxed text-mist">
          Mūsu pašu skaitītājs. Šeit ir <strong className="text-cream">visi</strong>{' '}
          apmeklētāji, arī tie, kas sīkdatnēm nepiekrita — tāpēc šie skaitļi ir
          lielāki par Google Analytics.
        </p>
        <div className="mt-5 flex flex-wrap gap-10">
          <div>
            <p className="font-display text-4xl text-gold tabular-nums">
              {visitors}
            </p>
            <p className="text-sm text-mist">cilvēki</p>
          </div>
          <div>
            <p className="font-display text-4xl text-cream tabular-nums">
              {total}
            </p>
            <p className="text-sm text-mist">lapu atvērumi</p>
          </div>
          <div>
            <p className="font-display text-4xl text-cream tabular-nums">
              {visitors > 0 ? (total / visitors).toFixed(1) : '—'}
            </p>
            <p className="text-sm text-mist">lapas uz cilvēku</p>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-mist">
          &bdquo;Cilvēki&ldquo; ir unikālie apmeklētāji: viens cilvēks dienā
          skaitās vienu reizi, lai cik lapu viņš atvērtu. &bdquo;Lapu
          atvērumi&ldquo; skaita katru lapu atsevišķi. Ja otrais skaitlis ir
          daudz lielāks par pirmo, cilvēki pa lapu staigā — tā ir laba zīme.
        </p>
      </section>

      <Table
        title="Kuras lapas"
        note="Sakārtots pēc skatījumiem."
        rows={byPath.slice(0, 20)}
      />

      <Table
        title="No kurienes atnāca"
        note="&bdquo;Tiešs&ldquo; nozīmē, ka adrese ievadīta pašrocīgi vai atvērta no grāmatzīmēm."
        rows={bySource}
      />

      <Table
        title="Cilvēki pa dienām"
        note="Unikālie apmeklētāji. Pēdējās divas nedēļas."
        rows={recentVisitors}
      />

      <Table
        title="Lapu atvērumi pa dienām"
        note="Pēdējās divas nedēļas."
        rows={recent}
      />
    </div>
  )
}
