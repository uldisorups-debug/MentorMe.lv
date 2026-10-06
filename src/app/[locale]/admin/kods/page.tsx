import type { Metadata } from 'next'
import { SiteCodeForm } from '@/components/admin/site-code-form'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Kods', robots: { index: false } }

const date = new Intl.DateTimeFormat('lv-LV', { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Papildu kods visām lapām — kā Mozello: <head> un <body>.
 * Microsoft Clarity, Meta Pixel, Google/Bing verifikācija un tamlīdzīgi.
 */
export default async function AdminSiteCodePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_code')
    .select('head_html, body_html, needs_consent, updated_at')
    .eq('id', 1)
    .maybeSingle()

  return (
    <div>
      <h2 className="font-display text-xl">Vietnes kods</h2>
      <p className="mt-1 max-w-2xl text-sm text-mist">
        Ielīmē kodu, ko prasa ārējie rīki (Microsoft Clarity, Meta Pixel, Google
        vai Bing verifikācija). Tas tiek pievienots visām lapām visās valodās.
        Pēc saglabāšanas tas darbojas uzreiz, bez izvietošanas.
      </p>
      {data?.updated_at && (
        <p className="mt-2 text-xs text-mist">
          Pēdējo reizi mainīts: {date.format(new Date(data.updated_at))}
        </p>
      )}

      <div className="mt-6">
        <SiteCodeForm
          initialHead={data?.head_html ?? ''}
          initialBody={data?.body_html ?? ''}
          initialNeedsConsent={data?.needs_consent ?? true}
        />
      </div>
    </div>
  )
}
