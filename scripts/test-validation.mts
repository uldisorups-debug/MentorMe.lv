// Validācijas testi. Palaišana: npm run test:validation
// Node 24 nolasa .ts tieši, tāpēc testu ietvars nav vajadzīgs.

import { fitWithin, renameFor } from '../src/lib/image-resize.ts'
import {
  validateFile,
  validateCount,
  buildStoragePath,
  pathFromPublicUrl,
  extensionFor,
} from '../src/lib/uploads.ts'
import {
  filterCoaches,
  sortCoaches,
  filtersOnNewSearch,
  EMPTY_FILTERS,
  type CoachCardData,
} from '../src/lib/coaches.ts'
import {
  validateContact,
  buildContactLinks,
  normalizePhone,
  normalizeTelegram,
  hasAnyContact,
  type ContactValues,
} from '../src/lib/contacts.ts'
import {
  validateProfile,
  hasErrors,
  type ProfileDraft,
} from '../src/lib/profile-validation.ts'
import { authErrorKey, passwordTooShort } from '../src/lib/auth-errors.ts'

let passed = 0
let failed = 0

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    passed++
  } else {
    failed++
    console.log(`  FAIL  ${name}\n        gaidīts: ${e}\n        sanāca:  ${a}`)
  }
}

const MB = 1024 * 1024
const jpg = (size: number) => ({ name: 'a.jpg', size, type: 'image/jpeg' })

console.log('\nFailu pārbaudes')
check('avatārs 1MB jpg iet cauri', validateFile(jpg(1 * MB), 'avatar'), null)
check('avatārs 3MB par lielu', validateFile(jpg(3 * MB), 'avatar'), {
  code: 'too-large',
  limitMb: 2,
})
check('avatārs 1MB iet cauri', validateFile(jpg(1 * MB), 'avatar'), null)
check(
  'PDF avatāram nedrīkst',
  validateFile({ name: 'a.pdf', size: 1000, type: 'application/pdf' }, 'avatar'),
  { code: 'wrong-type', allowed: 'jpeg, png, webp' }
)
check(
  'SVG nedrīkst nekur (XSS risks)',
  validateFile({ name: 'a.svg', size: 100, type: 'image/svg+xml' }, 'avatar'),
  { code: 'wrong-type', allowed: 'jpeg, png, webp' }
)
check(
  'exe ar viltus paplašinājumu',
  validateFile({ name: 'a.jpg', size: 100, type: 'application/x-msdownload' }, 'avatar'),
  { code: 'wrong-type', allowed: 'jpeg, png, webp' }
)

check('avatāram skaita ierobežojuma nav', validateCount(99, 99, 'avatar'), null)

console.log('Storage ceļi')
check(
  'ceļš sākas ar user_id (RLS prasība)',
  buildStoragePath('user-123', jpg(10), 'abc'),
  'user-123/abc.jpg'
)
check(
  'ļaunprātīgs nosaukums neietekmē ceļu',
  buildStoragePath('user-123', { name: '../../etc/passwd', size: 10, type: 'image/png' }, 'xyz'),
  'user-123/xyz.png'
)
check('nezināms tips -> bin', extensionFor('application/zip'), 'bin')
check(
  'ceļš no publiskā URL',
  pathFromPublicUrl(
    'https://x.supabase.co/storage/v1/object/public/avatars/user-1/pic.jpg',
    'avatars'
  ),
  'user-1/pic.jpg'
)
check(
  'sveša bucket URL -> null',
  pathFromPublicUrl(
    'https://x.supabase.co/storage/v1/object/public/gallery/user-1/pic.jpg',
    'avatars'
  ),
  null
)

