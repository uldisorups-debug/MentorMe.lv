import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CopyCode } from '@/components/copy-code'
import { BANNERS, BANNERS_PAGE } from '@/content/banners'
import { pageAlternates, routing } from '@/i18n/routing'

function content(locale: string) {
  return BANNERS_PAGE[locale] ?? BANNERS_PAGE[routing.defaultLocale]
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/baneri'>): Promise<Metadata> {
  const { locale } = await params
  const c = content(locale)
  return {
    title: c.title,
    description: c.lead,
    alternates: pageAlternates(locale, '/baneri'),
  }
}

export default async function BannersPage({
  params,
}: PageProps<'/[locale]/baneri'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const c = content(locale)

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="rule-gold font-display text-4xl sm:text-5xl">{c.title}</h1>
      <p className="mt-5 max-w-xl leading-relaxed text-mist">{c.lead}</p>

      <div className="mt-10 flex flex-col gap-6">
        {BANNERS.map((banner) => (
          <section
            key={banner.id}
            className="grid gap-5 rounded-xl border border-hairline bg-surface p-5 sm:grid-cols-[200px_1fr]"
          >
            <div className="flex h-fit items-start justify-center rounded-lg bg-[repeating-conic-gradient(#1f1e2c_0_25%,#17161f_0_50%)] bg-[length:16px_16px] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.src}
                width={banner.width}
                height={banner.height}
                alt={c.names[banner.id]}
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-medium">{c.names[banner.id]}</h2>
              <div className="mt-3">
                <CopyCode code={banner.code} label={c.copy} copiedLabel={c.copied} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-mist">
        {c.note}{' '}
        <Link prefetch={false} href="/kontakti" className="text-gold hover:underline">
          →
        </Link>
      </p>
    </div>
  )
}
