'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { KeyRound, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FacebookIcon,
  GoogleIcon,
  LinkedInIcon,
} from '@/components/provider-icons'
import { createClient } from '@/lib/supabase/client'
import { validateContact } from '@/lib/contacts'
import { authErrorKey, MIN_PASSWORD_LENGTH, passwordTooShort } from '@/lib/auth-errors'

type Mode = 'signin' | 'signup' | 'forgot'
type Sent = { kind: 'signup' | 'forgot'; email: string }

/** Supabase provider ID — LinkedIn jaunākais ir linkedin_oidc, ne linkedin. */
type Provider = 'google' | 'linkedin_oidc' | 'facebook'

const PROVIDERS: { id: Provider; icon: typeof GoogleIcon; labelKey: string }[] = [
  { id: 'google', icon: GoogleIcon, labelKey: 'google' },
  { id: 'linkedin_oidc', icon: LinkedInIcon, labelKey: 'linkedin' },
  { id: 'facebook', icon: FacebookIcon, labelKey: 'facebook' },
]

/**
 * Divi ceļi iekšā: svešs konts vai e-pasts ar paroli.
 *
 * Parole, nevis tikai saite uz pastu: ar saiti katra ienākšana nozīmē
 * iešanu uz pastkastīti. Parole to prasa vienreiz. Aizmirstu paroli
 * atjauno pa e-pastu — ja cilvēks tiek klāt savai pastkastītei, tas
 * pierāda tikpat daudz, cik vecā parole.
 */
export function LoginForm({ next }: { next: string }) {
  const t = useTranslations('Auth')
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState<Provider | 'email' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<Sent | null>(null)

  function callbackUrl(target = next): string {
    const url = new URL('/auth/callback', window.location.origin)
    url.searchParams.set('next', target)
    return url.toString()
  }

  /** Supabase runā angliski — pārtulkojam, ko protam. */
  function showError(message: string) {
    const key = authErrorKey(message)
    setError(key ? t(key) : message)
  }

  function switchMode(to: Mode) {
    setMode(to)
    setError(null)
    setPassword('')
  }

  async function signInWithProvider(provider: Provider) {
    setPending(provider)
    setError(null)

    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl() },
    })

    if (oauthError) {
      // Tipiskākais iemesls: provider nav ieslēgts vai tam ir svešas atslēgas
      console.error('OAuth kļūda:', oauthError.message)
      showError(oauthError.message)
      setPending(null)
    }
    // Ja viss labi, pārlūks jau aiziet uz provider lapu
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    const address = email.trim()
    // Tā pati adreses pārbaude, kas kontaktu laukiem — viens noteikums
    if (address === '' || validateContact('email', address) !== null) {
      setError(t('emailInvalid'))
      return
    }
    if (mode !== 'forgot' && passwordTooShort(password)) {
      setError(t('passwordShort', { min: MIN_PASSWORD_LENGTH }))
      return
    }

    setPending('email')
    setError(null)
    const supabase = createClient()

    if (mode === 'forgot') {
      // Pēc paroles nomaiņas cilvēks aiziet turp, kur sākotnēji gribēja
      const back = new URL('/auth/jauna-parole', window.location.origin)
      back.searchParams.set('next', next)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        address,
        { redirectTo: callbackUrl(`${back.pathname}${back.search}`) }
      )
      setPending(null)

      if (resetError) {
        showError(resetError.message)
        return
      }
      setSent({ kind: 'forgot', email: address })
      return
    }

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: address,
        password,
        options: { emailRedirectTo: callbackUrl() },
      })
      setPending(null)

      if (signUpError) {
        showError(signUpError.message)
        return
      }

      /*
       * Ja adrese jau reģistrēta, Supabase apzināti atbild ar "izdevās",
       * bet tukšu identitāšu sarakstu — lai svešs nevar pārbaudīt, kurš
       * lapā ir. Vēstule tādā gadījumā neatnāk, tāpēc "pārbaudi pastu"
       * te būtu meli.
       */
      if (data.user && data.user.identities?.length === 0) {
        setError(t('errAlreadyRegistered'))
        return
      }

      setSent({ kind: 'signup', email: address })
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: address,
      password,
    })

    if (signInError) {
      setPending(null)
      showError(signInError.message)
      return
    }

    // Sesija ir sīkdatnēs; pilna pārlāde, lai serveris to ieraudzītu
    window.location.assign(next)
  }

  /*
   * Pēc nosūtīšanas forma pazūd pavisam. Ja tā paliktu, cilvēks spiestu
   * vēl un vēl, un Supabase viņu sāktu bremzēt par biežiem pieprasījumiem.
   */
  if (sent) {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 px-5 py-5">
        <p className="flex items-center gap-2 font-medium">
          <Mail className="size-4 text-gold" />
          {sent.kind === 'signup' ? t('signUpSentTitle') : t('resetSentTitle')}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          {sent.kind === 'signup'
            ? t('signUpSentBody', { email: sent.email })
            : t('resetSentBody', { email: sent.email })}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 -ml-2 text-mist"
          onClick={() => {
            setSent(null)
            switchMode('signin')
          }}
        >
          {t('backToSignIn')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {PROVIDERS.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="h-12 w-full justify-center gap-3 text-base"
            disabled={pending !== null}
            onClick={() => signInWithProvider(provider.id)}
          >
            <provider.icon className="size-5" />
            {pending === provider.id ? t('redirecting') : t(provider.labelKey)}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-mist">{t('or')}</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      {mode === 'forgot' && (
        <p className="text-sm leading-relaxed text-mist">{t('resetLead')}</p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
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

        {mode !== 'forgot' && (
          <>
            <label htmlFor="login-password" className="mt-1 text-sm text-mist">
              {t('password')}
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete={
                mode === 'signup' ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError(null)
              }}
              className="h-12 bg-surface"
            />
            {mode === 'signup' && (
              <p className="text-xs text-mist">
                {t('passwordHint', { min: MIN_PASSWORD_LENGTH })}
              </p>
            )}
          </>
        )}

        <Button
          type="submit"
          className="mt-1 h-12 w-full justify-center gap-2 text-base"
          disabled={pending !== null}
        >
          <KeyRound className="size-4" />
          {pending === 'email'
            ? t('working')
            : mode === 'signup'
              ? t('signUpButton')
              : mode === 'forgot'
                ? t('resetButton')
                : t('signInButton')}
        </Button>
      </form>

      {error && (
        <p className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-soft">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {mode === 'signin' ? (
          <>
            <button
              type="button"
              className="text-gold hover:underline"
              onClick={() => switchMode('signup')}
            >
              {t('noAccount')}
            </button>
            <button
              type="button"
              className="text-mist hover:text-cream"
              onClick={() => switchMode('forgot')}
            >
              {t('forgot')}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="text-gold hover:underline"
            onClick={() => switchMode('signin')}
          >
            {t('haveAccount')}
          </button>
        )}
      </div>
    </div>
  )
}
