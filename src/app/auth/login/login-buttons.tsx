'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { GoogleIcon, LinkedInIcon } from '@/components/provider-icons'
import { createClient } from '@/lib/supabase/client'

/** Supabase provider ID — LinkedIn jaunākais ir linkedin_oidc, ne linkedin. */
type Provider = 'google' | 'linkedin_oidc'

export function LoginButtons({ next }: { next: string }) {
  const t = useTranslations('Auth')
  const [pending, setPending] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function signIn(provider: Provider) {
    setPending(provider)
    setError(null)

    const supabase = createClient()
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('next', next)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callback.toString() },
    })

    if (oauthError) {
      // Tipiskākais iemesls: provider nav ieslēgts Supabase panelī
      console.error('OAuth kļūda:', oauthError.message)
      setError(oauthError.message)
      setPending(null)
    }
    // Ja viss labi, pārlūks jau aiziet uz provider lapu
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="outline"
        className="h-12 w-full justify-center gap-3 text-base"
        disabled={pending !== null}
        onClick={() => signIn('google')}
      >
        <GoogleIcon className="size-5" />
        {pending === 'google' ? t('redirecting') : t('google')}
      </Button>

      <Button
        variant="outline"
        className="h-12 w-full justify-center gap-3 text-base"
        disabled={pending !== null}
        onClick={() => signIn('linkedin_oidc')}
      >
        <LinkedInIcon className="size-5" />
        {pending === 'linkedin_oidc' ? t('redirecting') : t('linkedin')}
      </Button>

      {error && (
        <p className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-soft">
          {error}
        </p>
      )}
    </div>
  )
}
