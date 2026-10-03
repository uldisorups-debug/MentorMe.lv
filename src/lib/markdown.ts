import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { contentLimitError } from './post-validation.ts'

/**
 * Markdown -> drošs HTML.
 *
 * Rakstus raksta lietotāji, tāpēc neapstrādāts HTML te būtu XSS caurums:
 * viens <script> raksta tekstā, un visu lasītāju sesijas ir svešās rokās.
 * Tāpēc katrs raksts iet caur sanitize-html, un atļauto tagu saraksts ir
 * baltais, nevis melnais — kas nav sarakstā, tas izkrīt.
 *
 * Kāpēc ne DOMPurify: serverī tam vajag jsdom, un jsdom ar require() ielādē
 * pakotnes, kas ir tikai ESM. Vercel funkcijās tas krita jau moduļa
 * ielādē, tāpēc /blog, raksti un sitemap.xml vairs nepārģenerējās — jauni
 * raksti parādījās tikai pēc pilna build. sanitize-html ir tīrs JS bez
 * DOM, tas strādā vienādi serverī un redaktora priekšskatījumā pārlūkā.
 * sanitize-html nedrīkst likt serverExternalPackages: tā atkarība
 * htmlparser2 arī ir tikai ESM un strādā tāpēc, ka Next to iepako kopā ar
 * pārējo kodu, nevis ielādē ar require().
 */

const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h2', 'h3', 'h4',
  'strong', 'em', 'del',
  'ul', 'ol', 'li',
  'blockquote',
  'a',
  'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const ALLOWED_ATTR = ['href', 'title', 'rel', 'target']

/*
 * Tagi, kurus izmetam kopā ar visu saturu. Pārējiem neatļautajiem tagiem
 * (<h1>, <div>, <span>, <article>...) pazūd tikai pats tags, teksts paliek —
 * no ielīmēta dokumenta jāiznāk lasāmam rakstam.
 *
 * Saraksts ir DOMPurify FORBID_CONTENTS, lai rakstu izskats nemainītos:
 * <title> un <style> no ielīmētas <head> nedrīkst nonākt tekstā, un
 * <script>, <svg>, <noscript> saturs nav lasāms teksts, bet koda gabali.
 * <head> un <colgroup> te apzināti nav: ja ielīmētam dokumentam trūkst
 * aizverošā taga, tie aprītu visu rakstu, lai gan pārlūks tos aizver pats.
 */
const DROP_WITH_CONTENT = [
  'script', 'style', 'title', 'template',
  'noscript', 'noembed', 'noframes', 'plaintext', 'xmp',
  'iframe', 'audio', 'video',
  'svg', 'math', 'desc', 'foreignobject', 'annotation-xml',
  'mi', 'mn', 'mo', 'ms', 'mtext',
  'selectedcontent',
]

/*
 * Domēni, uz kuriem saites rakstos paliek pilnvērtīgas (bez nofollow).
 * Tikai tā paša īpašnieka vietnes — nekad sveši domēni, citādi te
 * atgriežas spameru problēma, no kuras nofollow sargā.
 */
const TRUSTED_HOSTS = ['alenor.lv']

// Precīzi domēns vai tā apakšdomēns — "alenor.lv.kaut-kas.com" neder
function isDomainOrSubdomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`)
}

type LinkKind = 'same-origin' | 'own-site' | 'trusted' | 'external'

/*
 * Kurp saite ved, nosakām tāpat kā pārlūks: ar URL parsētāju attiecībā
 * pret pašas vietnes adresi, un salīdzinām domēnu, ne tekstu.
 *
 * Līdz šim saite skaitījās iekšēja, ja tā sākās ar "/" vai saturēja
 * "mentorme.lv". Bet "//evil.com" un "/\evil.com" pārlūks atver kā
 * evil.com, un "https://evil.com/?mentorme.lv" vai
 * "https://mentorme.lv.evil.com" arī ved prom. Šīs saites palika bez
 * nofollow un ar autora paša target="_blank" rel="opener", un atvērtā
 * lapa varēja pārdēvēt lasītāja cilni par viltus pieteikšanās lapu.
 * URL parsētājs tāpat izmet tabulācijas un jaunas rindas adresē un saprot
 * "lietotājs@domēns" — tieši kā pārlūks.
 */
function linkKind(href: string, siteHost: string): LinkKind {
  const siteOrigin = `https://${siteHost}`
  let url: URL
  try {
    url = new URL(href, `${siteOrigin}/`)
  } catch {
    return 'external'
  }
  if (url.origin === siteOrigin) return 'same-origin'
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'external'
  if (isDomainOrSubdomain(url.hostname, siteHost)) return 'own-site'
  if (TRUSTED_HOSTS.some((trusted) => isDomainOrSubdomain(url.hostname, trusted))) return 'trusted'
  return 'external'
}

