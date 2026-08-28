import { createClient } from '@/lib/supabase/client'
import {
  UPLOAD_RULES,
  buildStoragePath,
  pathFromPublicUrl,
  validateFile,
  type UploadError,
  type UploadKind,
} from '@/lib/uploads'

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: UploadError | { code: 'failed' } }

/**
 * Augšupielādē vienu failu lietotāja mapē.
 *
 * Publiskajiem bucket'iem atgriež publisko URL, privātajam (sertifikāti)
 * atgriež ceļu — publiska URL tam nav un nedrīkst būt.
 */
export async function uploadFile(
  kind: UploadKind,
  file: File,
  userId: string
): Promise<UploadResult> {
  const problem = validateFile(file, kind)
  if (problem) return { ok: false, error: problem }

  const rule = UPLOAD_RULES[kind]
  const path = buildStoragePath(userId, file, crypto.randomUUID())

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(rule.bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error(`Augšupielāde ${rule.bucket} neizdevās:`, error.message)
    return { ok: false, error: { code: 'failed' } }
  }

  const { data } = supabase.storage.from(rule.bucket).getPublicUrl(path)
  return { ok: true, url: data.publicUrl, path }
}

/**
 * Dzēš failu, kas vairs netiek lietots.
 *
 * Kļūdu klusē ar nolūku: ja dzēšana neizdodas, lietotājam no tā nav
 * nekādas jēgas — svarīgākais ir, ka saite no profila ir noņemta.
 */
export async function removeStoredFile(
  kind: UploadKind,
  urlOrPath: string
): Promise<void> {
  const bucket = UPLOAD_RULES[kind].bucket
  const path = pathFromPublicUrl(urlOrPath, bucket)

  if (!path) return

  const { error } = await createClient().storage.from(bucket).remove([path])
  if (error) {
    console.error(`Neizdevās izdzēst ${bucket}/${path}:`, error.message)
  }
}

/** Bucket'i, kuros glabājas lietotāja faili. Mape = user_id. */
const USER_BUCKETS = ['avatars', 'gallery', 'certificates'] as const

/**
 * Izdzēš visus viena lietotāja failus no krātuves.
 *
 * SQL to izdarīt nevar. Dzēšot rindu no storage.objects, pats fails
 * krātuvē paliek, un avatāri ar galeriju ir publiskā bucket'ā — pēc
 * tiešās saites tie joprojām atvērtos. Tāpēc failus noņemam caur
 * Storage API, pirms konts pazūd.
 */
export async function removeAllUserFiles(userId: string): Promise<void> {
  const supabase = createClient()

  for (const bucket of USER_BUCKETS) {
    const { data, error } = await supabase.storage.from(bucket).list(userId)

    if (error) {
      console.error(`Neizdevās nolasīt ${bucket}/${userId}:`, error.message)
      continue
    }

    const paths = (data ?? []).map((file) => `${userId}/${file.name}`)
    if (paths.length === 0) continue

    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (removeError) {
      console.error(`Neizdevās izdzēst ${bucket}/${userId}:`, removeError.message)
    }
  }
}
