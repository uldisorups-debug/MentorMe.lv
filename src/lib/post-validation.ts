/**
 * Raksta pārbaudes. Bez importiem, lai testējams atsevišķi.
 * Datubāzē ir savi ierobežojumi, bet tie atgriež Postgres kļūdu kodus.
 */

export type PostDraft = {
  title: string
  slug: string
  excerpt: string
  content: string
}

export type PostErrors = Partial<Record<keyof PostDraft, string>>

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/*
 * Teksta robežas.
 *
 * Tās nav par to, cik garš drīkst būt raksts, bet par marked (markdown
 * parsētāju). Dziļi ligzdotus citātus un sarakstus tas apstrādā
 * rekursīvi, un ap 2000 ">" pēc kārtas jau pārplūdina steku — raksta
 * lapa krīt ar RangeError, un, tā kā /blog/[slug] tiek ģenerēts būvējot,
 * var krist arī viss `next build`. Formatēšanas zīmes bez pāra ("_a _a
 * _a ...") tas meklē līdz rindkopas beigām katrai no jauna, tāpēc
 * 24 000 rakstzīmes šādas rindkopas apstrādā 7 sekundes.
 *
 * Tās pašas robežas pārbauda datubāze (migrācija 20261003000029) un
 * renderMarkdown pirms marked izsaukšanas. Skaitļiem visur jāsakrīt.
 */

/** Tāds pats kā datubāzes post_content_len — rakstzīmes, ne UTF-16 vienības. */
export const MAX_CONTENT_LENGTH = 40000

/*
 * Rindas sākumā katra atstarpe, ">" un saraksta zīme ("- ", "1. ") ir
 * viena vienība. Katrs ligzdojuma līmenis prasa vismaz vienu vienību
 * tajā pašā rindā (citāts jāatkārto, saraksta saturs jāatkāpj), tabulācija
 * — ne vairāk kā divus līmeņus. Tātad 100 vienības ir ne vairāk kā 200
 * līmeņi; marked krīt ap 1900. Godīgā rakstā tik dziļa atkāpe nerodas pat
 * kodā.
 */
export const MAX_LINE_INDENT = 100

/*
 * Formatēšanas zīmes (* _ ~ [) bez pāra marked meklē līdz rindkopas
 * beigām katru no jauna, tāpēc laiks aug kā zīmju skaits × rindkopas
 * garums. Šo reizinājumu, saskaitītu pa visām rindkopām, ierobežojam.
 * Godīgs raksts ar tukšām rindām starp rindkopām paliek simtiem reižu
 * zem robežas; pat 40 000 rakstzīmju bez nevienas tukšas rindas drīkst
 * saturēt 200 zīmes. Sliktākais teksts robežas iekšienē tiek apstrādāts
 * ~0,3 sekundēs.
 */
export const MAX_MARKUP_COST = 8_000_000

/*
 * Ilgu atstarpju virkni starp vārdiem marked pārbauda kvadrātiskā laikā
 * (40 000 atstarpes — 1,1 sekunde). 200 ir datubāzes regulārajai
 * izteiksmei pieļaujamās robežas (255) iekšienē.
 */
export const MAX_SPACE_RUN = 200

// marked jaunu rindu uzskata gan \r\n, gan vientuļu \r
const NEWLINES = /\r\n?/g

const TOO_DEEP = new RegExp(
  `(?:^|\\n)(?:[ \\t>]|[*+-][ \\t]|[0-9]{1,9}[.)][ \\t]){${MAX_LINE_INDENT + 1}}`
)

const TOO_MANY_SPACES = new RegExp(`[ \\t]{${MAX_SPACE_RUN + 1}}`)

/*
 * Kur marked noteikti sāk jaunu bloku: tukša rinda (arī tikai ar
 * atstarpēm) un saraksta punkts. Šeit drīkst dalīt tikai tur, kur dala
 * arī marked — ja sadalītu biežāk, rindkopas izskatītos īsākas, nekā tās
 * ir, un robeža vairs nesargātu. Citāta rindas ("> - ...") un numurētus
 * punktus pēc pirmā ("2. ") apzināti nedalām: tur marked dažreiz turpina
 * to pašu rindkopu.
 */
const PARAGRAPH_BREAK = /\n[ \t]*\n|\n(?= {0,3}[*+-] +[^ \t\n])/

const MARKUP_CHAR = /[*_~[]/g

// Postgres char_length skaita rakstzīmes; .length emocijzīmi skaitītu divreiz
function codePoints(text: string): number {
  return [...text].length
}

function markupCost(content: string): number {
  let cost = 0
  for (const paragraph of content.split(PARAGRAPH_BREAK)) {
    const marks = paragraph.match(MARKUP_CHAR)?.length ?? 0
    if (marks > 0) cost += marks * codePoints(paragraph)
  }
  return cost
}

/**
 * Vai marked šo tekstu apstrādās droši un ātri. Atgriež kļūdas tekstu
 * vai null.
 */
export function contentLimitError(content: string): string | null {
  if (codePoints(content) > MAX_CONTENT_LENGTH) {
    return 'Teksts nedrīkst pārsniegt 40 000 rakstzīmes.'
  }

  const text = content.replace(NEWLINES, '\n')

  if (TOO_DEEP.test(text)) {
    return `Pārāk dziļa atkāpe: rindas sākumā atstarpes, citātu zīmes (>) un saraksta zīmes kopā drīkst būt ne vairāk kā ${MAX_LINE_INDENT}.`
  }
  if (TOO_MANY_SPACES.test(text)) {
    return `Tekstā ir vairāk nekā ${MAX_SPACE_RUN} atstarpes pēc kārtas.`
  }
  if (markupCost(text) > MAX_MARKUP_COST) {
    return 'Garās rindkopās ir pārāk daudz formatēšanas zīmju (* _ ~ [). Sadali tekstu īsākās rindkopās ar tukšu rindu starp tām.'
  }
  return null
}

export function validatePost(draft: PostDraft): PostErrors {
  const errors: PostErrors = {}

  const title = draft.title.trim()
  if (title.length < 5 || title.length > 140) {
    errors.title = 'Virsrakstam jābūt no 5 līdz 140 rakstzīmēm.'
  }

  if (draft.content.trim() === '') {
    errors.content = 'Teksts nedrīkst būt tukšs.'
  } else {
    const limit = contentLimitError(draft.content)
    if (limit) errors.content = limit
  }

  const slug = draft.slug.trim()
  // Tukšu slug aizpilda datubāzes trigeris
  if (slug !== '' && !SLUG_PATTERN.test(slug)) {
    errors.slug = 'Atļauti tikai mazie burti bez garumzīmēm, cipari un defises.'
  }

  if (draft.excerpt.length > 300) {
    errors.excerpt = 'Kopsavilkums nedrīkst pārsniegt 300 rakstzīmes.'
  }

  return errors
}

export function hasPostErrors(errors: PostErrors): boolean {
  return Object.keys(errors).length > 0
}
