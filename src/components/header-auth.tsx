'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { createClient } from '@/lib/supabase/client'

type State =
  | { kind: 'loading' }
  | { kind: 'anonymous' }
  | { kind: 'signed-in'; label: string; isCoach: boolean }

/**
 * Galvenes labā puse.
 *
 * Auth pārbaude notiek pārlūkā, nevis serverī — tā visas publiskās lapas
 * paliek statiskas un ISR turpina strādāt.
 */
export function HeaderAuth() {
  const t = useTranslations('Auth')
  const tNav = useTranslations('Nav')
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const supabase = createClient()

    async function load(userId: string | null) {
      if (!userId) {
        setState({ kind: 'anonymous' })
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', userId)
        .maybeSingle()

      setState({
        kind: 'signed-in',
        label: profile?.display_name ?? t('account'),
        isCoach: profile?.role === 'coach',
      })
    }

    supabase.auth.getUser().then(({ data }) => load(data.user?.id ?? null))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session?.user.id ?? null)
    })

    return () => sub.subscription.unsubscribe()
  }, [t])

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (state.kind === 'loading') {
    return <span className="h-9 w-20 animate-pulse rounded-lg bg-surface" />
  }

  if (state.kind === 'anonymous') {
    const next = pathname && pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : ''
    return (
      <LinkButton href={`/auth/login${next}`} variant="outline" className="ml-2 h-9">
        {tNav('login')}
      </LinkButton>
    )
  }

  return (
    <span className="ml-2 flex items-center gap-1">
      {state.isCoach && (
        <LinkButton
          href="/dashboard/profile"
          variant="ghost"
          className="hidden text-mist hover:text-cream sm:inline-flex"
        >
          {t('myProfile')}
        </LinkButton>
      )}
      <span className="hidden max-w-32 truncate text-sm text-mist sm:inline">
        {state.label}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t('signOut')}
        className="text-mist hover:text-cream"
        onClick={signOut}
      >
        <LogOut className="size-4" />
      </Button>
    </span>
  )
}
