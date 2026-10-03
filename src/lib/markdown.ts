import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

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

function isTrustedHost(href: string): boolean {
  try {
    const host = new URL(href).hostname.toLowerCase()
    // Precīzi domēns vai tā apakšdomēns — "alenor.lv.kaut-kas.com" neder
    return TRUSTED_HOSTS.some((trusted) => host === trusted || host.endsWith(`.${trusted}`))
  } catch {
    return false
  }
}

/*
 * Iekšēja ir tikai saite, kuras galamērķis tiešām ir šī vietne.
 *
 * Agrāk pietika ar "sākas ar /" vai "satur mentorme.lv". Tad //svesa.lv,
 * /\svesa.lv, https://svesa.lv/?mentorme.lv un https://mentorme.lv.svesa.lv
 * izlikās par iekšējām: palika bez nofollow un ar autora target/rel, un
 * target="_blank" rel="opener" ļauj svešai lapai pārvirzīt mūsu cilni uz
 * pikšķerēšanas lapu. Tāpēc adresi atrisinām tāpat kā pārlūks — ar URL
 * pret mūsu pašu adresi — un salīdzinām hostu.
 */
function isInternalLink(href: string, siteHost: string): boolean {
  if (href.startsWith('#')) return true
  try {
    const url = new URL(href, `https://${siteHost}/`)
    const host = url.hostname.toLowerCase()
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      (host === siteHost || host.endsWith(`.${siteHost}`))
    )
  } catch {
    return false
  }
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
 * Agrāk to darīja regulāra izteiksme pār jau gatavu HTML. Tā kļūdījās,
 * ja title vērtība beidzās ar "href=" — saite salūza. Tagad atribūtus
 * mainām sanitizētājā, pirms HTML vispār ir uzrakstīts.
 */
function linkAttribs(siteHost: string): sanitizeHtml.Transformer {
  return (tagName, attribs) => {
    const { attribs: normalized } = normalizeAttribs(tagName, attribs)
    const href = normalized.href
    if (href === undefined || isInternalLink(href, siteHost)) {
      return { tagName, attribs: normalized }
    }

    // Autora rel un target ārējai saitei neatstājam nekad
    const result: sanitizeHtml.Attributes = {}
    for (const [name, value] of Object.entries(normalized)) {
      if (name !== 'rel' && name !== 'target' && name !== 'href') result[name] = value
    }
    result.href = href
    result.rel = isTrustedHost(href) ? 'noopener' : 'ugc nofollow noopener'
    result.target = '_blank'
    return { tagName, attribs: result }
  }
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
 * Apgriešana nav kosmētika: href ar nedalāmo atstarpi (U+00A0) pirms
 * "javascript:" pārbaudi izietu tikai tāpēc, ka sākas ar atstarpi, un
 * jebkas, kas vēlāk atstarpes vienādo, to pārvērstu par saiti, kas
 * izpilda kodu. Turklāt " /profils" bez apgriešanas nebūtu iekšēja saite.
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

// @types/sanitize-html vēl nepazīst allowedEmptyAttributes, pati bibliotēka to atbalsta
const SANITIZE_OPTIONS: sanitizeHtml.IOptions & { allowedEmptyAttributes: string[] } = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: { '*': ALLOWED_ATTR },
  disallowedTagsMode: 'discard',
  nonTextTags: DROP_WITH_CONTENT,
  // transformTags liek renderMarkdown — saišu noteikumiem vajag siteHost
  // Otrā pārbaude pēc normalizeAttribs: sanitize-html pats atšifrē
  // shēmu un laiž cauri tikai šīs. Relatīvajām adresēm shēmas nav.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href'],
  // Tukšu href="" vai title="" atstājam, nevis izmetam: tā bija arī līdz šim
  nonBooleanAttributes: [],
  allowedEmptyAttributes: ALLOWED_ATTR,
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/*
 * Ja marked nespēj tekstu apstrādāt, rādām to kā vienkāršu tekstu.
 *
 * marked ir rekursīvs: pāris tūkstoši ligzdotu saraksta zīmju ("- - - ...")
 * izsit RangeError. Bez šī viens tāds raksts nogāztu savu lapu un, tā kā
 * raksti tiek ģenerēti būvējot, arī visa vietnes build. Labāk neformatēts
 * raksts nekā kritusi vietne.
 */
function plainTextHtml(source: string): string {
  return source
    .split(/\n[ \t]*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`)
    .join('\n')
}

export function renderMarkdown(source: string, siteHost = 'mentorme.lv'): string {
  let raw: string
  try {
    raw = marked.parse(source, { async: false, gfm: true, breaks: true })
  } catch (error) {
    console.error('Markdown neizdevās apstrādāt, rādām kā tekstu:', error)
    return plainTextHtml(source)
  }
  return sanitizeHtml(raw, {
    ...SANITIZE_OPTIONS,
    transformTags: { a: linkAttribs(siteHost), '*': normalizeAttribs },
  })
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
