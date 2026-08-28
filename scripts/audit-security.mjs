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
if (contacts.data?.length ?? 0) { hole(`coach_contacts: redz ${contacts.data.length} rindas`) } else { ok('coach_contacts: neredz neko') }

const reports = await sb.from('review_reports').select('*')
if (reports.data?.length ?? 0) { hole('review_reports: redz ziņojumus') } else { ok('review_reports: neredz neko') }

const drafts = await sb.from('coach_profiles').select('slug').eq('is_published', false)
if (drafts.data?.length ?? 0) { hole(`melnraksta profili: redz ${drafts.data.length}`) } else { ok('nepublicētie profili: neredz') }

const draftPosts = await sb.from('posts').select('title').eq('status', 'draft')
if (draftPosts.data?.length ?? 0) { hole('rakstu melnraksti: redz') } else { ok('rakstu melnraksti: neredz') }

// Audita labojums: is_admin atklāja, kuru kontu mērķēt
const admins = await sb.from('profiles').select('id, is_admin')
if (admins.data?.length ?? 0) { hole(`profiles: redz ${admins.data.length} rindas ar is_admin`) } else { ok('profiles: neredz svešus profilus') }

// Audita labojums: anonīmās atsauksmes autoru varēja izvilkt caur savienojumu
const unmask = await sb.from('reviews').select('id, client_id, profiles(display_name)')
if (unmask.error) { ok('reviews: pamattabula publiski nav lasāma') }
else if (unmask.data?.length ?? 0) { hole('reviews: var izvilkt client_id un autora vārdu') }
else { ok('reviews: pamattabula neatdod rindas') }

// Publiskajā skatā client_id nedrīkst būt vispār
const pub = await sb.from('reviews_public').select('*').limit(1)
if (pub.error) { note(`reviews_public nav pieejams: ${pub.error.message}`) }
else if (pub.data?.[0] && 'client_id' in pub.data[0]) { hole('reviews_public atdod client_id') }
else { ok('reviews_public: client_id nav') }

const certs = await sb.from('coach_profiles').select('cert_proof_url').not('cert_proof_url', 'is', null)
if (certs.data?.length ?? 0) { note('cert_proof_url ceļš redzams publiski (fails privāts, bet ceļš atklāj user_id)') } else { ok('sertifikātu ceļu nav neviena') }

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
  if (rows === 0) {
    ok(`${label} — 0 rindas skartas`)
  } else {
    hole(`${label} — MAINĪJA ${rows} rindas`)
  }
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

console.log('\n--- Administratora aizsargi ---')
const adminLog = await sb.from('admin_actions').select('*')
if (adminLog.data?.length ?? 0) { hole('admin_actions: anonīmais redz žurnālu') } else { ok('admin_actions: anonīmais neredz neko') }

await w('uzlikt sev is_admin', () => sb.from('profiles').update({ is_admin: true }).neq('id', NIL).select())
const del = await sb.rpc('admin_delete_user', { target_id: NIL })
if (del.error) { ok(`admin_delete_user — bloķēts (${del.error.code})`) } else { hole('admin_delete_user — IZGĀJA CAURI') }
const isAdm = await sb.rpc('is_admin')
if (isAdm.data === false || isAdm.error) { ok('is_admin() anonīmam atgriež false') } else { hole('is_admin() anonīmam atgriež true') }

note('Ielogota lietotāja pašpaaugstināšanu no šejienes pārbaudīt nevar — vajag sesiju')

console.log('\n--- Storage ---')
const up = await sb.storage.from('avatars').upload('sveša-mape/uzbrukums.jpg', new Blob(['x']))
if (up.error) { ok('augšupielāde svešā mapē — bloķēta') } else { hole('augšupielāde svešā mapē — IZGĀJA CAURI') }
const priv = await sb.storage.from('certificates').list('')
if ((priv.data?.length ?? 0) === 0) { ok('sertifikātu bucket — anonīmam tukšs') } else { hole('sertifikāti redzami') }

console.log('\n--- Skatījumu skaitītājs ---')
const one = await sb.from('coach_profiles').select('slug, profile_views').limit(1).maybeSingle()
if (one.data) {
  const before = one.data.profile_views
  for (let i = 0; i < 20; i++) {
    await sb.rpc('increment_profile_views', { coach_slug: one.data.slug })
  }
  const read = await sb.from('coach_profiles').select('profile_views').eq('slug', one.data.slug).single()
  const grew = (read.data?.profile_views ?? 0) - before

  // Viens apmeklētājs dienā drīkst pieskaitīt ne vairāk par vienu
  if (grew <= 1) {
    ok(`20 izsaukumi pieskaitīja ${grew} — uzpūst neizdodas`)
  } else {
    hole(`20 izsaukumi pieskaitīja ${grew} — skaitli var uzpūst`)
  }
}

const viewLog = await sb.from('profile_view_log').select('*')
if (viewLog.data?.length ?? 0) {
  hole('profile_view_log: anonīmais redz jaucējkodus')
} else {
  ok('profile_view_log: anonīmais neredz neko')
}

console.log(`\n  Rezultāts: ${holes} caurumi\n`)
process.exit(holes === 0 ? 0 : 1)
