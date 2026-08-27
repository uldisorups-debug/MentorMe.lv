import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { NewPasswordForm } from './new-password-form'
import { safeNext } from '@/lib/safe-next'

export const metadata: Metadata = {
  title: 'Jauna parole',
  robots: { index: false },
}

export default async function NewPasswordPage({
  params,
  searchParams,
}: PageProps<'/[locale]/auth/jauna-parole'>) {
  const { locale } = await params
  setRequestLocale(locale)

  const query = await searchParams
  const next = safeNext(typeof query.next === 'string' ? query.next : null)
  const t = await getTranslations('Auth')

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-3xl">{t('newPasswordTitle')}</h1>
      <p className="mt-3 text-mist">{t('newPasswordLead')}</p>

      <div className="mt-8">
        <NewPasswordForm next={next} />
      </div>
    </div>
  )
}