console.log('Profila pārbaudes')
const base: ProfileDraft = {
  slug: 'ilze-berzina',
  full_name: 'Ilze Bērziņa',
  tagline: 'Vadītājiem',
  bio: '',
  years_experience: '14',
  price_from: '100',
  price_to: '150',
  calendly_url: 'https://calendly.com/x',
  niches: ['bizness'],
  session_languages: ['lv'],
  is_published: false,
  has_contact: true,
  contacts_filled: true,
  consent_given: true,
}
check('derīgs melnraksts', validateProfile(base), {})
check('derīgs publicēts', validateProfile({ ...base, is_published: true }), {})
check(
  'tukšs vārds',
  validateProfile({ ...base, full_name: ' ' }).full_name,
  'Vārds ir obligāts.'
)
check(
  'cena no > līdz',
  validateProfile({ ...base, price_from: '200', price_to: '100' }).price_to,
  'Augšējai cenai jābūt lielākai par apakšējo.'
)
check(
  'vienāda cena drīkst',
  validateProfile({ ...base, price_from: '100', price_to: '100' }).price_to,
  undefined
)
check(
  'negatīva cena',
  validateProfile({ ...base, price_from: '-5' }).price_from,
  'Cenai jābūt skaitlim, kas nav negatīvs.'
)
check(
  'tukšas cenas drīkst',
  hasErrors(validateProfile({ ...base, price_from: '', price_to: '' })),
  false
)
check(
  'http saite nederīga',
  validateProfile({ ...base, calendly_url: 'http://calendly.com/x' }).calendly_url,
  'Jābūt pilnai https:// saitei.'
)
check(
  'nepilna saite nederīga',
  validateProfile({ ...base, calendly_url: 'calendly.com/x' }).calendly_url,
  'Jābūt pilnai https:// saitei.'
)
check(
  'tukša saite drīkst',
  validateProfile({ ...base, calendly_url: '' }).calendly_url,
  undefined
)
check(
  'pieredze 81 gads',
  validateProfile({ ...base, years_experience: '81' }).years_experience,
  'Jābūt veselam skaitlim no 0 līdz 80.'
)
check(
  'pieredze ar komatu',
  validateProfile({ ...base, years_experience: '5.5' }).years_experience,
  'Jābūt veselam skaitlim no 0 līdz 80.'
)
check(
  'publicēt bez jomas',
  validateProfile({ ...base, is_published: true, niches: [] }).niches,
  'Lai publicētu, izvēlies vismaz vienu jomu.'
)
check(
  'melnraksts bez jomas drīkst',
  validateProfile({ ...base, niches: [] }).niches,
  undefined
)
check('derīgs slug', validateProfile(base).slug, undefined)
check(
  'slug ar garumzīmi',
  validateProfile({ ...base, slug: 'ilze-bērziņa' }).slug,
  'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
)
check(
  'slug ar lielajiem burtiem',
  validateProfile({ ...base, slug: 'Ilze-Berzina' }).slug,
  'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
)
check(
  'slug ar atstarpi',
  validateProfile({ ...base, slug: 'ilze berzina' }).slug,
  'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
)
check(
  'slug ar slīpsvītru (ceļa uzbrukums)',
  validateProfile({ ...base, slug: '../admin' }).slug,
  'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
)
check(
  'slug ar defisi galā',
  validateProfile({ ...base, slug: 'ilze-' }).slug,
  'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
)
check(
  'slug par īsu',
  validateProfile({ ...base, slug: 'ab' }).slug,
  'Adresei jābūt vismaz 3 rakstzīmes garai.'
)
check(
  'publicēt bez valodas',
  validateProfile({ ...base, is_published: true, session_languages: [] })
    .session_languages,
  'Lai publicētu, izvēlies vismaz vienu valodu.'
)

check(
  'publicēt bez neviena kontakta',
  validateProfile({ ...base, is_published: true, has_contact: false }).has_contact,
  'Lai publicētu profilu, pievieno vismaz vienu saziņas veidu vai kalendāra saiti — citādi tevi neviens nevarēs uzrunāt.'
)
check(
  'melnraksts bez kontakta drīkst',
  validateProfile({ ...base, has_contact: false }).has_contact,
  undefined
)
check(
  'kontakti bez piekrišanas',
  validateProfile({ ...base, contacts_filled: true, consent_given: false }).consent_given,
  'Lai kontakti būtu redzami, jāapstiprina piekrišana.'
)
check(
  'nav kontaktu, nav vajadzīga piekrišana',
  validateProfile({ ...base, contacts_filled: false, consent_given: false }).consent_given,
  undefined
)

