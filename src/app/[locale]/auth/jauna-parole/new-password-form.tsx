'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LinkButton } from '@/components/link-button'
import { createClient } from '@/lib/supabase/client'
import { authErrorKey, MIN_PASSWORD_LENGTH, passwordTooShort } from '@/lib/auth-errors'

/**
 * Jaunās paroles uzstādīšana pēc e-pasta saites.
 *
 * Šeit nonāk tikai tas, kurš saiti no savas pastkastītes ir atvēris —
 * sesija jau ir izveidota /auth/callback. Vecā parole netiek prasīta:
 * ja cilvēks tiek klāt savam pastam, viņš to var arī nezināt, un tieši
 * tāpēc viņš šeit ir.
 */
export function NewPasswordForm({ next }: { next: string }) {
  const t = useTranslations('Auth')
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setHasSession(data.user !== null)
        setChecking(false)
      })
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    if (passwordTooShort(password)) {
      setError(t('passwordShort', { min: MIN_PASSWORD_LENGTH }))
      return
    }

    setPending(true)
    setError(null)

    const { error: updateError } = await createClient().auth.updateUser({
      password,
    })

    if (updateError) {
      setPending(false)
      const key = authErrorKey(updateError.message)
      setError(key ? t(key) : updateError.message)
      return
    }

    // Pilna pārlāde, lai serveris ieraudzītu atjaunoto sesiju
    window.location.assign(next)
  }

  if (checking) {
    return <p className="text-sm text-mist">{t('working')}</p>
  }

  if (!hasSession) {
    return (
      <div className="rounded-xl border border-coral/30 bg-coral/5 px-5 py-5">
        <p className="text-sm leading-relaxed text-mist">
          {t('newPasswordNoSession')}
        </p>
        <LinkButton
          href="/auth/login"
          variant="outline"
          size="sm"
          className="mt-4"
        >
          {t('newPasswordAskAgain')}
        </LinkButton>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <label htmlFor="new-password" className="text-sm text-mist">
        {t('passwordNew')}
      </label>
      <Input
        id="new-password"
        type="password"
        autoComplete="new-password"
        autoFocus
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
          setError(null)
        }}
        className="h-12 bg-surface"
      />
      <p className="text-xs text-mist">
        {t('passwordHint', { min: MIN_PASSWORD_LENGTH })}
      </p>

      <Button
        type="submit"
        className="mt-1 h-12 w-full justify-center gap-2 text-base"
        disabled={pending}
      >
        <KeyRound className="size-4" />
        {pending ? t('working') : t('newPasswordSave')}
      </Button>

      {error && (
        <p className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-soft">
          {error}
        </p>
      )}
    </form>
  )
}
