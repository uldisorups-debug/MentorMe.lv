'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleIcon } from '@/components/provider-icons'
import { createClient } from '@/lib/supabase/client'
import { validateContact } from '@/lib/contacts'

/**
 * Divi ceļi iekšā: Google un saite uz e-pastu.
 *
 * LinkedIn un Facebook te bija, bet nestrādāja — abiem Supabase pusē
 * bija iekopēts Google client ID. Pat ar pareizajiem datiem Facebook
 * prasa app review, pirms tur var ienākt kāds cits, ne pats
 * izstrādātājs. Poga, kas met kļūdu, ir sliktāka par pogu, kuras nav.
 * E-pasta saite nosedz visus, kam Google konta nav, un parole nav
 * jāizdomā nevienam.
 */
export function LoginButtons({ next }: { next: string }) {
  const t = useTranslations('Auth')
  const [pending, setPending] = useState<'google' | 'email' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)

  /** Kurp Supabase atgriež cilvēku pēc apstiprināšanas. */
  function callbackUrl(): string {
    const url = new URL('/auth/callback', window.location.origin)
    url.searchParams.set('next', next)
    return url.toString()
  }

  async function signInWithGoogle() {
    setPending('google')
    setError(null)

    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    })

    if (oauthError) {
      console.error('OAuth kļūda:', oauthError.message)
      setError(oauthError.message)
      setPending(null)
    }
    // Ja viss labi, pārlūks jau aiziet uz Google
  }

  async function signInWithEmail(event: React.FormEvent) {
    event.preventDefault()

    const address = email.trim()
    // Tā pati adreses pārbaude, kas kontaktu laukiem — viens noteikums
    if (address === '' || validateContact('email', address) !== null) {
      setError(t('emailInvalid'))
      return
    }

    setPending('email')
    setError(null)

    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: callbackUrl() },
    })

    setPending(null)

    if (otpError) {
      console.error('E-pasta saites kļūda:', otpError.message)
      setError(otpError.message)
      return
    }

    setSentTo(address)
  }

  /*
   * Pēc nosūtīšanas forma pazūd pavisam. Ja tā paliktu, cilvēks spiestu
   * vēl un vēl, un Supabase viņu sāktu bremzēt par biežiem pieprasījumiem.
   */
  if (sentTo) {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 px-5 py-5">
        <p className="flex items-center gap-2 font-medium">
          <Mail className="size-4 text-gold" />
          {t('emailSentTitle')}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          {t('emailSentBody', { email: sentTo })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 -ml-2 text-mist"
          onClick={() => {
            setSentTo(null)
            setEmail('')
          }}
        >
          {t('emailOther')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Button
        variant="outline"
        className="h-12 w-full justify-center gap-3 text-base"
        disabled={pending !== null}
        onClick={signInWithGoogle}
      >
        <GoogleIcon className="size-5" />
        {pending === 'google' ? t('redirecting') : t('google')}
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-mist">{t('or')}</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={signInWithEmail} className="flex flex-col gap-3" noValidate>
        <label htmlFor="login-email" className="text-sm text-mist">
          {t('emailLabel')}
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setError(null)
          }}
          className="h-12 bg-surface"
        />
        <Button
          type="submit"
          className="h-12 w-full justify-center gap-2 text-base"
          disabled={pending !== null}
        >
          <Mail className="size-4" />
          {pending === 'email' ? t('emailSending') : t('emailButton')}
        </Button>
      </form>

      {error && (
        <p className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-soft">
          {error}
        </p>
      )}
    </div>
  )
}
