/**
 * Raksta pārbaudes. Bez importiem, lai testējams atsevišķi.
 * Datubāzē ir savi ierobežojumi, bet tie atgriež Postgres kļūdu kodus.
 */

export type PostDraft = {
  title: string
  slug: string
  excerpt: string
  content: string
}

export type PostErrors = Partial<Record<keyof PostDraft, string>>

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/*
 * Teksta griesti. Garākais līdzšinējais raksts ir ap 11 000 rakstzīmju,
 * tātad te ir gandrīz trīskārša rezerve. Bez griestiem viens milzīgs
 * ielīmējums padara lēnu gan raksta lapu, gan visas vietnes build.
 */
export const MAX_CONTENT_LENGTH = 30000

/*
 * Cik daudz *, _ vai ~ var būt vienā rindkopā.
 *
 * marked šīs zīmes rindkopas iekšienē salīdzina pa pāriem, un, ja pāru
 * nav, darbs aug kvadrātiski: 4000 reižu "_a " vienā rindkopā ir divas
 * sekundes, 8000 — septiņas. Parastā rindkopā to ir dažas, garākajā
 * esošajā rakstā — 60. Saraksta punktu zīmes rindas sākumā neskaitām.
 * Tas pats noteikums ir datubāzē (validate_post_content).
 */
export const MAX_MARKS_PER_PARAGRAPH = 400

export function maxMarksPerParagraph(content: string): number {
  let max = 0
  for (const block of content.split(/\r?\n[ \t]*\r?\n/)) {
    const marks = block
      .replace(/^[ \t]*[*+-][ \t]/gm, '')
      .replace(/[^_*~]/g, '').length
    if (marks > max) max = marks
  }
  return max
}

export function validatePost(draft: PostDraft): PostErrors {
  const errors: PostErrors = {}

  const title = draft.title.trim()
  if (title.length < 5 || title.length > 140) {
    errors.title = 'Virsrakstam jābūt no 5 līdz 140 rakstzīmēm.'
  }

  if (draft.content.trim() === '') {
    errors.content = 'Teksts nedrīkst būt tukšs.'
  } else if (draft.content.length > MAX_CONTENT_LENGTH) {
    errors.content = `Teksts nedrīkst pārsniegt ${MAX_CONTENT_LENGTH} rakstzīmes. Sadali to vairākos rakstos.`
  } else if (maxMarksPerParagraph(draft.content) > MAX_MARKS_PER_PARAGRAPH) {
    errors.content = `Vienā rindkopā ir vairāk nekā ${MAX_MARKS_PER_PARAGRAPH} zīmes *, _ vai ~. Sadali tekstu rindkopās ar tukšu rindu.`
  }

  const slug = draft.slug.trim()
  // Tukšu slug aizpilda datubāzes trigeris
  if (slug !== '' && !SLUG_PATTERN.test(slug)) {
    errors.slug = 'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
  }

  if (draft.excerpt.length > 300) {
    errors.excerpt = 'Kopsavilkums nedrīkst pārsniegt 300 rakstzīmes.'
  }

  return errors
}

export function hasPostErrors(errors: PostErrors): boolean {
  return Object.keys(errors).length > 0
}
