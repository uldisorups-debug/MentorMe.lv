// Pārbauda, vai Supabase savienojums strādā un vai shēma ir uzlikta.
// Palaišana:  npm run check:supabase

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Vienkāršs .env.local nolasītājs — bez papildu atkarībām.
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => {
      const i = line.indexOf('=')
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

const checks = [
  ['categories', () => supabase.from('categories').select('slug, name_lv, icon').order('sort_order')],
  ['coach_profiles', () => supabase.from('coach_profiles').select('id').limit(1)],
  ['reviews', () => supabase.from('reviews').select('id').limit(1)],
  ['coach_ratings (view)', () => supabase.from('coach_ratings').select('coach_id').limit(1)],
]

let failed = 0

for (const [label, run] of checks) {
  const { data, error } = await run()
  if (error) {
    console.log(`  FAIL  ${label.padEnd(22)} ${error.message}`)
    failed++
  } else {
    console.log(`  OK    ${label.padEnd(22)} ${data.length} rindas nolasītas`)
  }
}

const { data: cats } = await supabase
  .from('categories')
  .select('icon, name_lv')
  .order('sort_order')

if (cats?.length) {
  console.log(`\n  Kategorijas (${cats.length}):`)
  console.log('  ' + cats.map((c) => `${c.icon} ${c.name_lv}`).join('\n  '))
}

if (failed > 0) {
  console.log(`\n  ${failed} pārbaude(s) neizdevās — shēma, visticamāk, vēl nav palaista.`)
  process.exit(1)
}

console.log('\n  Viss kārtībā. Shēma ir uzlikta un lasāma ar publisko atslēgu.')
