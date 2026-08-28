import { CookieConsent } from '@/components/cookie-consent'
import { PageViewTracker } from '@/components/page-view-tracker'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

/** Kopīgais lapas ietvars — galvene, saturs, kājene. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="saturs" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CookieConsent />
      <PageViewTracker />
    </>
  )
}
