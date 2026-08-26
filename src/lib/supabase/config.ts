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

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
