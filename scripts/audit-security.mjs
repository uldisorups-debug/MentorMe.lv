// Drošības audits: mēģina salauzt RLS ar publisko atslēgu.
// Palaišana: npm run audit:security
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

let holes = 0
const ok = (m) => console.log('  DROŠI    ' + m)
const hole = (m) => { holes++; console.log('  CAURUMS  ' + m) }
const note = (m) => console.log('  PIEZĪME  ' + m)
const NIL = '00000000-0000-0000-0000-000000000000'

console.log('\n--- Ko anonīmais var NOLASĪT ---')
const contacts = await sb.from('coach_contacts').select('*')
;(contacts.data?.length ?? 0) ? hole(`coach_contacts: redz ${contacts.data.length} rindas`) : ok('coach_contacts: neredz neko')

const reports = await sb.from('review_reports').select('*')
;(reports.data?.length ?? 0) ? hole('review_reports: redz ziņojumus') : ok('review_reports: neredz neko')

const drafts = await sb.from('coach_profiles').select('slug').eq('is_published', false)
;(drafts.data?.length ?? 0) ? hole(`melnraksta profili: redz ${drafts.data.length}`) : ok('nepublicētie profili: neredz')

const draftPosts = await sb.from('posts').select('title').eq('status', 'draft')
;(draftPosts.data?.length ?? 0) ? hole('rakstu melnraksti: redz') : ok('rakstu melnraksti: neredz')

const certs = await sb.from('coach_profiles').select('cert_proof_url').not('cert_proof_url', 'is', null)
;(certs.data?.length ?? 0) ? note('cert_proof_url ceļš redzams publiski (fails privāts, bet ceļš atklāj user_id)') : ok('sertifikātu ceļu nav neviena')

console.log('\n--- Ko anonīmais var IERAKSTĪT ---')
/*
 * Postgres RLS uz aizliegtu UPDATE vai DELETE neizmet kļūdu — tas
 * vienkārši neatļauj nevienu rindu. Tāpēc pārbaudīt jāskatās, cik rindu
 * tiešām mainījās, nevis vai bija kļūda. Pretējā gadījumā tests kliedz
 * par caurumiem, kuru nav.
 */
const w = async (label, fn) => {
  const { data, error } = await fn()
  if (error) return ok(`${label} — bloķēts (${error.code})`)
  const rows = data?.length ?? 0
  rows === 0
    ? ok(`${label} — 0 rindas skartas`)
    : hole(`${label} — MAINĪJA ${rows} rindas`)
}
await w('izveidot kouča profilu', () => sb.from('coach_profiles').insert({ user_id: NIL, full_name: 'Uzbrucējs' }).select())
await w('mainīt svešu profilu', () => sb.from('coach_profiles').update({ full_name: 'Uzlauzts' }).neq('id', NIL).select())
await w('dzēst svešu profilu', () => sb.from('coach_profiles').delete().neq('id', NIL).select())
await w('uzlikt is_verified', () => sb.from('coach_profiles').update({ is_verified: true }).neq('id', NIL).select())
await w('rakstīt atsauksmi', () => sb.from('reviews').insert({ coach_id: NIL, client_id: NIL, rating: 5 }).select())
await w('publicēt rakstu', () => sb.from('posts').insert({ author_id: NIL, title: 'Spams raksts', content: 'x' }).select())
await w('mainīt kategorijas', () => sb.from('categories').update({ name_lv: 'Uzlauzts' }).eq('slug', 'bizness').select())
await w('mainīt sfēras', () => sb.from('spheres').update({ name_lv: 'Uzlauzts' }).eq('slug', 'muzika').select())
await w('mainīt reģionus', () => sb.from('regions').update({ name_lv: 'Uzlauzts' }).eq('slug', 'riga').select())
await w('pievienot kontaktus', () => sb.from('coach_contacts').insert({ coach_id: NIL, email: 'x@y.lv' }).select())
await w('dzēst kontu (RPC)', () => sb.rpc('delete_own_account'))

console.log('\n--- Storage ---')
const up = await sb.storage.from('avatars').upload('sveša-mape/uzbrukums.jpg', new Blob(['x']))
up.error ? ok('augšupielāde svešā mapē — bloķēta') : hole('augšupielāde svešā mapē — IZGĀJA CAURI')
const priv = await sb.storage.from('certificates').list('')
;(priv.data?.length ?? 0) === 0 ? ok('sertifikātu bucket — anonīmam tukšs') : hole('sertifikāti redzami')

console.log('\n--- Skatījumu skaitītājs ---')
const one = await sb.from('coach_profiles').select('slug, profile_views').limit(1).maybeSingle()
if (one.data) {
  const before = one.data.profile_views
  for (let i = 0; i < 5; i++) await sb.rpc('increment_profile_views', { coach_slug: one.data.slug })
  const after = (await sb.from('coach_profiles').select('profile_views').eq('slug', one.data.slug).single()).data.profile_views
  note(`5 izsaukumi: ${before} -> ${after}. RPC ir publiska ar nolūku, bet ierobežojuma nav — skaitli var uzpūst.`)
}

console.log(`\n  Rezultāts: ${holes} caurumi\n`)
process.exit(holes === 0 ? 0 : 1)
