/**
 * Virsrakstu izvēle — tīrā daļa, lai to var pārbaudīt testos.
 */

/**
 * Pirmais variants, kas ietilpst garumā.
 *
 * Profila virsrakstā agrāk, ja tagline bija par garu, nāca kvalifikācija
 * ("Liene Busele — Sertificēts"). Pēc "sertificēts" neviens nemeklē;
 * meklē "biznesa koučs Rīgā". Tāpēc pirms kvalifikācijas — tēma un
 * pilsēta.
 */
export function firstFitting(
  format: (part: string) => string,
  parts: (string | null | undefined)[],
  maxLength: number
): string {
  const options = parts.map((p) => p?.trim()).filter((p): p is string => !!p)
  for (const part of options) {
    const title = format(part)
    if (title.length <= maxLength) return title
  }
  return format(options[options.length - 1] ?? '')
}

/** Gariem virsrakstiem " — MentorMe.lv" vairs neliek — Google tik un tā nogriež. */
export const TITLE_SUFFIX = ' — MentorMe.lv'
export const TITLE_MAX = 60

export function titleWithBrand(title: string): string | { absolute: string } {
  return title.length + TITLE_SUFFIX.length > TITLE_MAX ? { absolute: title } : title
}

/** Open Graph grib valodu ar valsti ("lv_LV"), ne tikai "lv". */
export function ogLocale(locale: string): string {
  return { lv: 'lv_LV', en: 'en_US', ru: 'ru_RU' }[locale] ?? 'lv_LV'
}
