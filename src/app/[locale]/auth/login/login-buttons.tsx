'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  FacebookIcon,
  GoogleIcon,
  LinkedInIcon,
} from '@/components/provider-icons'
import { createClient } from '@/lib/supabase/client'

/** Supabase provider ID — LinkedIn jaunākais ir linkedin_oidc, ne linkedin. */
type Provider = 'google' | 'linkedin_oidc' | 'facebook'

const PROVIDERS: { id: Provider; icon: typeof GoogleIcon; labelKey: string }[] = [
  { id: 'google', icon: GoogleIcon, labelKey: 'google' },
  { id: 'linkedin_oidc', icon: LinkedInIcon, labelKey: 'linkedin' },
  { id: 'facebook', icon: FacebookIcon, labelKey: 'facebook' },
]

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
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          className="h-12 w-full justify-center gap-3 text-base"
          disabled={pending !== null}
          onClick={() => signIn(provider.id)}
        >
          <provider.icon className="size-5" />
          {pending === provider.id ? t('redirecting') : t(provider.labelKey)}
        </Button>
      ))}

      {error && (
        <p className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral-soft">
          {error}
        </p>
      )}
    </div>
  )
}
