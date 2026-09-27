import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { UPLOAD_RULES, buildStoragePath, validateFile } from '@/lib/uploads'

/*
 * No kurienes bildi drīkst ņemt. Tikai pieteikšanās pakalpojumu bilžu
 * serveri — adrese nāk no lietotāja metadatiem, un bez šī saraksta
 * serveris aizietu uz jebkuru adresi, ko kāds tur ielicis.
 */
const TRUSTED_IMAGE_HOSTS = ['media.licdn.com', 'googleusercontent.com']

function trustedPictureUrl(user: User): string | null {
  const meta = user.user_metadata ?? {}
  const raw = (meta.picture ?? meta.avatar_url) as unknown
  if (typeof raw !== 'string') return null
  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase()
    const trusted = TRUSTED_IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
    return url.protocol === 'https:' && trusted ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * LinkedIn vai Google profila bilde -> mūsu Storage -> profila avatārs.
 *
 * LinkedIn, reģistrējoties, saka "profila bilde tiks koplietota ar
 * MentorMe", un cilvēks gaida, ka tā parādīsies. Līdz šim tā netika
 * izmantota vispār.
 *
 * Kopējam failu pie sevis, nevis glabājam saiti: LinkedIn bilžu adresēm
 * ir derīguma termiņš, un pēc dažām nedēļām profilā būtu salūzusi bilde.
 *
 * Nekad nemet kļūdu — bez bildes profils strādā tāpat, un cilvēks to
 * var ielikt pats. Atgriež jauno adresi vai null.
 */
export async function importProviderAvatar(
  supabase: SupabaseClient<Database>,
  user: User,
  coachId: string
): Promise<string | null> {
  const source = trustedPictureUrl(user)
  if (!source) return null

  try {
    const response = await fetch(source, { signal: AbortSignal.timeout(4000) })
    if (!response.ok) return null

    const type = (response.headers.get('content-type') ?? '').split(';')[0].trim()
    const body = await response.arrayBuffer()
    const file = { name: 'avatar', size: body.byteLength, type }
    if (validateFile(file, 'avatar')) return null

    const rule = UPLOAD_RULES.avatar
    const path = buildStoragePath(user.id, file, crypto.randomUUID())
    const { error: uploadError } = await supabase.storage
      .from(rule.bucket)
      .upload(path, body, { contentType: type, cacheControl: '3600', upsert: false })
    if (uploadError) {
      console.error('Avatāra imports — augšupielāde:', uploadError.message)
      return null
    }

    const url = supabase.storage.from(rule.bucket).getPublicUrl(path).data.publicUrl

    // Tikai ja bildes joprojām nav — lai nepārrakstītu to, ko cilvēks
    // pa to laiku ielicis pats
    const { error: updateError } = await supabase
      .from('coach_profiles')
      .update({ avatar_url: url })
      .eq('id', coachId)
      .is('avatar_url', null)
    if (updateError) {
      console.error('Avatāra imports — profils:', updateError.message)
      return null
    }

    return url
  } catch (error) {
    console.error('Avatāra imports neizdevās:', error)
    return null
  }
}
