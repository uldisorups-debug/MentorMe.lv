/**
 * Bilžu samazināšana pārlūkā, pirms tās aiziet uz serveri.
 *
 * Trīs iemesli, un visi ir īsti:
 *
 * 1. Krātuve. Telefona foto ir 3–5 MB. Pēc samazināšanas — ap 120 KB.
 *    Vienā bezmaksas gigabaitā tas ir starpība starp 500 un 8000 profiliem.
 *
 * 2. Lietotājs. Bez šī parasts telefona foto pārsniedz 2 MB robežu un
 *    tiek noraidīts. Cilvēks nesaprot, kāpēc, un profils paliek bez sejas.
 *
 * 3. Privātums. Telefona foto nes līdzi EXIF datus, tostarp GPS
 *    koordinātes — tur, kur bilde uzņemta. Pārzīmēšana caur canvas tos
 *    nokniebj visus. Cilvēks, kurš ieliek savu bildi, nav parakstījies
 *    zem tā, ka mēs zinām viņa mājas adresi.
 */

/** Garākā mala pēc samazināšanas. Avatārs lapā tiek rādīts līdz 96 px. */
export const MAX_DIMENSION = 640

/** Cik lielu failu vispār pieņemam pirms atkodēšanas. */
export const MAX_INPUT_BYTES = 25 * 1024 * 1024

const QUALITY = 0.82

export type ResizeFailure = 'not-an-image' | 'input-too-large' | 'decode-failed'

export type ResizeResult =
  | { ok: true; file: File; before: number; after: number }
  | { ok: false; error: ResizeFailure }

/**
 * Jaunais izmērs, saglabājot proporcijas.
 *
 * Mazāku bildi nepalielinām — no tā kvalitāte neuzlabotos, tikai fails
 * kļūtu lielāks.
 */
export function fitWithin(
  width: number,
  height: number,
  max: number = MAX_DIMENSION
): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= max) return { width, height }

  const scale = max / longest
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/** Faila nosaukums ar jauno paplašinājumu. */
export function renameFor(original: string, mimeType: string): string {
  const ext = mimeType === 'image/webp' ? 'webp' : 'jpg'
  const base = original.replace(/\.[^.]+$/, '') || 'attels'
  return `${base}.${ext}`
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

export async function shrinkImage(file: File): Promise<ResizeResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'not-an-image' }
  }
  // Pārbaudām pirms atkodēšanas: milzīgs fails pārlūku iekārtu uz vietas
  if (file.size > MAX_INPUT_BYTES) {
    return { ok: false, error: 'input-too-large' }
  }

  let bitmap: ImageBitmap
  try {
    // imageOrientation: telefona bildes bieži ir pagrieztas, un pagrieziens
    // dzīvo EXIF datos, kurus mēs tūlīt izmetīsim. Jāpielieto tagad.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return { ok: false, error: 'decode-failed' }
  }

  const { width, height } = fitWithin(bitmap.width, bitmap.height)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return { ok: false, error: 'decode-failed' }
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  // WebP ir mazāks pie tās pašas kvalitātes. Ja pārlūks to neprot,
  // toBlob klusi atdod PNG — tad labāk paši lūdzam JPEG.
  let blob = await toBlob(canvas, 'image/webp', QUALITY)
  if (!blob || blob.type !== 'image/webp') {
    blob = await toBlob(canvas, 'image/jpeg', QUALITY)
  }
  if (!blob) return { ok: false, error: 'decode-failed' }

  return {
    ok: true,
    file: new File([blob], renameFor(file.name, blob.type), {
      type: blob.type,
      lastModified: Date.now(),
    }),
    before: file.size,
    after: blob.size,
  }
}
