import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { CookieSettingsLink } from '@/components/cookie-settings-link'
import { LinkedInIcon } from '@/components/provider-icons'
import { LINKEDIN_URL } from '@/lib/site-links'

export function SiteFooter() {
  const t = useTranslations('Footer')
  const tNav = useTranslations('Nav')

  const links = [
    { href: '/ka-tas-darbojas', label: tNav('howItWorks') },
    { href: '/auth/login?next=%2Fdashboard%2Fprofile', label: t('addProfile') },
    { href: '/kontakti', label: t('contact') },
    { href: '/privatums', label: t('privacy') },
    { href: '/lietosanas-noteikumi', label: t('terms') },
    { href: '/sikdatnes', label: t('cookies') },
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
          {/* Neved uz lapu — atver izvēles logu turpat */}
          <CookieSettingsLink label={t('cookieSettings')} />
        </nav>
      </div>

      {/*
        Apakšējā josla: kreisajā malā ALENOR.LV un autortiesības, vidū
        LinkedIn.

        ALENOR.LV te ir saitei, ne reklāmai — tāpēc tikai adrese, bez logo
        un apraksta. Tā paliek redzama un salasāma: Google soda saites, kas
        paslēptas no cilvēkiem (fona krāsā, mikroskopiskā burtā).
        Bez rel="sponsored": ALENOR ir tā paša īpašnieka uzņēmums, neviens
        trešais par šo vietu nemaksā — tā ir saite starp viena īpašnieka
        projektiem, ne pirkta reklāma. Tāpēc Google to drīkst skaitīt kā
        parastu saiti. Ja kādreiz te parādās svešs, maksājošs sponsors,
        viņa saitei rel="sponsored" ir obligāts.

        LinkedIn — pelēks, ne zīmola zils: kājenē tas ir pieejams, ne
        izcelts. Uzbraucot kļūst gaišāks.
      */}
      <div className="mx-auto mt-10 grid max-w-6xl items-center gap-5 border-t border-hairline pt-6 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col gap-1.5 text-xs text-mist/70">
          <a
            href="https://www.alenor.lv"
            target="_blank"
            rel="noopener"
            className="w-fit transition-colors hover:text-mist"
          >
            ALENOR.LV
          </a>
          <p>
            © {new Date().getFullYear()} MentorMe.lv. {t('rights')}
          </p>
        </div>

        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('linkedin')}
          title={t('linkedin')}
          className="inline-flex size-10 items-center justify-center justify-self-start rounded-lg border border-hairline text-mist/70 transition-colors hover:border-gold/40 hover:text-cream sm:justify-self-center"
        >
          <LinkedInIcon className="size-[18px]" monochrome />
        </a>
      </div>
    </footer>
  )
}