console.log('Kontakti')
const noContacts: ContactValues = {
  email: null, whatsapp: null, telegram: null,
  messenger_url: null, linkedin_url: null,
  other_label: null, other_value: null,
}

check('tukšs lauks ir atļauts', validateContact('email', ''), null)
check('derīgs e-pasts', validateContact('email', 'uldis@forgecore.lv'), null)
check('e-pasts bez @', validateContact('email', 'uldis.lv'), 'Nederīga e-pasta adrese.')
check('derīgs numurs ar atstarpēm', validateContact('whatsapp', '+371 20 123 456'), null)
check(
  'numurs par īsu',
  validateContact('whatsapp', '2834'),
  'Numuram jābūt starptautiskā formā, piem. +371 20 123 456.'
)
check('telegram ar @', validateContact('telegram', '@uldisorups'), null)
check('telegram kā saite', validateContact('telegram', 'https://t.me/uldisorups'), null)
check(
  'telegram par īsu',
  validateContact('telegram', 'abc'),
  'Lietotājvārds: 5–32 rakstzīmes, tikai burti, cipari un _.'
)
check('http messenger nederīgs', validateContact('messenger', 'http://m.me/x'), 'Jābūt pilnai https:// saitei.')
check('https messenger derīgs', validateContact('messenger', 'https://m.me/x'), null)

check('numura tīrīšana', normalizePhone('+371 20 123 456'), '37120123456')
check('telegram tīrīšana no saites', normalizeTelegram('https://t.me/uldis'), 'uldis')
check('telegram tīrīšana no @', normalizeTelegram('@uldis'), 'uldis')

check('bez kontaktiem nav saišu', buildContactLinks(noContacts), [])
check('bez kontaktiem hasAnyContact', hasAnyContact(noContacts), false)

check(
  'WhatsApp saite',
  buildContactLinks({ ...noContacts, whatsapp: '+371 20 123 456' })[0].href,
  'https://wa.me/37120123456'
)
check(
  'e-pasta saite',
  buildContactLinks({ ...noContacts, email: 'uldis@forgecore.lv' })[0].href,
  'mailto:uldis@forgecore.lv'
)
check(
  'Telegram saite',
  buildContactLinks({ ...noContacts, telegram: '@uldis_o' })[0].href,
  'https://t.me/uldis_o'
)
check(
  'nederīgs numurs saitē neparādās',
  buildContactLinks({ ...noContacts, whatsapp: '123' }),
  []
)
check(
  'brīvais kanāls ar saiti',
  buildContactLinks({ ...noContacts, other_label: 'Signal', other_value: 'https://signal.me/x' })[0],
  { kind: 'other', label: 'Signal', href: 'https://signal.me/x', external: true }
)
check(
  'divi kanāli, WhatsApp pirmais',
  buildContactLinks({ ...noContacts, email: 'a@b.lv', whatsapp: '+37120123456' }).map((l) => l.kind),
  ['whatsapp', 'email']
)

console.log('Meklēšanas filtrs')

const coach = (over: Partial<CoachCardData>): CoachCardData => ({
  id: 'x', slug: 'x', full_name: 'Testa Cilvēks', tagline: null,
  avatar_url: null, certification: 'none', is_verified: false,
  years_experience: null, session_languages: ['lv'], price_tier: 'free',
  price_from: null, price_to: null, niches: [], teaching_format: 'remote',
  region_slug: null, city: null, for_tourists: false,
  profile_views: 0, created_at: '2026-01-01T00:00:00Z',
  avg_rating: null, review_count: 0, ...over,
})

