import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/link-button'

export const metadata: Metadata = {
  title: 'Pieteikšanās neizdevās',
  robots: { index: false },
}

export default async function AuthCodeErrorPage() {
  const t = await getTranslations('Auth')

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-28 text-center">
      <p className="font-display text-5xl text-coral/40">!</p>
      <h1 className="mt-4 font-display text-2xl">{t('errorTitle')}</h1>
      <p className="mt-3 text-mist">{t('errorBody')}</p>
      <LinkButton href="/auth/login" className="mt-8 h-11 px-6">
        {t('errorRetry')}
      </LinkButton>
    </div>
  )
}
