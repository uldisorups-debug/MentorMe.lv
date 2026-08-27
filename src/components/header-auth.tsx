'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, LogOut, ShieldCheck, PenLine, User } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LinkButton } from '@/components/link-button'
import { createClient } from '@/lib/supabase/client'

type State =
  | { kind: 'loading' }
  | { kind: 'anonymous' }
  | { kind: 'signed-in'; label: string; isCoach: boolean; isAdmin: boolean }

/**
 * Galvenes labā puse.
 *
 * Viss, kas pieder kontam, ir zem viena izvēlnes — citādi galvenē
 * sanāk seši nosaukumi blakus, un vajadzīgo starp tiem neatrod.
 *
 * Auth pārbaude notiek pārlūkā, nevis serverī, lai publiskās lapas
 * paliktu statiskas.
 */
export function HeaderAuth() {
  const t = useTranslations('Auth')
  const tNav = useTranslations('Nav')
  const router = useRouter()
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
        .select('display_name, role, is_admin')
        .eq('id', userId)
        .maybeSingle()

      setState({
        kind: 'signed-in',
        label: profile?.display_name ?? t('account'),
        isCoach: profile?.role === 'coach',
        isAdmin: profile?.is_admin === true,
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
    return <span className="ml-2 h-9 w-24 animate-pulse rounded-lg bg-surface" />
  }

  if (state.kind === 'anonymous') {
    return (
      <LinkButton
        href="/auth/login?next=%2Fdashboard%2Fprofile"
        variant="outline"
        className="ml-2 h-9"
      >
        {t('addProfile')}
      </LinkButton>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="ml-2 h-9 gap-1.5 text-mist hover:text-cream">
            <span className="max-w-32 truncate">{state.label}</span>
            <ChevronDown className="size-3.5" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="min-w-52">
        {state.isCoach && (
          <>
            <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
              <User className="size-4" />
              {t('myProfile')}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/raksti" />}>
              <PenLine className="size-4" />
              {tNav('myPosts')}
            </DropdownMenuItem>
          </>
        )}

        {state.isAdmin && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldCheck className="size-4 text-gold" />
            Administrācija
          </DropdownMenuItem>
        )}

        {(state.isCoach || state.isAdmin) && <DropdownMenuSeparator />}

        <DropdownMenuItem onClick={signOut}>
          <LogOut className="size-4" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
