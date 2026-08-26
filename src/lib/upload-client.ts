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

  if (kind === 'certificate') {
    return { ok: true, url: path, path }
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
  const path =
    kind === 'certificate' ? urlOrPath : pathFromPublicUrl(urlOrPath, bucket)

  if (!path) return

  const { error } = await createClient().storage.from(bucket).remove([path])
  if (error) {
    console.error(`Neizdevās izdzēst ${bucket}/${path}:`, error.message)
  }
}
