'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Trash2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { removeAllUserFiles } from '@/lib/upload-client'

/**
 * Konta un visu datu dzēšana (VDAR tiesības uz dzēšanu).
 *
 * Vispirms failus, tad kontu. SQL failus izdzēst nevar — tas noņem
 * tikai storage.objects rindu, bet pats fails krātuvē paliek un
 * publiskajā bucket'ā pēc tiešās saites joprojām atveras.
 *
 * Atsaukt nevar, tāpēc prasām ierakstīt vārdu — poga vien būtu par
 * vieglu nejauši nospiest.
 */
export function DeleteAccount() {
  const t = useTranslations('Account')
  const router = useRouter()

  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const word = t('deleteConfirmWord')
  const canDelete = typed.trim().toUpperCase() === word

  async function remove() {
    if (!canDelete) return
    setDeleting(true)
    setError(null)

    const supabase = createClient()

    // Faili pirmie: pēc konta dzēšanas sesijas vairs nav un
    // krātuvei mēs klāt netiekam
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) await removeAllUserFiles(user.id)

    const { error: rpcError } = await supabase.rpc('delete_own_account')

    if (rpcError) {
      console.error('Konta dzēšana neizdevās:', rpcError.message)
      setError(t('deleteError'))
      setDeleting(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-coral/30 bg-coral/5 p-6">
      <h2 className="flex items-center gap-2 font-display text-xl">
        <TriangleAlert className="size-5 text-coral" />
        {t('deleteTitle')}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-mist">{t('deleteBody')}</p>

      {!confirming ? (
        <Button
          type="button"
          variant="outline"
          className="mt-5 h-10 gap-2 border-coral/40 text-coral hover:bg-coral/10"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-4" />
          {t('deleteCta')}
        </Button>
      ) : (
        <div className="mt-5">
          <label htmlFor="delete-confirm" className="text-sm font-medium">
            {t('deleteConfirmTitle')}
          </label>
          <p className="mt-1 text-xs text-mist">{t('deleteConfirmBody')}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Input
              id="delete-confirm"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={word}
              autoComplete="off"
              className="w-40 bg-ink"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 border-coral/40 text-coral hover:bg-coral/10"
              disabled={!canDelete || deleting}
              onClick={remove}
            >
              {deleting ? t('deleting') : t('deleteCta')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 text-mist"
              disabled={deleting}
              onClick={() => {
                setConfirming(false)
                setTyped('')
                setError(null)
              }}
            >
              {t('cancel')}
            </Button>
          </div>

          {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        </div>
      )}
    </div>
  )
}
