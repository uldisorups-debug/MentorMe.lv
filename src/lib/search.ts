/**
 * Meklēšana, kas saprot, ko cilvēks domāja, ne tikai ko viņš uzrakstīja.
 *
 * Agrāk katram ierakstītajam vārdam bija jāsakrīt burtiski. "kokles"
 * neatrada "kokle", "gramatvediba" bez garumzīmēm neatrada
 * "grāmatvedība", un "kokles stundas Rīgā" neatrada neko, jo vārda
 * "stundas" nevienā profilā nav. Cilvēks redzēja "neviens neatbilst"
 * un aizgāja.
 *
 * Tagad:
 *  - garumzīmes un mīkstinājuma zīmes neskaitās (ā = a, č = c);
 *  - locījumi neskaitās: vārdam nogriež galotni ("kokles" -> "kokl");
 *  - viena vai divas pārrakstīšanās neskaitās ("matemātka");
 *  - vārdi, kas neko nesašaurina ("un", "stundas", "skolotājs"), tiek izlaisti;
 *  - daži sinonīmi un citas valodas ("coach", "english", "репетитор").
 *
 * Bez importiem, lai testējams atsevišķi (scripts/test-validation.mts).
 */

/** Mazie burti bez garumzīmēm, tikai burti un cipari, atdalīti ar atstarpi. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // ā -> a, č -> c, ņ -> n
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

/*
 * Galotnes, ko nogriezt. Garākās pirmās, lai "ajiem" nogrieztu pirms "em".
 * Latviešu un krievu vienā sarakstā — alfabēti nepārklājas, tāpēc tās
 * viena otrai netraucē.
 */
const ENDINGS = [
  // latviešu
  'ajiem', 'ajam', 'ajai', 'ajos', 'iem', 'ies', 'ais', 'ajs',
  'am', 'ai', 'as', 'es', 'is', 'us', 'ei', 'im', 'em', 'os', 'ij',
  'a', 'e', 'i', 'u', 's', 'o',
  // krievu
  'ами', 'ями', 'ого', 'его', 'ому', 'ему', 'ах', 'ях', 'ам', 'ям',
  'ом', 'ем', 'ой', 'ей', 'ов', 'ев', 'ую', 'ая', 'ые', 'ий', 'ый',
  'а', 'я', 'ы', 'и', 'у', 'ю', 'е', 'о', 'ь', 'й',
]

/** Saknei jāpaliek vismaz tik garai, citādi galotni nenogriež. */
const MIN_STEM = 4

/** Vārda sakne bez galotnes: "kokles" -> "kokl", "friziera" -> "frizier". */
export function stem(word: string): string {
  for (const ending of ENDINGS) {
    if (word.endsWith(ending) && word.length - ending.length >= MIN_STEM) {
      return word.slice(0, -ending.length)
    }
  }
  return word
}

/** Vārdi, kas meklēšanu nesašaurina un tāpēc tiek izlaisti. */
const STOPWORDS = new Set([
  'un', 'ar', 'par', 'uz', 'no', 'pie', 'ka', 'ko', 'kas', 'kur', 'es',
  'man', 'mani', 'gribu', 'grib', 'mekleju', 'mekle', 'vajag', 'kadu',
  'kada', 'bet', 'vai', 'lai', 'ari', 'pa', 'the', 'a', 'an', 'and',
  'for', 'in', 'with', 'to', 'of', 'near', 'и', 'в', 'на', 'для', 'с',
  'по', 'к', 'у', 'или', 'мне', 'нужен', 'нужна', 'ищу',
])

/*
 * Vārdi, kas raksturo visu direktoriju, nevis kādu cilvēku: te māca
 * visi. "Kokles skolotājs" nozīmē "kokle" — "skolotājs" neko nesašaurina.
 * Salīdzina pēc sākuma, lai der jebkurš locījums.
 */
const GENERIC_PREFIXES = [
  'skolotaj', 'privatskolotaj', 'pasniedzej', 'repetitor', 'stund',
  'privatstund', 'nodarbib', 'apmacib', 'macib', 'macit', 'iemacit',
  'macities', 'instruktor', 'teacher', 'tutor', 'lesson', 'class',
  'учител', 'репетитор', 'урок', 'заняти', 'преподават',
]

/*
 * Sinonīmi un citas valodas. Ja vārds sākas ar kreiso pusi, meklē arī
 * labo — tā, kā tas rakstīts profilos un tēmu nosaukumos.
 */
