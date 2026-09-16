import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ShieldCheck } from 'lucide-react'
import { LoginForm } from './login-form'
import { safeNext } from '@/lib/safe-next'

export const metadata: Metadata = {
  title: 'Ienākt',
  robots: { index: false },
}

export default async function LoginPage({
  searchParams,
}: PageProps<'/[locale]/auth/login'>) {
  const params = await searchParams
  const t = await getTranslations('Auth')

  const next = safeNext(typeof params.next === 'string' ? params.next : null)

  /*
   * Ar ko lapa atveras — ar pieteikšanos vai konta izveidi.
   *
   * Kas nospiedis "Pievienot savu profilu", tam konta gandrīz noteikti
   * vēl nav. Līdz šim viņš nonāca uz formas ar virsrakstu "Ienāc ar savu
   * kontu" un pogu "Pieteikties", ierakstīja adresi ar kaut kādu paroli
   * un dabūja "Nepareiza adrese vai parole". Reģistrācija bija maza
   * rindiņa lapas apakšā, un cilvēks tur vienkārši apstājās.
   */
  const startMode = next.startsWith('/dashboard') ? 'signup' : 'signin'

  /*
   * Paskaidrojums atkarīgs no tā, kāpēc cilvēks šeit nonāca.
   * Pieteikšanās nekad nav sveiciens — vienmēr solis ceļā uz kaut ko.
   *
   * No kurienes viņš nāk, pasaka pats saucējs, nevis mēs pēc adreses
   * uzminam. Kamēr profila lapa bija /profils/..., to varēja nolasīt no
   * ceļa; tagad tā ir mentorme.lv/vards-uzvards un no sakņu lapas pēc
   * izskata neatšķiras.
   */
  const lead =
    params.no === 'profils'
      ? t('loginLeadReview')
      : startMode === 'signup'
        ? t('signUpLead')
        : t('loginLead')

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-3xl">
        {startMode === 'signup' ? t('signUpTitle') : t('loginTitle')}
      </h1>
      <p className="mt-3 text-mist">{lead}</p>

      <div className="mt-8">
        <LoginForm next={next} startMode={startMode} />
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
