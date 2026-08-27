// Markdown drošības testi. Palaišana: npm run test:markdown
import { renderMarkdown, readingMinutes, autoExcerpt } from '../src/lib/markdown.ts'
import { validatePost, hasPostErrors } from '../src/lib/post-validation.ts'
import { slugify } from '../src/lib/slugify.ts'

let passed = 0
let failed = 0

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) passed++
  else {
    failed++
    console.log(`  FAIL  ${name}\n        gaidīts: ${e}\n        sanāca:  ${a}`)
  }
}

function contains(name: string, html: string, needle: string) {
  if (html.includes(needle)) passed++
  else {
    failed++
    console.log(`  FAIL  ${name}\n        trūkst: ${needle}\n        HTML:   ${html.slice(0, 160)}`)
  }
}

function omits(name: string, html: string, needle: string) {
  if (!html.toLowerCase().includes(needle.toLowerCase())) passed++
  else {
    failed++
    console.log(`  FAIL  ${name}\n        NEDRĪKST saturēt: ${needle}\n        HTML: ${html.slice(0, 200)}`)
  }
}

console.log('\nDrošība — XSS')
omits('script tags', renderMarkdown('Teksts <script>alert(1)</script>'), '<script')
omits('onerror atribūts', renderMarkdown('<img src=x onerror="alert(1)">'), 'onerror')
omits('javascript: saite', renderMarkdown('[klikšķini](javascript:alert(1))'), 'javascript:')
omits('iframe', renderMarkdown('<iframe src="https://evil.com"></iframe>'), '<iframe')
omits('style tags', renderMarkdown('<style>body{display:none}</style>'), '<style')
omits('onclick', renderMarkdown('<a href="/x" onclick="steal()">saite</a>'), 'onclick')
omits('svg ar skriptu', renderMarkdown('<svg><script>alert(1)</script></svg>'), '<svg')
omits('form', renderMarkdown('<form action="https://evil.com"><input name="p"></form>'), '<form')

console.log('Parastais markdown strādā')
contains('rindkopa', renderMarkdown('Sveiks'), '<p>')
contains('treknraksts', renderMarkdown('**stiprs**'), '<strong>')
contains('virsraksts h2', renderMarkdown('## Virsraksts'), '<h2>')
contains('saraksts', renderMarkdown('- viens\n- divi'), '<li>')
contains('citāts', renderMarkdown('> citāts'), '<blockquote>')
contains('kods', renderMarkdown('`kods`'), '<code>')
contains('diakritika', renderMarkdown('Sklandrausis un ķimenes'), 'ķimenes')

console.log('Saites')
const ext = renderMarkdown('[mana lapa](https://manalapa.lv)')
contains('ārējā saite paliek', ext, 'href="https://manalapa.lv"')
contains('ārējai rel=ugc nofollow', ext, 'rel="ugc nofollow noopener"')
contains('ārējā atveras jaunā logā', ext, 'target="_blank"')

const int = renderMarkdown('[mans profils](/profils/uldis-orups)')
contains('iekšējā saite paliek', int, 'href="/profils/uldis-orups"')
omits('iekšējai nav nofollow', int, 'nofollow')

const own = renderMarkdown('[uz mentorme](https://mentorme.lv/blog)')
omits('savai lapai nav nofollow', own, 'nofollow')

console.log('Kopsavilkums un laiks')
check('īss teksts paliek vesels', autoExcerpt('Īss teksts.'), 'Īss teksts.')
check(
  'garš tiek nogriezts pie vārda',
  autoExcerpt('a'.repeat(10) + ' ' + 'b'.repeat(200), 20),
  'aaaaaaaaaa…'
)
check('markdown zīmes izmestas', autoExcerpt('## Virsraksts **stiprs**'), 'Virsraksts stiprs')
check('saite kļūst par tekstu', autoExcerpt('Skat [šeit](https://x.lv) vēl'), 'Skat šeit vēl')
check('tukšs teksts', autoExcerpt(''), '')
check('viena minūte minimums', readingMinutes('divi vārdi'), 1)
check('200 vārdi = 1 min', readingMinutes('vārds '.repeat(200)), 1)
check('600 vārdi = 3 min', readingMinutes('vārds '.repeat(600)), 3)

console.log('Raksta pārbaudes')
const okPost = {
  title: 'Kā kūpināt gaļu tā, kā to darīja vecmāmiņa',
  slug: 'ka-kupinat-galu',
  excerpt: 'Īss kopsavilkums.',
  content: 'Teksts.',
}
check('derīgs raksts', validatePost(okPost), {})
check('tukšs slug drīkst — aizpilda trigeris', validatePost({ ...okPost, slug: '' }).slug, undefined)
check(
  'virsraksts par īsu',
  validatePost({ ...okPost, title: 'Abc' }).title,
  'Virsrakstam jābūt no 5 līdz 140 rakstzīmēm.'
)
check('tukšs teksts', validatePost({ ...okPost, content: '   ' }).content, 'Teksts nedrīkst būt tukšs.')
check(
  'slug ar garumzīmi',
  validatePost({ ...okPost, slug: 'kā-kūpināt' }).slug,
  'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
)
check(
  'slug ar slīpsvītru',
  validatePost({ ...okPost, slug: '../admin' }).slug,
  'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
)
check(
  'par garš kopsavilkums',
  validatePost({ ...okPost, excerpt: 'a'.repeat(301) }).excerpt,
  'Kopsavilkums nedrīkst pārsniegt 300 rakstzīmes.'
)
check('hasPostErrors uz tukša', hasPostErrors({}), false)

console.log('Adreses no virsraksta')
check('latviešu diakritika', slugify('Ātrākais ceļš uz nākamo līmeni'), 'atrakais-cels-uz-nakamo-limeni')
check('domuzīme un atstarpes', slugify('Kā kūpināt gaļu — vecmāmiņas veidā'), 'ka-kupinat-galu-vecmaminas-veida')
check('atstarpes malās', slugify('   Atstarpes   malās   '), 'atstarpes-malas')
check('pieturzīmes izkrīt', slugify('Kas, kā un kāpēc?!'), 'kas-ka-un-kapec')
check('cipari paliek', slugify('9. klases eksāmens'), '9-klases-eksamens')
check('tikai simboli', slugify('!!!'), '')

console.log(`\n  ${passed} izturēja, ${failed} kritušas\n`)
process.exit(failed === 0 ? 0 : 1)
