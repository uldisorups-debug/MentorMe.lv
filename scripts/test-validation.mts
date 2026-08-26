// Validācijas testi. Palaišana: npm run test:validation
// Node 24 nolasa .ts tieši, tāpēc testu ietvars nav vajadzīgs.

import {
  validateFile,
  validateCount,
  buildStoragePath,
  pathFromPublicUrl,
  extensionFor,
} from '../src/lib/uploads.ts'
import {
  validateProfile,
  hasErrors,
  type ProfileDraft,
} from '../src/lib/profile-validation.ts'

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
check('galerija 3MB iet cauri', validateFile(jpg(3 * MB), 'gallery'), null)
check('galerija 6MB par liela', validateFile(jpg(6 * MB), 'gallery'), {
  code: 'too-large',
  limitMb: 5,
})
check(
  'PDF avatāram nedrīkst',
  validateFile({ name: 'a.pdf', size: 1000, type: 'application/pdf' }, 'avatar'),
  { code: 'wrong-type', allowed: 'jpeg, png, webp' }
)
check(
  'PDF sertifikātam drīkst',
  validateFile({ name: 'a.pdf', size: 1000, type: 'application/pdf' }, 'certificate'),
  null
)
check(
  'SVG nedrīkst nekur (XSS risks)',
  validateFile({ name: 'a.svg', size: 100, type: 'image/svg+xml' }, 'gallery'),
  { code: 'wrong-type', allowed: 'jpeg, png, webp' }
)
check(
  'exe ar viltus paplašinājumu',
  validateFile({ name: 'a.jpg', size: 100, type: 'application/x-msdownload' }, 'avatar'),
  { code: 'wrong-type', allowed: 'jpeg, png, webp' }
)

console.log('Galerijas skaits')
check('10 + 2 iet cauri', validateCount(10, 2, 'gallery'), null)
check('11 + 2 par daudz', validateCount(11, 2, 'gallery'), { code: 'too-many', max: 12 })
check('avatāram skaita nav', validateCount(99, 99, 'avatar'), null)

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
    'https://x.supabase.co/storage/v1/object/public/gallery/user-1/pic.jpg',
    'gallery'
  ),
  'user-1/pic.jpg'
)
check(
  'sveša bucket URL -> null',
  pathFromPublicUrl(
    'https://x.supabase.co/storage/v1/object/public/avatars/user-1/pic.jpg',
    'gallery'
  ),
  null
)

console.log('Profila pārbaudes')
const base: ProfileDraft = {
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
check(
  'publicēt bez valodas',
  validateProfile({ ...base, is_published: true, session_languages: [] })
    .session_languages,
  'Lai publicētu, izvēlies vismaz vienu valodu.'
)

console.log(`\n  ${passed} izturēja, ${failed} kritušas\n`)
process.exit(failed === 0 ? 0 : 1)
