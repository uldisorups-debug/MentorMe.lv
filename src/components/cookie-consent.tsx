'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Script from 'next/script'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  CONSENT_ALL,
  CONSENT_NONE,
  CONSENT_REOPEN_EVENT,
  clearAnalyticsCookies,
  mountedStore,
  parseConsent,
  readConsentCookie,
  subscribeConsent,
  writeConsent,
} from '@/lib/cookie-consent'

/** Ģenerēts Google Analytics panelī, formā G-XXXXXXXXXX. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

type Panel = 'hidden' | 'simple' | 'custom'

/**
 * Sīkdatņu logs un Google Analytics, kas tam pakļaujas.
 *
 * Skaitītājs netiek ielādēts vispār, kamēr cilvēks nav piekritis — ne
 * "ielādēts un izslēgts", bet vienkārši nav. Tā ir vienīgā versija, kurā
 * pogai "Tikai obligātās" ir jēga.
 *
 * Izvēli lasām ar useSyncExternalStore, ne ar useEffect: serveris
 * sīkdatni neredz, un setState efektā radītu mirgoni starp "logs ir" un
 * "loga nav".
 */
export function CookieConsent() {
  const mounted = useSyncExternalStore(
    mountedStore.subscribe,
    mountedStore.get,
    mountedStore.getServer
  )

  // Momentuzņēmums ir virkne, nevis objekts — citādi katrs izsaukums
  // atgrieztu jaunu atsauci, un React grieztos aplī
  const raw = useSyncExternalStore(
    subscribeConsent,
    readConsentCookie,
    () => null
  )
  const consent = parseConsent(raw)

  const [override, setOverride] = useState<Panel | null>(null)
  const [analytics, setAnalytics] = useState(true)

  // Ja izvēle jau ir, logs klusē; ja nav — parādās uzreiz
  const panel: Panel = override ?? (consent === null ? 'simple' : 'hidden')

  useEffect(() => {
    function reopen() {
      setAnalytics(parseConsent(readConsentCookie())?.analytics ?? true)
      setOverride('custom')
    }
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen)
  }, [])

  function decide(choice: typeof CONSENT_ALL) {
    if (!choice.analytics) {
      clearAnalyticsCookies()
      // Dokumentētais Google izslēgšanas slēdzis — nostrādā arī tad, ja
      // skripts šajā lapas atvērumā jau ir ielādēts
      if (GA_ID) {
        ;(window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] =
          true
      }
    }
    writeConsent(choice)
    setOverride('hidden')
  }

  if (!mounted) return null

  return (
    <>
      {consent?.analytics && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {panel !== 'hidden' && (
        <div
          role="dialog"
          aria-labelledby="sikdatnes-virsraksts"
          className="fixed bottom-4 left-4 z-50 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-hairline bg-surface p-5 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.9)]"
        >
          <h2 id="sikdatnes-virsraksts" className="font-display text-lg">
            Sīkdatnes
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-mist">
            Dažas sīkdatnes vajag, lai lapa vispār strādātu — tās atceras
            valodu un to, ka esi ienācis. Papildus tam gribam skaitīt
            apmeklējumus ar Google Analytics: cik cilvēku bija, kuras lapas
            skatīja un no kurienes atnāca. Tas notiek tikai tad, ja tu atļauj.{' '}
            <Link href="/sikdatnes" className="text-gold hover:underline">
              Sīkāk
            </Link>
          </p>

          {panel === 'custom' && (
            <div className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
              <label className="flex cursor-not-allowed items-start gap-3 opacity-70">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="mt-1 size-4 accent-[var(--gold)]"
                />
                <span>
                  <span className="block text-sm font-medium">
                    Nepieciešamās
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-mist">
                    Valoda, pieteikšanās sesija un šī pati izvēle. Bez tām lapa
                    nestrādā, tāpēc izslēgt nevar.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="mt-1 size-4 accent-[var(--gold)]"
                />
                <span>
                  <span className="block text-sm font-medium">
                    Statistika (Google Analytics)
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-mist">
                    Liek sīkdatnes <code className="text-mist">_ga</code>, kas
                    atceras pārlūku līdz diviem gadiem. Izslēdzot, tās tiek
                    izdzēstas.
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {panel === 'custom' ? (
              <>
                <Button className="h-10" onClick={() => decide({ analytics })}>
                  Saglabāt izvēli
                </Button>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => decide(CONSENT_ALL)}
                >
                  Piekrītu visam
                </Button>
              </>
            ) : (
              <>
                <Button className="h-10" onClick={() => decide(CONSENT_ALL)}>
                  Piekrītu
                </Button>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => decide(CONSENT_NONE)}
                >
                  Tikai obligātās
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 text-mist"
                  onClick={() => setOverride('custom')}
                >
                  Pielāgot
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
