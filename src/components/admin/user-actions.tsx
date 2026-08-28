'use client'

import { useRouter } from '@/i18n/navigation'
import { ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { logAdminAction } from '@/lib/admin'
import { createClient } from '@/lib/supabase/client'
import { removeAllUserFiles } from '@/lib/upload-client'

export function UserActions({
  userId,
  userName,
  isAdmin,
  isSelf,
  adminId,
  adminName,
}: {
  userId: string
  userName: string
  isAdmin: boolean
  isSelf: boolean
  adminId: string
  adminName: string | null
}) {
  const router = useRouter()
  const supabase = createClient()

  async function toggleAdmin() {
    const next = !isAdmin
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: next })
      .eq('id', userId)

    if (error) {
      // Datubāzes trigeris met kļūdu, ja tas ir pēdējais administrators
      alert(error.message)
      return
    }

    // Trigeris klusi atgriež veco vērtību, ja darbība nav atļauta —
    // tāpēc pārbaudām rezultātu, nevis paļaujamies uz kļūdas neesamību
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle()

    if (data?.is_admin !== next) {
      alert('Datubāze šo izmaiņu neatļāva.')
      return
    }

    await logAdminAction({
      adminId,
      adminName,
      action: next ? 'grant_admin' : 'revoke_admin',
      table: 'profiles',
      targetId: userId,
      targetLabel: userName,
    })
    router.refresh()
  }

  async function remove(reason: string | null) {
    // Faili pirmie — SQL tos izdzēst nevar, tikai storage.objects rindu
    await removeAllUserFiles(userId)

    const { error } = await supabase.rpc('admin_delete_user', {
      target_id: userId,
      target_label: userName,
      reason,
    })
    if (error) {
      alert(error.message)
      return
    }
    router.refresh()
  }

  return (
    <>
      {!isSelf && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-mist hover:text-cream"
          onClick={toggleAdmin}
        >
          {isAdmin ? (
            <>
              <ShieldOff className="size-3.5" />
              Noņemt admin
            </>
          ) : (
            <>
              <ShieldCheck className="size-3.5" />
              Padarīt par admin
            </>
          )}
        </Button>
      )}

      {!isSelf && !isAdmin && (
        <ConfirmButton
          confirmLabel="Dzēst neatgriezeniski"
          question={`Dzēst ${userName} un visus viņa datus? Atsaukt nevar.`}
          askReason
          onConfirm={remove}
          className="text-mist hover:text-coral"
        >
          <Trash2 className="size-3.5" />
          Dzēst
        </ConfirmButton>
      )}
    </>
  )
}
