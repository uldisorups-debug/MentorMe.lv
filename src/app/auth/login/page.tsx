import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ShieldCheck } from 'lucide-react'
import { safeNext } from '@/lib/safe-next'
import { LoginButtons } from './login-buttons'

export const metadata: Metadata = {
  title: 'Ienākt',
  robots: { index: false },
}

export default async function LoginPage({
  searchParams,
}: PageProps<'/auth/login'>) {
  const params = await searchParams
  const t = await getTranslations('Auth')

  const next = safeNext(typeof params.next === 'string' ? params.next : null)

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-3xl">{t('loginTitle')}</h1>
      <p className="mt-3 text-mist">{t('loginLead')}</p>

      <div className="mt-8">
        <LoginButtons next={next} />
      </div>

      <div className="mt-8 flex gap-3 rounded-xl border border-hairline bg-surface px-4 py-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
        <div>
          <p className="text-sm font-medium">{t('why')}</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            {t('whyBody')}
          </p>
        </div>
      </div>
    </div>
  )
}
