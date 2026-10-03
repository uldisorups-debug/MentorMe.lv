// Markdown drošības testi. Palaišana: npm run test:markdown
import { renderMarkdown, readingMinutes, autoExcerpt } from '../src/lib/markdown.ts'
import { validatePost, hasPostErrors } from '../src/lib/post-validation.ts'
import { slugify } from '../src/lib/slugify.ts'
import { jsonLdHtml } from '../src/lib/json-ld.ts'

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

/*
 * Vesels HTML dokuments raksta laukā.
 *
 * Artūrs Lasmanis 2026-09-18 ielīmēja rakstā visu lapu no <!DOCTYPE html>
 * līdz </html> — ar <head>, <meta> un <title>. Tas ir gaidāms: cilvēks
 * kopē no kaut kurienes, kur teksts jau bija noformēts.
 *
 * Svarīgi, ka no tā iznāk lasāms raksts, ne dokumenta gabali. Šie testi
 * to tur pie vārda.
 */
console.log('\nIelīmēts vesels HTML dokuments')
{
  const dokuments = [
    '<!DOCTYPE html>',
    '<html lang="lv">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <title>Virsraksts, kas nedrīkst nonākt tekstā</title>',
    '  <style>body { color: red }</style>',
    '</head>',
    '<body>',
    '<article>',
    '<h1>Dublēts virsraksts</h1>',
    '<h2>Sadaļa</h2>',
    '<p>Rindkopa ar <strong>treknu</strong> tekstu.</p>',
    '<ul><li>Pirmais</li><li>Otrais</li></ul>',
    '</article>',
    '</body>',
    '</html>',
  ].join('\n')

  const html = renderMarkdown(dokuments)

  omits('<head> saturs nenonāk lapā', html, 'Virsraksts, kas nedrīkst')
  omits('<style> izkrīt', html, '<style')
  omits('<meta> izkrīt', html, '<meta')
  omits('<html> izkrīt', html, '<html')
  omits('<body> izkrīt', html, '<body')
  contains('rindkopa paliek', html, 'Rindkopa ar')
  contains('treknais teksts paliek', html, '<strong>')
  contains('h2 paliek', html, '<h2>')
  contains('saraksts paliek', html, '<li>')
  // h1 nav atļauto tagu sarakstā: lapa virsrakstu rāda pati no title lauka
  omits('h1 tags neiziet cauri', html, '<h1')
  contains('h1 teksts tomēr nepazūd', html, 'Dublēts virsraksts')
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
const alenor = renderMarkdown('[ALENOR](https://www.alenor.lv/produkti)')
omits('alenor.lv bez nofollow', alenor, 'nofollow')
contains('alenor.lv atveras jaunā cilnē', alenor, 'target="_blank"')
const viltus = renderMarkdown('[x](https://alenor.lv.spams.com)')
contains('viltus alenor.lv domēns — nofollow', viltus, 'nofollow')


/*
 * Sanitizētāja maiņa: DOMPurify -> sanitize-html (2026-10-03).
 *
 * DOMPurify serverī vilka līdzi jsdom, kas Vercel funkcijās krita jau
 * ielādē, un /blog ar jauniem rakstiem vairs nepārģenerējās. Jaunais
 * sanitizētājs strādā citādi (parsē virkni, nevis būvē DOM), tāpēc šie
 * testi tur pie vārda, ka rakstu drošība un izskats palika tādi paši.
 */
console.log('Drošība — apslēptas javascript: un data: saites')
{
  const evil = [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    '&#106;avascript:alert(1)',
    '&#x6A;avascript:alert(1)',
    '&#0000106avascript:alert(1)',
    'javascript&colon;alert(1)',
    'javascript&#58;alert(1)',
    'jav&#x09;ascript:alert(1)',
    '&#14;javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'DATA:text/html,<b>x</b>',
    'vbscript:msgbox(1)',
  ]
  for (const url of evil) {
    omits(`<a href> ${url}`, renderMarkdown(`<a href="${url}">x</a>`), 'href')
    omits(`[x](${url})`, renderMarkdown(`[x](${url})`), 'href')
  }
  omits('jaunā rinda shēmā', renderMarkdown('<a href="java\nscript:alert(1)">x</a>'), 'href')

  /*
   * Unicode atstarpes pirms "javascript:". Pašas par sevi tās saiti padara
   * nekaitīgu, bet hardenLinks tās pārvērš par parastu atstarpi, ko pārlūks
   * adreses sākumā nomet. Tāpēc saitei jāpazūd jau sanitizētājā.
   */
  for (const code of [0x00a0, 0x1680, 0x2000, 0x2028, 0x202f, 0x205f, 0x3000, 0xfeff]) {
    const name = `U+${code.toString(16).toUpperCase().padStart(4, '0')} pirms javascript:`
    const ws = String.fromCharCode(code)
    omits(name, renderMarkdown(`<a href="${ws}javascript:alert(1)">x</a>`), 'javascript:')
    omits(`${name} (entītija)`, renderMarkdown(`<a href="&#${code};javascript:alert(1)">x</a>`), 'javascript:')
    omits(`${name} (markdown)`, renderMarkdown(`[x](${ws}javascript:alert(1))`), 'javascript:')
  }
}

console.log('Atļautās saites paliek')
contains('mailto', renderMarkdown('[raksti](mailto:info@piemers.lv)'), 'href="mailto:info@piemers.lv"')
contains('tel', renderMarkdown('[zvani](tel:+37120000000)'), 'href="tel:+37120000000"')
contains('enkurs', renderMarkdown('[uz sadaļu](#sadala)'), 'href="#sadala"')
contains(
  'relatīvā ar vaicājumu',
  renderMarkdown('[pieslēgties](/auth/login?next=%2Fdashboard%2Fprofile)'),
  'href="/auth/login?next=%2Fdashboard%2Fprofile"'
)
contains('& adresē', renderMarkdown('[x](https://x.lv/?a=1&b=2)'), 'href="https://x.lv/?a=1&amp;b=2"')
contains('saites title', renderMarkdown('[x](/a "Virsraksts")'), 'title="Virsraksts"')
{
  // Atstarpes ap adresi nogriežam — citādi iekšēja saite izskatās pēc ārējas
  const atstarpes = renderMarkdown('<a href=" /profils ">x</a>')
  contains('atstarpes ap iekšējo saiti nogrieztas', atstarpes, 'href="/profils"')
  omits('iekšējā saite ar atstarpēm bez nofollow', atstarpes, 'nofollow')
}
{
  const raw = renderMarkdown('<a href="https://manalapa.lv" rel="dofollow" target="_self">x</a>')
  contains('autora rel tiek aizstāts', raw, 'rel="ugc nofollow noopener"')
  omits('autora dofollow izkrīt', raw, 'dofollow')
  contains('autora target tiek aizstāts', raw, 'target="_blank"')
}

console.log('Ārējas saites, kas izliekas par iekšējām')
{
  /*
   * Agrāk iekšēja bija jebkura saite, kas sākas ar "/" vai satur
   * "mentorme.lv". Šīs visas ved uz svešu lapu, tāpēc tām jābūt ar
   * nofollow, un autora target/rel nedrīkst palikt.
   */
  for (const href of [
    '//svesa.lv/x',
    '/\\svesa.lv/x',
    'https://svesa.lv/?mentorme.lv',
    'https://mentorme.lv.svesa.lv/',
    'https://svesa.lv/mentorme.lv',
    'https://mentorme.lv@svesa.lv/',
  ]) {
    const html = renderMarkdown(`<a href="${href}" target="_blank" rel="opener">x</a>`)
    contains(`${href} — nofollow`, html, 'rel="ugc nofollow noopener"')
    omits(`${href} — autora rel="opener" izkrīt`, html, 'rel="opener"')
  }

  for (const href of ['https://www.mentorme.lv/blog', 'https://MENTORME.LV/x', 'http://mentorme.lv/x', 'profils', '?lapa=2']) {
    omits(`${href} — iekšēja, bez nofollow`, renderMarkdown(`[x](${href})`), 'nofollow')
  }

  // Regulārā izteiksme agrāk title="...href=" vērtību sajauca ar pašu href
  const title = renderMarkdown('<a title="xhref=" href="https://svesa.lv">x</a>')
  contains('title ar "href=" nesalauž saiti', title, 'href="https://svesa.lv"')
  contains('title ar "href=" paliek', title, 'title="xhref="')
  contains('title ar "href=" — nofollow', title, 'rel="ugc nofollow noopener"')

  const mailto = renderMarkdown('[raksti](mailto:info@piemers.lv)')
  contains('mailto paliek', mailto, 'href="mailto:info@piemers.lv"')
}

console.log('Pārāk dziļa ligzdošana nenogāž lapu')
{
  let html = ''
  let threw = false
  try {
    html = renderMarkdown('- '.repeat(3000) + '<script>alert(1)</script> x')
  } catch {
    threw = true
  }
  check('nemet kļūdu', threw, false)
  contains('teksts parādās', html, '<p>')
  omits('rezerves teksts ir aizsargāts', html, '<script')
}

console.log('Atribūti')
{
  const p = renderMarkdown(
    '<p class="x" style="color:red" id="z" onclick="f()" data-x="1" lang="lv" title="T">teksts</p>'
  )
  contains('title paliek', p, 'title="T"')
  for (const attr of ['class=', 'style=', 'id=', 'onclick', 'data-x', 'lang=']) {
    omits(`${attr} izkrīt`, p, attr)
  }
  const a = renderMarkdown('<a href="/x" class="btn" id="i" name="n" rel="me" target="_self">saite</a>')
  contains('iekšējai saitei rel paliek', a, 'rel="me"')
  contains('iekšējai saitei target paliek', a, 'target="_self"')
  omits('a class izkrīt', a, 'class=')
  omits('a name izkrīt', a, 'name=')
}

console.log('Entītijas un speciālās zīmes')
contains('& tekstā', renderMarkdown('AT&T un Tom & Jerry'), 'AT&amp;T un Tom &amp; Jerry')
contains('< un > tekstā', renderMarkdown('a < b > c'), 'a &lt; b &gt; c')
contains('pēdiņas paliek pēdiņas', renderMarkdown('"Kultūras kods" un \'citāts\''), '"Kultūras kods" un \'citāts\'')
contains('nosauktā entītija', renderMarkdown('&copy; 2026'), '© 2026')
contains(
  'HTML kodā paliek teksts',
  renderMarkdown('`<script>alert(1)</script>`'),
  '<code>&lt;script&gt;alert(1)&lt;/script&gt;</code>'
)
{
  const bloks = renderMarkdown('```html\n<b>x</b>\n```')
  contains('koda bloks', bloks, '<pre><code>&lt;b&gt;x&lt;/b&gt;')
  omits('koda valodas klase izkrīt', bloks, 'class=')
}

console.log('Tabulas un saraksti')
{
  const tabula = renderMarkdown(
    '| Rīks | Kad |\n|:--|--:|\n| Excel | **aprēķini** |\n| Lists | [kopīgi](/tema/m365) |'
  )
  contains('tabula', tabula, '<table>')
  contains('galvas šūna', tabula, '<thead>\n<tr>\n<th>Rīks</th>')
  contains('treknraksts šūnā', tabula, '<td><strong>aprēķini</strong></td>')
  contains('saite šūnā', tabula, '<td><a href="/tema/m365">kopīgi</a></td>')
  omits('align izkrīt', tabula, 'align=')

  const saraksts = renderMarkdown('- viens\n  - iekšā\n    - dziļāk\n- divi\n\n1. pirmais\n2. otrais\n   1. apakšpunkts')
  contains('ligzdots saraksts', saraksts, '<li>viens<ul>\n<li>iekšā<ul>\n<li>dziļāk</li>')
  contains('numurēts ligzdots', saraksts, '<li>otrais<ol>\n<li>apakšpunkts</li>')
  contains('jauna rinda kļūst par <br>', renderMarkdown('rinda\nnākamā'), 'rinda<br')
}

console.log('Ielīmēts HTML')
{
  // Nepabeigts dokuments: bez </head> un </body> raksts tomēr nedrīkst pazust
  const nepabeigts = renderMarkdown(
    '<html><head><title>Lapas nosaukums</title><meta charset="utf-8"><body><p>Teksts paliek</p>'
  )
  contains('teksts pēc neaizvērtas head', nepabeigts, '<p>Teksts paliek</p>')
  omits('title no neaizvērtas head', nepabeigts, 'Lapas nosaukums')

  const word = renderMarkdown(
    '<!--[if gte mso 9]><xml><o:OfficeDocumentSettings></o:OfficeDocumentSettings></xml><![endif]-->' +
      '<p class="MsoNormal"><span style="font-size:12pt">Word teksts</span><o:p></o:p></p>'
  )
  contains('Word teksts paliek', word, '<p>Word teksts</p>')
  omits('Word komentārs izkrīt', word, 'mso')

  const ietinums = renderMarkdown('<div><b>Trekns</b> <span>un</span> <h1>virsraksts</h1></div>')
  contains('neatļautu tagu teksts paliek', ietinums, 'Trekns un virsraksts')
  omits('div izkrīt', ietinums, '<div')

  const kods = renderMarkdown(
    '<noscript>ns</noscript><template>tmpl</template><svg><text>svgteksts</text></svg>' +
      '<iframe>ifr</iframe><math><mi>formula</mi></math>'
  )
  for (const t of ['ns', 'tmpl', 'svgteksts', 'ifr', 'formula']) {
    omits(`${t} saturs izkrīt`, kods, `>${t}<`)
  }
}

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
check('30 000 rakstzīmju drīkst', validatePost({ ...okPost, content: 'a'.repeat(30000) }).content, undefined)
check(
  'pāri 30 000 nedrīkst',
  validatePost({ ...okPost, content: 'a'.repeat(30001) }).content,
  'Teksts nedrīkst pārsniegt 30000 rakstzīmes. Sadali to vairākos rakstos.'
)
check('400 zīmes rindkopā drīkst', validatePost({ ...okPost, content: '_a '.repeat(400) }).content, undefined)
check(
  '401 zīme rindkopā nedrīkst',
  validatePost({ ...okPost, content: '_a '.repeat(401) }).content,
  'Vienā rindkopā ir vairāk nekā 400 zīmes *, _ vai ~. Sadali tekstu rindkopās ar tukšu rindu.'
)
check(
  'tukša rinda sadala rindkopas',
  validatePost({ ...okPost, content: '_a '.repeat(300) + '\n\n' + '*a '.repeat(300) }).content,
  undefined
)
check(
  'saraksta punkti neskaitās',
  validatePost({ ...okPost, content: Array.from({ length: 600 }, () => '* punkts').join('\n') }).content,
  undefined
)

console.log('Adreses no virsraksta')
check('latviešu diakritika', slugify('Ātrākais ceļš uz nākamo līmeni'), 'atrakais-cels-uz-nakamo-limeni')
check('domuzīme un atstarpes', slugify('Kā kūpināt gaļu — vecmāmiņas veidā'), 'ka-kupinat-galu-vecmaminas-veida')
check('atstarpes malās', slugify('   Atstarpes   malās   '), 'atstarpes-malas')
check('pieturzīmes izkrīt', slugify('Kas, kā un kāpēc?!'), 'kas-ka-un-kapec')
check('cipari paliek', slugify('9. klases eksāmens'), '9-klases-eksamens')
check('tikai simboli', slugify('!!!'), '')

console.log('Strukturētie dati (JSON-LD)')
{
  const title = '</script><script>alert(1)</script>'
  const html = jsonLdHtml({ headline: title })
  omits('virsraksts neaizver <script>', html, '</script')
  omits('nav neviena "<"', html, '<')
  check('JSON nozīme nemainās', JSON.parse(html), { headline: title })
}

console.log(`\n  ${passed} izturēja, ${failed} kritušas\n`)
process.exit(failed === 0 ? 0 : 1)
