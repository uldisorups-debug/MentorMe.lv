import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { HeaderAuth } from '@/components/header-auth'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { LinkButton } from '@/components/link-button'
import { MobileNav } from '@/components/mobile-nav'

export function SiteHeader() {
  const t = useTranslations('Nav')

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-hairline bg-ink/80 backdrop-blur-lg">
      <a
        href="#saturs"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-gold focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        {t('skipToContent')}
      </a>

      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg tracking-tight">
          Mentor<span className="text-gold">Me</span>
          <span className="text-mist">.lv</span>
        </Link>

        <nav className="flex items-center gap-1">
          <LinkButton
            href="/ka-tas-darbojas"
            variant="ghost"
            className="hidden text-mist hover:text-cream lg:inline-flex"
          >
            {t('howItWorks')}
          </LinkButton>
          <LinkButton
            href="/blog"
            variant="ghost"
            className="hidden text-mist hover:text-cream lg:inline-flex"
          >
            {t('blog')}
          </LinkButton>
          <LinkButton
            href="/#kouciem"
            variant="ghost"
            className="hidden text-mist hover:text-cream lg:inline-flex"
          >
            {t('forCoaches')}
          </LinkButton>
          <LocaleSwitcher />
          <HeaderAuth />
          <MobileNav />
        </nav>
      </div>
    </header>
  )
}
