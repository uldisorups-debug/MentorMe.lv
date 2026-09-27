'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

/**
 * "Nevari atrast savu tēmu? Ieraksti to šeit."
 *
 * Agrāk vienīgais ceļš bija komentārs vai e-pasts, un tēmu kāds
 * pievienoja ar roku. Tagad ieteikums nonāk admin panelī (/admin/temas),
 * un pēc apstiprināšanas tēma parādās sarakstā un uzreiz arī šī
 * cilvēka profilā, ja tajā ir vieta.
 *
 * Nav daļa no profila melnraksta: ieteikums aiziet uzreiz, neatkarīgi
 * no tā, vai profils ir saglabāts.
 */
export function TopicSuggest({ userId }: { userId: string }) {
  const t = useTranslations('Editor')
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'limit'>('idle')

  async function send() {
    const value = text.trim()
    if (value.length < 2) return

    setState('sending')
    const { error } = await createClient()
      .from('topic_suggestions')
      .insert({ user_id: userId, text: value.slice(0, 80) })

    if (error) {
      console.error('Tēmas ieteikums neizdevās:', error.message)
      setState(error.code === 'P0005' ? 'limit' : 'error')
      return
    }
    setText('')
    setState('sent')
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-hairline p-4">
      <p className="text-sm">{t('suggestTitle')}</p>
      <p className="mt-1 text-xs text-mist">{t('suggestHint')}</p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={text}
          maxLength={80}
          placeholder={t('suggestPlaceholder')}
          onChange={(event) => {
            setText(event.target.value)
            if (state !== 'sending') setState('idle')
          }}
          onKeyDown={(event) => {
            // Enter nesūta visu profila formu, tikai šo ieteikumu
            if (event.key === 'Enter') {
              event.preventDefault()
              void send()
            }
          }}
          className="bg-ink"
        />
        <Button
          type="button"
          variant="outline"
          disabled={state === 'sending' || text.trim().length < 2}
          onClick={() => void send()}
        >
          {state === 'sending' ? t('saving') : t('suggestSend')}
        </Button>
      </div>

      {state === 'sent' && <p className="mt-2 text-xs text-gold">{t('suggestSent')}</p>}
      {state === 'limit' && <p className="mt-2 text-xs text-coral">{t('suggestLimit')}</p>}
      {state === 'error' && <p className="mt-2 text-xs text-coral">{t('saveError')}</p>}
    </div>
  )
}
