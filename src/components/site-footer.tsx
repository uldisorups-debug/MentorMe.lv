import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { CookieSettingsLink } from '@/components/cookie-settings-link'

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
        Ģenerālsponsors.
        rel="sponsored" ir Google prasība atbalstītāju saitēm. Bez tā
        vienāda saite katrā lapā izskatās pēc pirktas, un no tā zaudē
        abas puses. Ar to apmeklētājam nemainās nekas.

        Logo ir uz gaiša plāksnīša ar nolūku: ALENOR zīmols ir zils uz
        balta, un uz mūsu tumšā fona tas kļūtu tikko salasāms.
      */}
      <div className="mx-auto mt-10 max-w-6xl border-t border-hairline pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <p className="text-xs tracking-widest text-mist/70 uppercase">
            {t('sponsorLabel')}
          </p>

          <a
            href="https://www.alenor.lv"
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-label="ALENOR.LV"
            className="inline-flex w-fit items-center rounded-lg bg-cream px-3 py-2 transition-opacity hover:opacity-80"
          >
            {/*
              Izmēri pēc tā, cik liels tas ir ekrānā, ne pēc faila.
              Ar 453×111 next/image pieprasītu 1080 pikseļu platu bildi
              piecdesmit piecu pikseļu vietai.
            */}
            <Image
              src="/brand/alenor.png"
              alt="ALENOR"
              width={82}
              height={20}
              className="h-5 w-auto"
            />
          </a>

          <p className="max-w-md text-sm leading-relaxed text-mist">
            <a
              href="https://www.alenor.lv"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="text-gold hover:underline"
            >
              ALENOR.LV
            </a>{' '}
            — {t('sponsorLine')}
          </p>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-xs text-mist/60">
        © {new Date().getFullYear()} MentorMe.lv. {t('rights')}
      </p>
    </footer>
  )
}