const sphereMap = {
  kokle: 'muzika', bungas: 'muzika',
  matematika: 'skola', 'kouc-dzive': 'koucings',
}

const koklePasniedzejs = coach({
  full_name: 'Zaiga', niches: ['kokle'],
  teaching_format: 'in_person', region_slug: 'kurzeme', for_tourists: true,
})
const matZoom = coach({
  full_name: 'Andris', niches: ['matematika'],
  teaching_format: 'remote', region_slug: 'riga',
})
const bungas = coach({
  full_name: 'Mareks', niches: ['bungas'],
  teaching_format: 'hybrid', region_slug: 'riga',
})
const visi = [koklePasniedzejs, matZoom, bungas]
const nicheNames = { kokle: 'Kokle', bungas: 'Bungas', matematika: 'Matemātika' }
const names = (f: typeof EMPTY_FILTERS) =>
  filterCoaches(visi, f, sphereMap, nicheNames).map((c) => c.full_name)

check('bez filtriem visi', names(EMPTY_FILTERS), ['Zaiga', 'Andris', 'Mareks'])
check('sfēra mūzika', names({ ...EMPTY_FILTERS, sphere: 'muzika' }), ['Zaiga', 'Mareks'])
check('meklē pēc prasmes nosaukuma', names({ ...EMPTY_FILTERS, query: 'kokle' }), ['Zaiga'])
check('meklē pēc pilsētas', names({ ...EMPTY_FILTERS, query: 'kurzeme' }), ['Zaiga'])
check('divi vārdi — abiem jāsakrīt', names({ ...EMPTY_FILTERS, query: 'kokle rīga' }), [])
check('formāts klātienē', names({ ...EMPTY_FILTERS, format: 'in_person' }), ['Zaiga'])
check(
  'reģions Kurzeme — attālinātais Andris arī der',
  names({ ...EMPTY_FILTERS, region: 'kurzeme' }),
  ['Zaiga', 'Andris']
)
check(
  'Kurzeme + klātienē — Andris izkrīt',
  names({ ...EMPTY_FILTERS, region: 'kurzeme', format: 'in_person' }),
  ['Zaiga']
)
check(
  'Rīga — Zaiga izkrīt, viņa māca tikai Kurzemē klātienē',
  names({ ...EMPTY_FILTERS, region: 'riga' }),
  ['Andris', 'Mareks']
)
/* Visa Latvija — kurš brauc uz visurieni, der katram novadam */
const visurEsosais = coach({
  full_name: 'Ilze', niches: ['kokle'],
  teaching_format: 'in_person', region_slug: 'visa-latvija',
})
const perNovadu = (r: string, saraksts = [koklePasniedzejs, visurEsosais]) =>
  filterCoaches(saraksts, { ...EMPTY_FILTERS, region: r }, sphereMap, nicheNames)
    .map((c) => c.full_name)

check('Kurzeme: "Visa Latvija" arī der', perNovadu('kurzeme'), ['Zaiga', 'Ilze'])
check('Latgale: paliek tikai "Visa Latvija"', perNovadu('latgale'), ['Ilze'])
check('meklējot "Visa Latvija", novadnieks nerādās', perNovadu('visa-latvija'), ['Ilze'])
check(
  'meklējot "Visa Latvija", attālinātais der',
  perNovadu('visa-latvija', [matZoom, visurEsosais]),
  ['Andris', 'Ilze']
)

check('meistarklases', names({ ...EMPTY_FILTERS, masterclass: true }), ['Zaiga'])

check('budžets: bezmaksas', names({ ...EMPTY_FILTERS, budget: 'free' }), ['Zaiga', 'Andris', 'Mareks'])
check(
  'sfēra + reģions kopā',
  names({ ...EMPTY_FILTERS, sphere: 'muzika', region: 'riga' }),
  ['Mareks']
)
check('meklēšana pēc vārda', names({ ...EMPTY_FILTERS, query: 'zaig' }), ['Zaiga'])

