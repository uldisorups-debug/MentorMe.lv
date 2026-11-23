/**
 * Jautājumi un atbildes no raksta teksta — FAQPage strukturētajiem datiem.
 *
 * Rakstos sadaļa "Biežāk uzdotie jautājumi" ir rakstīta tā:
 *
 *   ## Biežāk uzdotie jautājumi
 *
 *   **Jautājums?**
 *   Atbilde vienā vai vairākās rindās.
 *
 * Google un AI rīki šādus pārus labprāt citē kā atbildi. Lai tos
 * nevajadzētu ievadīt divreiz, tos nolasām no paša teksta. Ja sadaļas
 * nav vai tā ir citā formā, atgriežam tukšu sarakstu, un shēmas nav.
 */

const HEADING = /^##\s+(biežāk uzdotie jautājumi|biežākie jautājumi|bieži uzdotie jautājumi|buj)\s*$/i

/** Noņem markdown saites un treknrakstu, atstājot tekstu. */
function plain(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractFaq(markdown: string): [string, string][] {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) => HEADING.test(line.trim()))
  if (start === -1) return []

  const pairs: [string, string][] = []
  let question: string | null = null
  let answer: string[] = []

  const flush = () => {
    if (question && answer.length > 0) {
      const text = plain(answer.join(' '))
      if (text) pairs.push([question, text])
    }
    question = null
    answer = []
  }

  for (const raw of lines.slice(start + 1)) {
    const line = raw.trim()
    if (/^#{1,2}\s/.test(line)) break
    const q = line.match(/^\*\*(.+\?)\*\*$/)
    if (q) {
      flush()
      question = plain(q[1])
    } else if (question && line) {
      answer.push(line)
    }
  }
  flush()

  return pairs.slice(0, 10)
}
