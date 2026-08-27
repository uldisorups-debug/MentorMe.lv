import { createClient } from '@/lib/supabase/client'

/**
 * Administratora darbību žurnāls.
 *
 * Katra dzēšana un paslēpšana tiek pierakstīta. Bez tā jautājums
 * "kāpēc šis profils pazuda?" pēc mēneša nav atbildams.
 *
 * Žurnāls ir blakusefekts, ne priekšnoteikums: ja ieraksts neizdodas,
 * pati darbība tik un tā notiek. Pretējais nozīmētu, ka salūzis žurnāls
 * bloķē moderāciju.
 */
export async function logAdminAction(entry: {
  adminId: string
  adminName: string | null
  action: string
  table: string
  targetId: string | null
  targetLabel: string | null
  reason?: string | null
}): Promise<void> {
  const { error } = await createClient().from('admin_actions').insert({
    admin_id: entry.adminId,
    admin_name: entry.adminName,
    action: entry.action,
    target_table: entry.table,
    target_id: entry.targetId,
    target_label: entry.targetLabel,
    reason: entry.reason ?? null,
  })

  if (error) console.error('Žurnāla ieraksts neizdevās:', error.message)
}

/** Darbību nosaukumi žurnāla lasīšanai. */
export const ACTION_LABELS: Record<string, string> = {
  delete_user: 'Dzēsts lietotājs',
  delete_profile: 'Dzēsts profils',
  unpublish_profile: 'Profils noņemts no saraksta',
  publish_profile: 'Profils atgriezts sarakstā',
  verify_coach: 'Piešķirta verificētā zīme',
  unverify_coach: 'Noņemta verificētā zīme',
  hide_review: 'Paslēpta atsauksme',
  show_review: 'Atgriezta atsauksme',
  delete_review: 'Dzēsta atsauksme',
  unpublish_post: 'Raksts noņemts no publikācijas',
  delete_post: 'Dzēsts raksts',
  grant_admin: 'Piešķirtas administratora tiesības',
  revoke_admin: 'Noņemtas administratora tiesības',
  handle_report: 'Ziņojums apstrādāts',
}