console.log('Budžets')

const dargs  = coach({ full_name: 'Dārgs',  price_tier: 'premium', price_from: 100, price_to: 150 })
const lets   = coach({ full_name: 'Lēts',   price_tier: 'affordable', price_from: 20, price_to: 30 })
const bezmaksas = coach({ full_name: 'Bezmaksas', price_tier: 'free' })
const nezinams  = coach({ full_name: 'Nezināms', price_tier: 'mid', price_from: null, price_to: null })
const cenas = [dargs, lets, bezmaksas, nezinams]
const perCenu = (f: Partial<typeof EMPTY_FILTERS>) =>
  filterCoaches(cenas, { ...EMPTY_FILTERS, ...f }, {}, {}).map((c) => c.full_name)

check('tikai bezmaksas', perCenu({ budget: 'free' }), ['Bezmaksas'])
check('tikai par maksu', perCenu({ budget: 'paid' }), ['Dārgs', 'Lēts', 'Nezināms'])
check(
  'budžets līdz 50 — dārgais izkrīt',
  perCenu({ budgetTo: '50' }),
  ['Lēts', 'Bezmaksas', 'Nezināms']
)
check(
  'budžets no 80 — lētais izkrīt',
  perCenu({ budgetFrom: '80' }),
  ['Dārgs', 'Bezmaksas', 'Nezināms']
)
check(
  'diapazons 25-40 ķer to, kas pārklājas',
  perCenu({ budgetFrom: '25', budgetTo: '40' }),
  ['Lēts', 'Bezmaksas', 'Nezināms']
)
check(
  'bez budžeta visi paliek',
  perCenu({}),
  ['Dārgs', 'Lēts', 'Bezmaksas', 'Nezināms']
)

console.log('Meklēšana notīra filtrus')
check(
  'filtri notīrīti, meklējamais paliek',
  filtersOnNewSearch('kokle'),
  { ...EMPTY_FILTERS, query: 'kokle' }
)

console.log('Kārtošana')

const NOW = new Date('2026-08-27T12:00:00Z').getTime()
const days = (n: number) => new Date(NOW - n * 86400000).toISOString()

const vecsPopulars = coach({ full_name: 'Vecs populārs', profile_views: 500, created_at: days(200), avg_rating: 4.2, review_count: 30 })
const vecsKluss    = coach({ full_name: 'Vecs kluss',    profile_views: 10,  created_at: days(200), avg_rating: 5, review_count: 2 })
const jauns        = coach({ full_name: 'Jauns',         profile_views: 0,   created_at: days(3) })
const bezAtsauksmem= coach({ full_name: 'Bez atsauksmēm',profile_views: 300, created_at: days(100), avg_rating: null, review_count: 0 })
const visiK = [vecsKluss, vecsPopulars, jauns, bezAtsauksmem]
const kartots = (k: 'popular' | 'rated' | 'newest') =>
  sortCoaches(visiK, k, NOW).map((c) => c.full_name)

check(
  'populārākie: jaunais paceļas augšā, tad pēc skatījumiem',
  kartots('popular'),
  ['Jauns', 'Vecs populārs', 'Bez atsauksmēm', 'Vecs kluss']
)
check(
  'labāk novērtētie: bez atsauksmēm iet uz beigām',
  kartots('rated'),
  ['Vecs kluss', 'Vecs populārs', 'Jauns', 'Bez atsauksmēm']
)
check(
  'jaunākie: tikai pēc datuma',
  kartots('newest'),
  ['Jauns', 'Bez atsauksmēm', 'Vecs kluss', 'Vecs populārs']
)
check(
  'kārtošana neizmaina sākotnējo masīvu',
  (() => { sortCoaches(visiK, 'newest', NOW); return visiK[0].full_name })(),
  'Vecs kluss'
)
check(
  'divi jauni savā starpā pēc skatījumiem',
  sortCoaches(
    [coach({ full_name: 'A', profile_views: 1, created_at: days(2) }),
     coach({ full_name: 'B', profile_views: 9, created_at: days(1) })],
    'popular', NOW
  ).map((c) => c.full_name),
  ['B', 'A']
)

