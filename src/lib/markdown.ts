import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Markdown -> drošs HTML.
 *
 * Rakstus raksta lietotāji, tāpēc neapstrādāts HTML te būtu XSS caurums:
 * viens <script> raksta tekstā, un visu lasītāju sesijas ir svešās rokās.
 * Tāpēc katrs raksts iet caur DOMPurify, un atļauto tagu saraksts ir
 * baltais, nevis melnais — kas nav sarakstā, tas izkrīt.
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

/**
 * Ārējām saitēm pievienojam rel="ugc nofollow".
 *
 * Tas nav skopums pret autoriem — tā ir higiēna. Ja katrs, kas
 * reģistrējas, dabū dofollow saites, lapa kļūst par spameru mērķi, un
 * Google soda visu domēnu, arī godīgos autorus.
 */
function hardenLinks(html: string, siteHost: string): string {
  return html.replace(/<a\s+([^>]*?)href="([^"]*)"([^>]*)>/gi, (match, pre, href, post) => {
    const isInternal =
      href.startsWith('/') ||
      href.startsWith('#') ||
      href.includes(siteHost)

    if (isInternal) return match

    const cleaned = `${pre}${post}`
      .replace(/\brel="[^"]*"/gi, '')
      .replace(/\btarget="[^"]*"/gi, '')
      .trim()

    return `<a ${cleaned} href="${href}" rel="ugc nofollow noopener" target="_blank">`.replace(
      /\s+/g,
      ' '
    )
  })
}

export function renderMarkdown(source: string, siteHost = 'mentorme.lv'): string {
  const raw = marked.parse(source, { async: false, gfm: true, breaks: true })
  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // javascript: un data: saites neiziet cauri
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
  return hardenLinks(clean, siteHost)
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
