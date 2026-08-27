// Vides mainīgo nolasīšana vienā vietā, ar skaidru kļūdu,
// ja .env.local nav aizpildīts — citādi Supabase met nesaprotamu
// "Invalid URL" kļūdu kaut kur dziļi izpildes laikā.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Trūkst vides mainīgā ${name}. Pārbaudi .env.local (paraugs: .env.example).`
    )
  }
  return value
}

export const SUPABASE_URL = required(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL
)

export const SUPABASE_PUBLISHABLE_KEY = required(
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

/**
 * Publiskais lapas URL — no tā veidojas sitemap, robots.txt un OG bildes.
 *
 * Ja NEXT_PUBLIC_SITE_URL nav uzstādīts, uz Vercel paņemam projekta
 * domēnu no tā paša dotajiem mainīgajiem. Bez šī produkcijā sitemap
 * norādītu uz localhost, un Google to vienkārši ignorētu.
 *
 * Šo lieto tikai servera pusē (layout, sitemap, robots), tāpēc VERCEL_*
 * mainīgie bez NEXT_PUBLIC_ prefiksa te ir pieejami.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL

  // Pastāvīgais produkcijas domēns, nevis konkrētā izvietojuma adrese
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return 'http://localhost:3000'
}

export const SITE_URL = resolveSiteUrl()
