/**
 * Pārbauda "next" parametru pirms novirzīšanas.
 *
 * Bez šī kāds varētu uztaisīt saiti /auth/login?next=//uzbrucejs.lv,
 * kas pēc pieteikšanās aizvestu lietotāju uz svešu domēnu ar mūsu
 * lapas uzticamību. Atļaujam tikai iekšējos ceļus.
 *
 * Dubultā slīpsvītra jāatsijā atsevišķi: "//evil.com" sākas ar "/",
 * bet pārlūkam tas ir protokola-relatīvs ārējs URL.
 */
export function safeNext(raw: string | null | undefined, fallback = '/'): string {
  if (typeof raw !== 'string') return fallback
  if (!raw.startsWith('/')) return fallback
  if (raw.startsWith('//')) return fallback
  return raw
}
