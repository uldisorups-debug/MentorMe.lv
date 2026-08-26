import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/link-button'
import { SiteShell } from '@/components/site-shell'

export default async function NotFound() {
  const t = await getTranslations('Coach')

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
        <p className="font-display text-6xl text-gold/30">404</p>
        <h1 className="mt-4 font-display text-3xl">{t('notFoundTitle')}</h1>
        <p className="mt-3 text-mist">{t('notFoundBody')}</p>
        <LinkButton href="/#kouci" className="mt-8 h-11 px-6">
          {t('backToList')}
        </LinkButton>
      </div>
    </SiteShell>
  )
}
