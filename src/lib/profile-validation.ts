/**
 * Kouča profila pārbaudes pirms saglabāšanas.
 *
 * Datubāzē ir savi ierobežojumi (price_range_valid, years_experience
 * robežas), bet tie atgriež Postgres kļūdu kodus. Šis dod cilvēkam
 * saprotamu tekstu pie pareizā lauka.
 *
 * Bez importiem — testējams atsevišķi.
 */

export type ProfileDraft = {
  slug: string
  full_name: string
  tagline: string
  bio: string
  years_experience: string
  price_from: string
  price_to: string
  calendly_url: string
  niches: string[]
  session_languages: string[]
  is_published: boolean
}

export type FieldErrors = Partial<Record<keyof ProfileDraft, string>>

/** Publicēšanai vajag vairāk nekā melnrakstam. */
/**
 * Publiskā adrese: mazie burti, cipari un defises.
 * Bez diakritikas — tā URL'os salūzt un kopējot pārvēršas par %C4%81.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateProfile(draft: ProfileDraft): FieldErrors {
  const errors: FieldErrors = {}

  const slug = draft.slug.trim()
  if (slug.length < 3) {
    errors.slug = 'Adresei jābūt vismaz 3 rakstzīmes garai.'
  } else if (slug.length > 60) {
    errors.slug = 'Adrese nedrīkst pārsniegt 60 rakstzīmes.'
  } else if (!SLUG_PATTERN.test(slug)) {
    errors.slug =
      'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
  }

  if (draft.full_name.trim().length < 2) {
    errors.full_name = 'Vārds ir obligāts.'
  } else if (draft.full_name.trim().length > 80) {
    errors.full_name = 'Vārds nedrīkst būt garāks par 80 rakstzīmēm.'
  }

  if (draft.tagline.length > 120) {
    errors.tagline = 'Īsais apraksts nedrīkst pārsniegt 120 rakstzīmes.'
  }

  if (draft.bio.length > 4000) {
    errors.bio = 'Apraksts nedrīkst pārsniegt 4000 rakstzīmes.'
  }

  const years = draft.years_experience.trim()
  if (years !== '') {
    const value = Number(years)
    if (!Number.isInteger(value) || value < 0 || value > 80) {
      errors.years_experience = 'Jābūt veselam skaitlim no 0 līdz 80.'
    }
  }

  const from = draft.price_from.trim()
  const to = draft.price_to.trim()
  const fromValue = from === '' ? null : Number(from)
  const toValue = to === '' ? null : Number(to)

  if (fromValue !== null && (!Number.isFinite(fromValue) || fromValue < 0)) {
    errors.price_from = 'Cenai jābūt skaitlim, kas nav negatīvs.'
  }
  if (toValue !== null && (!Number.isFinite(toValue) || toValue < 0)) {
    errors.price_to = 'Cenai jābūt skaitlim, kas nav negatīvs.'
  }
  if (
    fromValue !== null &&
    toValue !== null &&
    !errors.price_from &&
    !errors.price_to &&
    toValue < fromValue
  ) {
    errors.price_to = 'Augšējai cenai jābūt lielākai par apakšējo.'
  }

  const calendly = draft.calendly_url.trim()
  if (calendly !== '') {
    let parsed: URL | null = null
    try {
      parsed = new URL(calendly)
    } catch {
      parsed = null
    }
    if (!parsed || parsed.protocol !== 'https:') {
      errors.calendly_url = 'Jābūt pilnai https:// saitei.'
    }
  }

  // Publicētam profilam prasības ir stingrākas
  if (draft.is_published) {
    if (draft.tagline.trim() === '') {
      errors.tagline = 'Lai publicētu, vajag īso aprakstu.'
    }
    if (draft.niches.length === 0) {
      errors.niches = 'Lai publicētu, izvēlies vismaz vienu jomu.'
    }
    if (draft.session_languages.length === 0) {
      errors.session_languages = 'Lai publicētu, izvēlies vismaz vienu valodu.'
    }
  }

  return errors
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
