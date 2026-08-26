'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'

export function RolePicker({
  userId,
  displayName,
  next,
}: {
  userId: string
  displayName: string
  next: string
}) {
  const t = useTranslations('Onboarding')
  const router = useRouter()

  const [role, setRole] = useState<UserRole>('client')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const options: { value: UserRole; icon: typeof Search; title: string; body: string }[] = [
    { value: 'client', icon: Search, title: t('clientTitle'), body: t('clientBody') },
    { value: 'coach', icon: UserPlus, title: t('coachTitle'), body: t('coachBody') },
  ]

  async function submit() {
    setSaving(true)
    setError(null)

    const supabase = createClient()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role, onboarded_at: new Date().toISOString() })
      .eq('id', userId)

    if (profileError) {
      console.error('Lomas saglabāšana neizdevās:', profileError.message)
      setError(t('error'))
      setSaving(false)
      return
    }

    // Koučam uzreiz izveidojam tukšu profilu, ko dashboard varēs rediģēt.
    // slug ģenerē datubāzes trigeris, is_published paliek false.
    if (role === 'coach') {
      const { error: coachError } = await supabase
        .from('coach_profiles')
        .insert({ user_id: userId, full_name: displayName })

      // 23505 = jau eksistē; tā nav kļūda, ja cilvēks atgriežas
      if (coachError && coachError.code !== '23505') {
        console.error('Kouča profila izveide neizdevās:', coachError.message)
        setError(t('error'))
        setSaving(false)
        return
      }
    }

    router.replace(role === 'coach' && next === '/' ? '/dashboard/profile' : next)
    router.refresh()
  }

  return (
    <div>
      <div role="radiogroup" aria-label={t('title')} className="flex flex-col gap-3">
        {options.map((option) => {
          const selected = role === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setRole(option.value)}
              className={cn(
                'flex items-start gap-4 rounded-xl border p-5 text-left transition-colors',
                'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                selected
                  ? 'border-gold/60 bg-gold/10'
                  : 'border-hairline bg-surface hover:border-mist/30'
              )}
            >
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-lg border',
                  selected ? 'border-gold/40 bg-ink' : 'border-hairline bg-ink'
                )}
              >
                <option.icon
                  className={cn('size-5', selected ? 'text-gold' : 'text-mist')}
                />
              </span>
              <span>
                <span className="block font-medium">{option.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-mist">
                  {option.body}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {error && <p className="mt-4 text-sm text-coral">{error}</p>}

      <Button
        className="mt-6 h-12 w-full text-base"
        disabled={saving}
        onClick={submit}
      >
        {saving ? t('submitting') : t('submit')}
      </Button>

      <p className="mt-3 text-center text-xs text-mist">{t('changeLater')}</p>
    </div>
  )
}