/* Neitrālā kārtība — cilvēks kārtošanu nav izvēlējies */
const neitrali = [
  coach({ id: 'a', full_name: 'A' }),
  coach({ id: 'b', full_name: 'B' }),
  coach({ id: 'c', full_name: 'C' }),
  coach({ id: 'd', full_name: 'D' }),
]
const D0 = Date.UTC(2026, 0, 1)
const DIENA = 86_400_000
const kartiba = (n: number) => sortCoaches(neitrali, 'none', n).map((c) => c.full_name)

check('pēc noklusējuma kārtošana nav izvēlēta', EMPTY_FILTERS.sort, 'none')
check('bez kārtošanas neviens nepazūd', [...kartiba(D0)].sort(), ['A', 'B', 'C', 'D'])
check('bez kārtošanas dienas laikā secība nemainās', kartiba(D0 + 3 * 3_600_000), kartiba(D0))
check(
  'bez kārtošanas nākamajās dienās secība mainās',
  [1, 2, 3, 4, 5].some(
    (d) => JSON.stringify(kartiba(D0 + d * DIENA)) !== JSON.stringify(kartiba(D0))
  ),
  true
)
check(
  'neitrālā kārtošana neizmaina sākotnējo masīvu',
  (() => { sortCoaches(neitrali, 'none', D0); return neitrali[0].full_name })(),
  'A'
)

console.log('Bilžu samazināšana')
check('4000x3000 -> 640 pa garāko malu', fitWithin(4000, 3000), { width: 640, height: 480 })
check('vertikāla bilde griežas pareizi', fitWithin(1080, 1920), { width: 360, height: 640 })
check('kvadrāts paliek kvadrāts', fitWithin(2000, 2000), { width: 640, height: 640 })
check('mazu bildi nepalielinām', fitWithin(320, 200), { width: 320, height: 200 })
check('tieši uz robežas nemainās', fitWithin(640, 400), { width: 640, height: 400 })
check('ļoti šaura josla nesarūk līdz nullei', fitWithin(5000, 3), { width: 640, height: 1 })

check('nosaukums maina paplašinājumu', renameFor('IMG_1234.HEIC', 'image/webp'), 'IMG_1234.webp')
check('jpeg atkāpšanās variants', renameFor('bilde.png', 'image/jpeg'), 'bilde.jpg')
check('nosaukums bez punkta', renameFor('bilde', 'image/webp'), 'bilde.webp')

console.log('Pieteikšanās kļūdas')
check(
  'nepareiza parole',
  authErrorKey('Invalid login credentials'),
  'errInvalidCredentials'
)
check(
  'adrese jau reģistrēta',
  authErrorKey('User already registered'),
  'errAlreadyRegistered'
)
check(
  'adrese nav apstiprināta',
  authErrorKey('Email not confirmed'),
  'errNotConfirmed'
)
check(
  'Supabase bremzē — arī "For security purposes"',
  authErrorKey('For security purposes, you can only request this after 27 seconds.'),
  'errRateLimited'
)
check('vāja parole', authErrorKey('Password should be at least 6 characters'), 'errWeakPassword')
check('nepazīstamu kļūdu rādām, kāda tā ir', authErrorKey('Something odd'), null)
check('lielie burti netraucē', authErrorKey('INVALID LOGIN CREDENTIALS'), 'errInvalidCredentials')

check('septiņas zīmes par īsu', passwordTooShort('1234567'), true)
check('astoņas zīmes der', passwordTooShort('12345678'), false)
check('tukša parole par īsu', passwordTooShort(''), true)

console.log(`\n  ${passed} izturēja, ${failed} kritušas\n`)
process.exit(failed === 0 ? 0 : 1)
