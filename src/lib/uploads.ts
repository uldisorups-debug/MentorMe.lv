/**
 * Failu augšupielādes noteikumi.
 *
 * Skaitļi šeit sakrīt ar bucket'u ierobežojumiem migrācijā
 * 20260826000001_init.sql. Ja maina vienu, jāmaina abi — citādi
 * Supabase noraida failu pēc tam, kad lietotājs jau ir gaidījis.
 *
 * Šis fails ar nolūku ir bez importiem, lai to var testēt atsevišķi.
 */

export type UploadKind = 'avatar' | 'gallery' | 'certificate'

export type UploadRule = {
  bucket: string
  maxBytes: number
  mimeTypes: string[]
  /** Cik failu drīkst būt kopā (galerijai) */
  maxCount?: number
}

const MB = 1024 * 1024

export const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
  avatar: {
    bucket: 'avatars',
    maxBytes: 2 * MB,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  gallery: {
    bucket: 'gallery',
    maxBytes: 5 * MB,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxCount: 3,
  },
  certificate: {
    bucket: 'certificates',
    maxBytes: 10 * MB,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
}

export type FileLike = { name: string; size: number; type: string }

export type UploadError =
  | { code: 'too-large'; limitMb: number }
  | { code: 'wrong-type'; allowed: string }
  | { code: 'too-many'; max: number }

/** Pārbauda vienu failu. null = viss kārtībā. */
export function validateFile(
  file: FileLike,
  kind: UploadKind
): UploadError | null {
  const rule = UPLOAD_RULES[kind]

  if (!rule.mimeTypes.includes(file.type)) {
    const allowed = rule.mimeTypes
      .map((type) => type.replace('image/', '').replace('application/', ''))
      .join(', ')
    return { code: 'wrong-type', allowed }
  }

  if (file.size > rule.maxBytes) {
    return { code: 'too-large', limitMb: Math.round(rule.maxBytes / MB) }
  }

  return null
}

/** Pārbauda, vai galerijā vēl ir vieta. */
export function validateCount(
  existing: number,
  adding: number,
  kind: UploadKind
): UploadError | null {
  const max = UPLOAD_RULES[kind].maxCount
  if (max !== undefined && existing + adding > max) {
    return { code: 'too-many', max }
  }
  return null
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export function extensionFor(mimeType: string): string {
  return EXTENSIONS[mimeType] ?? 'bin'
}

/**
 * Ceļš Storage bucket'ā.
 *
 * Formāts <user_id>/<nejaušs>.<pap> ir obligāts — uz tā balstās RLS
 * politikas, kas pārbauda (storage.foldername(name))[1] = auth.uid().
 * Faila oriģinālo nosaukumu neizmantojam: tajā var būt diakritika,
 * atstarpes vai ../ mēģinājumi.
 */
export function buildStoragePath(
  userId: string,
  file: FileLike,
  randomId: string
): string {
  return `${userId}/${randomId}.${extensionFor(file.type)}`
}

/**
 * Izvelk Storage ceļu no publiskā URL, lai failu varētu izdzēst.
 * Atgriež null, ja URL nav no šī bucket'a.
 */
export function pathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  const path = url.slice(index + marker.length)
  return path.length > 0 ? decodeURIComponent(path) : null
}
