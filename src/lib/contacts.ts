/**
 * Kouča saziņas kanāli.
 *
 * Bez importiem, lai to varētu testēt atsevišķi. Šeit notiek gan
 * pārbaude, gan saišu veidošana — abas ir tīras funkcijas.
 */

export type ContactKind =
  | 'whatsapp'
  | 'email'
  | 'telegram'
  | 'messenger'
  | 'linkedin'
  | 'instagram'
  | 'other'

export type ContactValues = {
  email: string | null
  whatsapp: string | null
  telegram: string | null
  messenger_url: string | null
  linkedin_url: string | null
  instagram: string | null
  other_label: string | null
  other_value: string | null
}

export type ContactLink = {
  kind: ContactKind
  label: string
  href: string
  /** Vai saite atver ārēju lietotni (tad vajag target="_blank") */
  external: boolean
}

/** Telefonam atstājam tikai ciparus — wa.me plusu un atstarpes nepieņem. */
export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, '')
}

/**
 * Instagram lietotājvārds bez @ un bez saites priekšdaļas.
 *
 * Cilvēki to ieraksta trīs veidos — @vards, vards, vai visu saiti.
 * Visi trīs ir pareizi domāti, tāpēc pieņemam visus.
 */
export function normalizeInstagram(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
}

/** Telegram lietotājvārds bez @ un bez saites priekšdaļas. */
export function normalizeTelegram(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '')
    .replace(/^@/, '')
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TELEGRAM_PATTERN = /^[a-zA-Z0-9_]{5,32}$/
// Instagram atļauj arī punktu un ir īsāks par Telegram
const INSTAGRAM_PATTERN = /^[a-zA-Z0-9._]{1,30}$/

export type ContactError = string | null

export function validateContact(kind: ContactKind, raw: string): ContactError {
  const value = raw.trim()
  if (value === '') return null // Tukšs lauks ir atļauts

  switch (kind) {
    case 'email':
      return EMAIL_PATTERN.test(value) ? null : 'Nederīga e-pasta adrese.'

    case 'whatsapp': {
      const digits = normalizePhone(value)
      if (digits.length < 8 || digits.length > 15) {
        return 'Numuram jābūt starptautiskā formā, piem. +371 20 123 456.'
      }
      return null
    }

    case 'telegram':
      return TELEGRAM_PATTERN.test(normalizeTelegram(value))
        ? null
        : 'Lietotājvārds: 5–32 rakstzīmes, tikai burti, cipari un _.'

    case 'instagram':
      return INSTAGRAM_PATTERN.test(normalizeInstagram(value))
        ? null
        : 'Lietotājvārds: burti, cipari, punkts un _, līdz 30 rakstzīmēm.'

    case 'messenger':
    case 'linkedin': {
      let parsed: URL | null = null
      try {
        parsed = new URL(value)
      } catch {
        parsed = null
      }
      return parsed && parsed.protocol === 'https:'
        ? null
        : 'Jābūt pilnai https:// saitei.'
    }

    default:
      return null
  }
}

/**
 * Pārvērš saglabātās vērtības par gatavām saitēm.
 * Nederīgas vai tukšas vērtības vienkārši izkrīt.
 */
export function buildContactLinks(values: ContactValues): ContactLink[] {
  const links: ContactLink[] = []

  if (values.whatsapp && !validateContact('whatsapp', values.whatsapp)) {
    links.push({
      kind: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/${normalizePhone(values.whatsapp)}`,
      external: true,
    })
  }

  if (values.email && !validateContact('email', values.email)) {
    links.push({
      kind: 'email',
      label: values.email.trim(),
      href: `mailto:${values.email.trim()}`,
      external: false,
    })
  }

  if (values.telegram && !validateContact('telegram', values.telegram)) {
    links.push({
      kind: 'telegram',
      label: 'Telegram',
      href: `https://t.me/${normalizeTelegram(values.telegram)}`,
      external: true,
    })
  }

  if (values.messenger_url && !validateContact('messenger', values.messenger_url)) {
    links.push({
      kind: 'messenger',
      label: 'Messenger',
      href: values.messenger_url.trim(),
      external: true,
    })
  }

  if (values.instagram && !validateContact('instagram', values.instagram)) {
    links.push({
      kind: 'instagram',
      label: 'Instagram',
      href: `https://instagram.com/${normalizeInstagram(values.instagram)}`,
      external: true,
    })
  }

  if (values.linkedin_url && !validateContact('linkedin', values.linkedin_url)) {
    links.push({
      kind: 'linkedin',
      label: 'LinkedIn',
      href: values.linkedin_url.trim(),
      external: true,
    })
  }

  if (values.other_value?.trim()) {
    const raw = values.other_value.trim()
    const isUrl = /^https?:\/\//i.test(raw)
    links.push({
      kind: 'other',
      label: values.other_label?.trim() || raw,
      href: isUrl ? raw : `mailto:${raw}`,
      external: isUrl,
    })
  }

  return links
}

/** Vai koučam vispār ir kaut viens veids, kā viņu sasniegt. */
export function hasAnyContact(values: ContactValues): boolean {
  return buildContactLinks(values).length > 0
}
