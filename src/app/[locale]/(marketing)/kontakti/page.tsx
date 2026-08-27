import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { AlertTriangle, Mail } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { CONTACT_PAGE } from '@/content/contact'
import { routing } from '@/i18n/routing'

/** Rekvizīti no SIA "Forge Core" oficiālā dokumenta. Bankas datu šeit nav. */
const COMPANY = {
  name: 'SIA "Forge Core"',
  reg: '40203671821',
  vat: 'LV40203671821',
  address: '"Klapēni", Roja, Rojas pagasts, Talsu novads, LV-3264, Latvija',
  email: 'info@forgecore.lv',
}

function content(locale: string) {
  return CONTACT_PAGE[locale] ?? CONTACT_PAGE[routing.defaultLocale]
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/kontakti'>): Promise<Metadata> {
  const { locale } = await params
  const c = content(locale)
  return { title: c.title, description: c.lead }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-hairline py-3 sm:flex-row sm:gap-6">
      <dt className="text-sm text-mist sm:w-44 sm:shrink-0">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export default async function ContactPage({
  params,
}: PageProps<'/[locale]/kontakti'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const c = content(locale)

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="rule-gold font-display text-4xl sm:text-5xl">{c.title}</h1>
      <p className="mt-5 max-w-xl leading-relaxed text-mist">{c.lead}</p>

      <div className="mt-10">
        <a
          href={`mailto:${COMPANY.email}`}
          className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-5 py-4 transition-colors hover:border-gold/40"
        >
          <Mail className="size-5 shrink-0 text-gold" />
          <span>
            <span className="block text-xs text-mist">{c.email}</span>
            <span className="block text-sm">{COMPANY.email}</span>
          </span>
        </a>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-2xl">{c.company}</h2>
        <dl className="mt-4">
          <Row label={c.company}>{COMPANY.name}</Row>
          <Row label={c.reg}>{COMPANY.reg}</Row>
          <Row label={c.vat}>{COMPANY.vat}</Row>
          <Row label={c.address}>{COMPANY.address}</Row>
        </dl>
      </div>

      <div className="mt-12 flex gap-4 rounded-2xl border border-coral/30 bg-coral/5 p-6">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-coral" />
        <div>
          <h2 className="font-medium">{c.reportTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">{c.reportBody}</p>
        </div>
      </div>

      <p className="mt-10 text-sm text-mist">
        {c.privacyNote}{' '}
        <Link href="/privatums" className="text-gold hover:underline">
          {c.privacyLink}
        </Link>
        .
      </p>
    </div>
  )
}