// javascript: un data: saites neiziet cauri
const ALLOWED_URI = /^(?:https?:|mailto:|tel:|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
// Atstarpes un vadības rakstzīmes, ar kurām slēpj "javascript:" — pirms
// pārbaudes tās izmetam, tāpat kā DOMPurify
const URI_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g

/*
 * Atribūtu vērtības apgriežam un href pārbaudām tieši tāpat kā līdz šim
 * darīja DOMPurify.
 *
 * Apgriešana nav kosmētika: saitē jāpaliek tieši tai adresei, kuru
 * linkKind pārbaudīja. Turklāt nedalāmo atstarpi (U+00A0) pirms
 * "javascript:" URL parsētājs nenomet, bet trim() nomet, un tad shēmas
 * pārbaude to atpazīst.
 */
function normalizeAttribs(tagName: string, attribs: sanitizeHtml.Attributes) {
  const result: sanitizeHtml.Attributes = {}
  for (const [name, value] of Object.entries(attribs)) {
    const trimmed = value.trim()
    if (name === 'href' && trimmed && !ALLOWED_URI.test(trimmed.replace(URI_WHITESPACE, ''))) {
      continue
    }
    result[name] = trimmed
  }
  return { tagName, attribs: result }
}

/**
 * Ārējām saitēm pievienojam rel="ugc nofollow".
 *
 * Tas nav skopums pret autoriem — tā ir higiēna. Ja katrs, kas
 * reģistrējas, dabū dofollow saites, lapa kļūst par spameru mērķi, un
 * Google soda visu domēnu, arī godīgos autorus.
 *
 * Izņēmums — TRUSTED_HOSTS: paša īpašnieka vietnes.
 *
 * Autora rel un target paliek tikai saitēm uz to pašu izcelsmi (pašu
 * vietni pa https). Visur citur tos izmetam vienmēr: rel="opener" ļauj
 * atvērtajai lapai vadīt lasītāja cilni.
 *
 * Tas notiek sanitize-html iekšienē, nevis ar regulāru izteiksmi pār
 * gatavo HTML. Regulārā izteiksme href meklēja kā tekstu, un title, kas
 * beidzās ar "href=", saiti salauza.
 */
function hardenLink(
  tagName: string,
  attribs: sanitizeHtml.Attributes,
  siteHost: string
): sanitizeHtml.Tag {
  // sanitize-html pēc šī palaiž arī '*' pārveidotāju, bet atkārtota
  // apgriešana neko nemaina. Te tā vajadzīga, lai pārbaudām galīgo adresi.
  const tag = normalizeAttribs(tagName, attribs)
  const { href } = tag.attribs
  const kind = href === undefined ? null : linkKind(href, siteHost)
  if (kind === 'same-origin') return tag

  delete tag.attribs.rel
  delete tag.attribs.target
  // Bez href tā nav saite, bet uz savu vietni — parasta iekšēja saite
  if (kind === null || kind === 'own-site') return tag

  tag.attribs.rel = kind === 'trusted' ? 'noopener' : 'ugc nofollow noopener'
  tag.attribs.target = '_blank'
  return tag
}

// @types/sanitize-html vēl nepazīst allowedEmptyAttributes, pati bibliotēka to atbalsta
type SanitizeOptions = sanitizeHtml.IOptions & { allowedEmptyAttributes: string[] }

function sanitizeOptions(siteHost: string): SanitizeOptions {
  return {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { '*': ALLOWED_ATTR },
    disallowedTagsMode: 'discard',
    nonTextTags: DROP_WITH_CONTENT,
    transformTags: {
      a: (tagName, attribs) => hardenLink(tagName, attribs, siteHost),
      '*': normalizeAttribs,
    },
    // Otrā pārbaude pēc normalizeAttribs: sanitize-html pats atšifrē
    // shēmu un laiž cauri tikai šīs. Relatīvajām adresēm shēmas nav.
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: ['href'],
    // Tukšu href="" vai title="" atstājam, nevis izmetam: tā bija arī līdz šim
    nonBooleanAttributes: [],
    allowedEmptyAttributes: ALLOWED_ATTR,
  }
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/*
 * Rezerves variants, ja markdown apstrādāt nevar: tas pats teksts bez
 * formatējuma, bet ar rindkopām un rindu pārnesumiem, lai raksts paliek
 * lasāms. Viss tiek aizsargāts, tāpēc sanitizētājs te nav vajadzīgs.
 */
function plainTextHtml(source: string): string {
  return source
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const escaped = paragraph.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
      return `<p>${escaped.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')
}

export function renderMarkdown(source: string, siteHost = 'mentorme.lv'): string {
  /*
   * Tekstu, kas pārsniedz robežas, saglabāt vairs nevar, bet tas var būt
   * ierakstīts pirms robežām vai tieši datubāzē. marked tādu var
   * apstrādāt sekundēm ilgi vai nogāzt ar steka pārplūdi.
   */
  if (contentLimitError(source) !== null) return plainTextHtml(source)

  /*
   * Kas paliek, robežu iekšienē nekrīt, bet raksta lapa nedrīkst nokrist
   * nekādā gadījumā: /blog/[slug] ģenerē būvējot, un viens slikts raksts
   * apturētu visu `next build`. Arī redaktora priekšskatījums iet šeit.
   */
  try {
    const raw = marked.parse(source, { async: false, gfm: true, breaks: true })
    return sanitizeHtml(raw, sanitizeOptions(siteHost))
  } catch (error) {
    console.error('Raksta markdown neizdevās, rādām kā tekstu:', error)
    return plainTextHtml(source)
  }
}

/** Aptuvenais lasīšanas laiks minūtēs. */
export function readingMinutes(source: string): number {
  const words = source.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/**
 * Automātisks kopsavilkums no raksta sākuma, ja autors to nav uzrakstījis.
 * Meta description nedrīkst palikt tukšs — bez tā Google to izdomā pats.
 */
export function autoExcerpt(source: string, limit = 160): string {
  const plain = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= limit) return plain
  const cut = plain.slice(0, limit)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit)}…`
}
