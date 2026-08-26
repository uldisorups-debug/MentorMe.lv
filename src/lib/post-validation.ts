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

export function validatePost(draft: PostDraft): PostErrors {
  const errors: PostErrors = {}

  const title = draft.title.trim()
  if (title.length < 5 || title.length > 140) {
    errors.title = 'Virsrakstam jābūt no 5 līdz 140 rakstzīmēm.'
  }

  if (draft.content.trim() === '') {
    errors.content = 'Teksts nedrīkst būt tukšs.'
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
