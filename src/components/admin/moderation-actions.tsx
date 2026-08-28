'use client'

import { useRouter } from '@/i18n/navigation'
import { BadgeCheck, BadgeX, Eye, EyeOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmButton } from '@/components/admin/confirm-button'
import { logAdminAction } from '@/lib/admin'
import { createClient } from '@/lib/supabase/client'

type Admin = { adminId: string; adminName: string | null }

/** Kouča profils: verificēt, noņemt no saraksta, dzēst. */
export function ProfileActions({
  id,
  label,
  isVerified,
  isPublished,
  admin,
}: {
  id: string
  label: string
  isVerified: boolean
  isPublished: boolean
  admin: Admin
}) {
  const router = useRouter()
  const supabase = createClient()

  // Konkrēts tips, ne Record<string, boolean> — citādi PostgREST
  // nepārbauda, vai lauks vispār eksistē tabulā
  async function patch(
    values: { is_verified?: boolean; is_published?: boolean },
    action: string
  ) {
    const { error } = await supabase.from('coach_profiles').update(values).eq('id', id)
    if (error) return alert(error.message)
    await logAdminAction({ ...admin, action, table: 'coach_profiles', targetId: id, targetLabel: label })
    router.refresh()
  }

  async function remove(reason: string | null) {
    const { error } = await supabase.from('coach_profiles').delete().eq('id', id)
    if (error) return alert(error.message)
    await logAdminAction({
      ...admin, action: 'delete_profile', table: 'coach_profiles',
      targetId: id, targetLabel: label, reason,
    })
    router.refresh()
  }

  return (
    <>
      <Button
        variant="ghost" size="sm"
        className="h-9 gap-1.5 text-mist hover:text-cream"
        onClick={() =>
          patch({ is_verified: !isVerified }, isVerified ? 'unverify_coach' : 'verify_coach')
        }
      >
        {isVerified ? <BadgeX className="size-3.5" /> : <BadgeCheck className="size-3.5" />}
        {isVerified ? 'Noņemt zīmi' : 'Verificēt'}
      </Button>

      <Button
        variant="ghost" size="sm"
        className="h-9 gap-1.5 text-mist hover:text-cream"
        onClick={() =>
          patch({ is_published: !isPublished }, isPublished ? 'unpublish_profile' : 'publish_profile')
        }
      >
        {isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        {isPublished ? 'Noņemt no saraksta' : 'Atgriezt sarakstā'}
      </Button>

      <ConfirmButton
        confirmLabel="Dzēst profilu"
        question={`Dzēst profilu "${label}"? Konts paliks, profils pazudīs.`}
        askReason
        onConfirm={remove}
        className="text-mist hover:text-coral"
      >
        <Trash2 className="size-3.5" />
        Dzēst
      </ConfirmButton>
    </>
  )
}

/** Atsauksme: paslēpt vai dzēst. */
export function ReviewActions({
  id, label, isVisible, admin,
}: {
  id: string
  label: string
  isVisible: boolean
  admin: Admin
}) {
  const router = useRouter()
  const supabase = createClient()

  async function toggle() {
    const { error } = await supabase.from('reviews').update({ is_visible: !isVisible }).eq('id', id)
    if (error) return alert(error.message)
    await logAdminAction({
      ...admin, action: isVisible ? 'hide_review' : 'show_review',
      table: 'reviews', targetId: id, targetLabel: label,
    })
    router.refresh()
  }

  async function remove(reason: string | null) {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) return alert(error.message)
    await logAdminAction({
      ...admin, action: 'delete_review', table: 'reviews',
      targetId: id, targetLabel: label, reason,
    })
    router.refresh()
  }

  return (
    <>
      <Button
        variant="ghost" size="sm"
        className="h-9 gap-1.5 text-mist hover:text-cream"
        onClick={toggle}
      >
        {isVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        {isVisible ? 'Paslēpt' : 'Atgriezt'}
      </Button>

      <ConfirmButton
        confirmLabel="Dzēst atsauksmi"
        question="Dzēst šo atsauksmi neatgriezeniski?"
        askReason
        onConfirm={remove}
        className="text-mist hover:text-coral"
      >
        <Trash2 className="size-3.5" />
        Dzēst
      </ConfirmButton>
    </>
  )
}

/** Raksts: noņemt no publikācijas, atdot atpakaļ vai dzēst. */
export function PostActions({
  id, label, isPublished, hiddenByAdmin, admin,
}: {
  id: string
  label: string
  isPublished: boolean
  /** Vai rakstu noņēma administrators, nevis pats autors */
  hiddenByAdmin: boolean
  admin: Admin
}) {
  const router = useRouter()
  const supabase = createClient()

  /*
   * hidden_by_admin atšķir, kurš rakstu noņēma. Bez tā autors savu
   * rakstu vienkārši publicēja no jauna, un administratora lēmums
   * neko nenozīmēja.
   */
  async function unpublish() {
    const { error } = await supabase
      .from('posts')
      .update({ status: 'draft', hidden_by_admin: true })
      .eq('id', id)
    if (error) return alert(error.message)
    await logAdminAction({
      ...admin, action: 'unpublish_post', table: 'posts', targetId: id, targetLabel: label,
    })
    router.refresh()
  }

  /** Kļūdas gadījumā — raksts atgriežas autora rokās */
  async function release() {
    const { error } = await supabase
      .from('posts')
      .update({ hidden_by_admin: false })
      .eq('id', id)
    if (error) return alert(error.message)
    await logAdminAction({
      ...admin, action: 'release_post', table: 'posts', targetId: id, targetLabel: label,
    })
    router.refresh()
  }

  async function remove(reason: string | null) {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) return alert(error.message)
    await logAdminAction({
      ...admin, action: 'delete_post', table: 'posts',
      targetId: id, targetLabel: label, reason,
    })
    router.refresh()
  }

  return (
    <>
      {isPublished && (
        <Button
          variant="ghost" size="sm"
          className="h-9 gap-1.5 text-mist hover:text-cream"
          onClick={unpublish}
        >
          <EyeOff className="size-3.5" />
          Uz melnrakstu
        </Button>
      )}

      {hiddenByAdmin && (
        <Button
          variant="ghost" size="sm"
          className="h-9 gap-1.5 text-mist hover:text-cream"
          onClick={release}
        >
          <Eye className="size-3.5" />
          Atdot autoram
        </Button>
      )}

      <ConfirmButton
        confirmLabel="Dzēst rakstu"
        question={`Dzēst rakstu "${label}" neatgriezeniski?`}
        askReason
        onConfirm={remove}
        className="text-mist hover:text-coral"
      >
        <Trash2 className="size-3.5" />
        Dzēst
      </ConfirmButton>
    </>
  )
}
