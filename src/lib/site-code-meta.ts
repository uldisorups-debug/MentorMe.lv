/**
 * <meta> tagi no administratora ielīmētā <head> koda.
 *
 * Pārējo kodu (skriptus) ielādē pārlūks pēc piekrišanas, bet meta tagi
 * jāredz servera HTML: Google, Bing, Facebook domēna verifikācija lasa
 * tieši tos, un JavaScript tie neizpilda. Tāpēc tos izvelkam un ieliekam
 * lapā servera pusē.
 *
 * Tikai drošie atribūti: name, property, content, http-equiv. Pārējais
 * meta tagos verifikācijai nav vajadzīgs.
 */
export type MetaTag = {
  name?: string
  property?: string
  content?: string
  httpEquiv?: string
}

const META_RE = /<meta\b([^>]*)>/gi
const ATTR_RE = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g

export function extractMetaTags(html: string): MetaTag[] {
  const tags: MetaTag[] = []
  for (const match of html.matchAll(META_RE)) {
    const tag: MetaTag = {}
    for (const attr of match[1].matchAll(ATTR_RE)) {
      const key = attr[1].toLowerCase()
      const value = attr[2] ?? attr[3] ?? attr[4] ?? ''
      if (key === 'name') tag.name = value
      else if (key === 'property') tag.property = value
      else if (key === 'content') tag.content = value
      else if (key === 'http-equiv') tag.httpEquiv = value
    }
    if (tag.content !== undefined && (tag.name || tag.property || tag.httpEquiv)) {
      tags.push(tag)
    }
  }
  return tags
}

/** Kods bez meta tagiem — tie jau ir servera HTML, otrreiz nevajag. */
export function withoutMetaTags(html: string): string {
  return html.replace(META_RE, '').trim()
}
