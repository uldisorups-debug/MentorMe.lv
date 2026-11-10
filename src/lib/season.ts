/**
 * Valsts svētku noformējums — 1. līdz 24. novembrim pēc Latvijas laika.
 *
 * 25. novembrī tas pazūd pats, bez izvietošanas: pārbaude notiek
 * pārlūkā, tāpēc nav atkarīga no tā, kad lapa pēdējo reizi pārbūvēta.
 */
export function isNovemberSeason(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Riga',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)
  return month === 11 && day <= 24
}
