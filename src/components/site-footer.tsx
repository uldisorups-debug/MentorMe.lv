import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export function SiteFooter() {
  const t = useTranslations('Footer')

  const links = [
    { href: '/par-mums', label: t('about') },
    { href: '/auth/login?next=%2Fdashboard%2Fprofile', label: t('addProfile') },
    { href: '/kontakti', label: t('contact') },
    { href: '/privatums', label: t('privacy') },
  ]

  return (
    <footer className="mt-auto border-t border-hairline px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-lg">
            Mentor<span className="text-gold">Me</span>
            <span className="text-mist">.lv</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-mist">{t('tagline')}</p>
        </div>

        <nav className="flex flex-col gap-2 text-sm sm:items-end">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-mist transition-colors hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mx-auto mt-10 max-w-6xl text-xs text-mist/60">
        © {new Date().getFullYear()} MentorMe.lv. {t('rights')}
      </p>
    </footer>
  )
}