const SYNONYMS: [string[], string][] = [
  [['coach', 'коуч', 'kouc'], 'kouc'],
  [['english', 'англ'], 'angl'],
  [['russian', 'русск'], 'krievu'],
  [['german', 'немец', 'немецк'], 'vacu'],
  [['latvian', 'латыш'], 'latviesu'],
  [['guitar', 'гитар'], 'gitar'],
  [['piano', 'фортепиан', 'пианин'], 'klavier'],
  [['drum', 'барабан'], 'bung'],
  [['sing', 'вокал', 'dziedat', 'dziedas'], 'vokal'],
  [['yoga', 'йог'], 'jog'],
  [['barber', 'барбер'], 'barddzin'],
  [['hair', 'парикмах', 'frizur', 'matu'], 'frizier'],
  [['nail', 'маникюр', 'nagu', 'nagi'], 'manikir'],
  [['makeup', 'макияж', 'grim'], 'grim'],
  [['psycholog', 'психолог'], 'psiholog'],
  [['math', 'матем'], 'matemat'],
  [['business', 'бизнес'], 'biznes'],
  [['accounting', 'бухгалт', 'gramatved'], 'gramatved'],
  [['computer', 'компьют', 'excel', 'dator'], 'dator'],
  [['bread', 'хлеб'], 'maiz'],
  [['pottery', 'керамик', 'podniec'], 'keramik'],
  [['beekeep', 'пчел', 'bites'], 'biskop'],
]

/*
 * Kursi, formāts un cena nav profila tekstā — tie ir lauki. Lai
 * "meistarklase", "attālināti" un "bezmaksas" strādātu kā meklēšanas
 * vārdi, profilam piekabinām tos vārdus visās trīs valodās.
 */
const EXPERIENCE_WORDS: Record<string, string> = {
  masterclass: 'meistarklase masterclass мастер класс',
  course: 'kurss kursi course курс',
  retreat: 'retrits retreat ретрит',
  experience: 'pieredze experience впечатление',
}
const FORMAT_WORDS: Record<string, string> = {
  remote: 'attalinati tiessaiste online zoom онлайн дистанционно',
  in_person: 'klatiene in person очно',
  hybrid: 'attalinati tiessaiste online klatiene очно онлайн',
}
const FREE_WORDS = 'bezmaksas free бесплатно'

/** Papildu vārdi profilam no laukiem, ne no teksta. */
export function fieldWords(fields: {
  experienceKinds: string[]
  teachingFormat: string
  isFree: boolean
}): string {
  return [
    ...fields.experienceKinds.map((kind) => EXPERIENCE_WORDS[kind] ?? ''),
    FORMAT_WORDS[fields.teachingFormat] ?? '',
    fields.isFree ? FREE_WORDS : '',
  ].join(' ')
}

export type QueryTerm = {
  /** Kā cilvēks to uzrakstīja — lai varētu parādīt atpakaļ */
  raw: string
  /** Saknes, ko meklēt: pati sakne plus sinonīmi */
  stems: string[]
}

/**
 * Meklēšanas teksts -> vārdi, pēc kuriem tiešām atlasīt.
 * Tukšs saraksts nozīmē "atlasīt nav pēc kā" — tad der visi.
 */
export function parseQuery(query: string): QueryTerm[] {
  const terms: QueryTerm[] = []
  for (const raw of normalize(query).split(' ')) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue
    if (GENERIC_PREFIXES.some((prefix) => raw.startsWith(prefix))) continue

    const stems = [stem(raw)]
    for (const [variants, canonical] of SYNONYMS) {
      if (variants.some((v) => raw.startsWith(v)) && !stems.includes(canonical)) {
        stems.push(canonical)
      }
    }
    terms.push({ raw, stems })
  }
  return terms
}

/** Damerau-Levenšteina attālums: cik burtu jāizmaina, lai vārdi sakristu. */
function editDistance(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const d: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[rows - 1][cols - 1]
}

/** Cik pārrakstīšanās pieļaut: īsiem vārdiem nevienu, garākiem vienu vai divas. */
function allowedTypos(length: number): number {
  if (length >= 8) return 2
  if (length >= 5) return 1
  return 0
}

/** Vai viena meklētā sakne atrodama starp teksta vārdiem. */
function stemMatches(needle: string, words: string[]): boolean {
  const typos = allowedTypos(needle.length)
  return words.some((word) => {
    // "kok" -> "kokle": cilvēks vēl raksta
    if (word.startsWith(needle)) return true
    // "grāmatvedības" -> "grāmatvedība": garāks locījums par tekstā esošo
    const wordStem = stem(word)
    if (wordStem.length >= MIN_STEM && needle.startsWith(wordStem)) return true
    if (typos === 0) return false
    // "matemātka" -> "matemātika": salīdzina ar tikpat garu vārda sākumu
    return (
      editDistance(needle, word.slice(0, needle.length)) <= typos ||
      editDistance(needle, wordStem) <= typos
    )
  })
}

/** Vai meklētais vārds (jebkurš no tā variantiem) ir tekstā. */
export function termMatches(term: QueryTerm, words: string[]): boolean {
  return term.stems.some((s) => stemMatches(s, words))
}

/** Teksts -> vārdu saraksts, gatavs salīdzināšanai. */
export function toWords(text: string): string[] {
  const normalized = normalize(text)
  return normalized ? normalized.split(' ') : []
}
