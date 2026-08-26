import type {
  BookEntry,
  MovieEntry,
  MusicEntry,
} from '@/types/database'
import { DEMO_COACHES, type CoachCardData } from '@/lib/coaches'
import { createPublicClient } from '@/lib/supabase/public'

/** Pilnais profila lapas datu apjoms. */
export type CoachDetail = CoachCardData & {
  /** Vajadzīgs, lai koučam nerādītu atsauksmes formu par sevi pašu */
  user_id: string | null
  bio: string | null
  calendly_url: string | null
  cert_other_label: string | null
  cert_proof_url: string | null
  books_top: BookEntry[]
  movies_top: MovieEntry[]
  music_top: MusicEntry[]
  gallery_urls: string[]
  profile_views: number
}

export type ReviewWithAuthor = {
  id: string
  rating: number
  body: string | null
  created_at: string
  /** null, ja autors izvēlējies palikt anonīms */
  author_name: string | null
}

export type CoachPage = {
  coach: CoachDetail
  reviews: ReviewWithAuthor[]
  isDemo: boolean
}

/**
 * DEMONSTRĀCIJAS PAPILDDATI.
 *
 * Kartīšu lauki nāk no DEMO_COACHES — šeit tikai tas, kas vajadzīgs
 * profila lapai. Kad datubāzē būs īsti kouči, viss šis bloks izmetams.
 */
type DemoExtras = Pick<
  CoachDetail,
  | 'bio'
  | 'calendly_url'
  | 'cert_other_label'
  | 'books_top'
  | 'movies_top'
  | 'music_top'
  | 'gallery_urls'
  | 'profile_views'
>

const DEMO_EXTRAS: Record<string, DemoExtras> = {
  'ilze-berzina': {
    bio: 'Četrpadsmit gadus strādāju ar vadītājiem, kuriem komanda ir kļuvusi par problēmu, nevis resursu. Vairums pie manis atnāk ar vienu jautājumu — "kāpēc viņi mani nedzird?" — un aiziet ar pavisam citu.\n\nStrādāju tieši un bez terapeitiskas maigas balss. Ja meklē kādu, kas piekritīs visam, ko tu saki, es neesmu īstā izvēle.',
    calendly_url: 'https://calendly.com/demo/ilze-15min',
    cert_other_label: null,
    books_top: [
      { title: 'Radical Candor', author: 'Kim Scott', visible: true },
      { title: 'Nedienas ar komandu', author: 'Patrick Lencioni', visible: true },
      { title: 'Turn the Ship Around!', author: 'L. David Marquet', visible: true },
    ],
    movies_top: [
      { title: 'Margin Call', year: 2011, visible: true },
      { title: 'Moneyball', year: 2011, visible: true },
    ],
    music_top: [
      { artist: 'Nils Frahm', genre: 'Neoklasika', visible: true },
      { artist: 'Instrumenti', genre: 'Latviešu pop', visible: true },
    ],
    gallery_urls: ['/demo/gallery-1.svg', '/demo/gallery-3.svg'],
    profile_views: 1284,
  },
  'maris-ozols': {
    bio: 'Divdesmit gadus nostrādāju bankā, pēdējos septiņus vadīju biznesa klientu virzienu. Redzēju simtiem uzņēmēju pieteikumu — un ļoti labi zinu, kur sabrūk tie, kas sabrūk.\n\nTagad palīdzu cilvēkiem, kuri sāk savu. Ne motivācija, bet skaitļi, pieņēmumi un jautājumi, kurus tev neviens neuzdod.',
    calendly_url: 'https://calendly.com/demo/maris-15min',
    cert_other_label: null,
    books_top: [
      { title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz', visible: true },
      { title: 'Financial Intelligence', author: 'Karen Berman', visible: true },
    ],
    movies_top: [{ title: 'The Founder', year: 2016, visible: true }],
    music_top: [{ artist: 'Miles Davis', genre: 'Džezs', visible: true }],
    gallery_urls: ['/demo/gallery-2.svg'],
    profile_views: 743,
  },
  'anna-kalnina': {
    bio: 'Pati izdegu 2016. gadā, strādājot reklāmas aģentūrā. Tas bija ilgs un neglīts ceļš atpakaļ, un tieši tāpēc es zinu, cik maz palīdz padoms "vajag vairāk atpūsties".\n\nStrādāju ar trauksmi, izdegšanu un to stāvokli, kad no rīta nav iemesla piecelties. Bez ezotērikas un bez solījumiem, ka pēc trim sesijām viss būs labi.',
    calendly_url: 'https://calendly.com/demo/anna-15min',
    cert_other_label: null,
    books_top: [
      { title: 'Ķermenis patur rēķinu', author: 'Bessel van der Kolk', visible: true },
      { title: 'Burnout', author: 'Emily & Amelia Nagoski', visible: true },
    ],
    movies_top: [
      { title: 'Inside Out', year: 2015, visible: true },
      { title: 'Perfect Days', year: 2023, visible: true },
    ],
    music_top: [
      { artist: 'Ólafur Arnalds', genre: 'Ambient', visible: true },
      { artist: 'Carbonne', genre: 'Latviešu indie', visible: false },
    ],
    gallery_urls: ['/demo/gallery-4.svg', '/demo/gallery-1.svg', '/demo/gallery-2.svg'],
    profile_views: 2106,
  },
  'juris-lacis': {
    bio: 'Astoņpadsmit gadus izcietu par smagu noziegumu. Iznācu 2019. gadā. Nestāstīšu, ka esmu kļuvis par citu cilvēku — tā nestrādā. Bet zinu precīzi, kā izskatās pirmā nedēļa, pirmais gads un tas, kas notiek ar galvu pa vidu.\n\nStrādāju ar cilvēkiem, kuriem termiņš priekšā, un ar tiem, kas tikko iznākuši. Bez maksas. Man tas nav bizness.',
    calendly_url: null,
    cert_other_label: null,
    books_top: [
      { title: 'Cilvēka meklējumi pēc jēgas', author: 'Viktors Frankls', visible: true },
    ],
    movies_top: [{ title: 'The Shawshank Redemption', year: 1994, visible: true }],
    music_top: [],
    gallery_urls: [],
    profile_views: 512,
  },
  'elina-vitola': {
    bio: 'Divas olimpiādes, viena bronza un desmit gadi, kuros katra diena bija saplānota pa stundām. Sports man iemācīja vienu lietu, kas der visiem: disciplīna nav rakstura īpašība, bet sistēma.\n\nStrādāju ar cilvēkiem, kas grib mainīt ieradumus un katru reizi nokrīt trešajā nedēļā.',
    calendly_url: 'https://calendly.com/demo/elina-15min',
    cert_other_label: null,
    books_top: [
      { title: 'Atomic Habits', author: 'James Clear', visible: true },
      { title: 'Peak', author: 'Anders Ericsson', visible: true },
    ],
    movies_top: [{ title: 'Free Solo', year: 2018, visible: true }],
    music_top: [{ artist: 'The Prodigy', genre: 'Elektronika', visible: true }],
    gallery_urls: ['/demo/gallery-3.svg', '/demo/gallery-4.svg'],
    profile_views: 897,
  },
  'raimonds-krastins': {
    bio: 'Pabeidzu ICF ACC programmu pagājušajā gadā un tagad vācu prakses stundas sertifikācijai. Tieši tāpēc strādāju bez maksas — man vajag stundas, tev vajag kouču. Godīgs darījums.\n\nStrādāju ar studentiem un jaunajiem speciālistiem, kas nesaprot, ko darīt pēc diploma.',
    calendly_url: 'https://calendly.com/demo/raimonds-15min',
    cert_other_label: null,
    books_top: [{ title: 'Designing Your Life', author: 'Bill Burnett', visible: true }],
    movies_top: [],
    music_top: [{ artist: 'Bonobo', genre: 'Downtempo', visible: true }],
    gallery_urls: [],
    profile_views: 168,
  },
  'sanita-liepa': {
    bio: 'Divi savi pusaudži un vienpadsmit gadi darba ar ģimenēm. Zinu, ka lielākā daļa konfliktu mājās nav par to, par ko šķiet.\n\nStrādāju ar vecākiem — ne ar bērniem. Jo mainīties parasti jāsāk tam, kurš atnāk pēc palīdzības.',
    calendly_url: 'https://calendly.com/demo/sanita-15min',
    cert_other_label: null,
    books_top: [
      { title: 'Kā runāt, lai pusaudži klausītos', author: 'Adele Faber', visible: true },
      { title: 'Hold On to Your Kids', author: 'Gordon Neufeld', visible: true },
    ],
    movies_top: [{ title: 'Lady Bird', year: 2017, visible: true }],
    music_top: [{ artist: 'Prāta Vētra', genre: 'Latviešu roks', visible: true }],
    gallery_urls: ['/demo/gallery-2.svg', '/demo/gallery-3.svg'],
    profile_views: 1447,
  },
  'andrejs-zvaigzne': {
    bio: 'Divdesmit gadus praktizēju un mācu meditāciju. Nerunāju par čakrām, enerģijām un Visuma plūsmu — ja tas ir tas, ko meklē, ir citi cilvēki, kas to dara labāk.\n\nMani interesē, kas notiek ar uzmanību, kad tā beidzot apstājas. Tas ir mērāms, un tam ir sekas.',
    calendly_url: 'https://calendly.com/demo/andrejs-15min',
    cert_other_label: 'Vipassana skolotāju programma',
    books_top: [
      { title: 'Waking Up', author: 'Sam Harris', visible: true },
      { title: 'The Mind Illuminated', author: 'Culadasa', visible: true },
    ],
    movies_top: [{ title: 'Samsara', year: 2011, visible: false }],
    music_top: [{ artist: 'Arvo Pärt', genre: 'Sakrālā minimālisma', visible: true }],
    gallery_urls: ['/demo/gallery-1.svg', '/demo/gallery-4.svg'],
    profile_views: 634,
  },
}

const DEMO_REVIEWS: Record<string, ReviewWithAuthor[]> = {
  'ilze-berzina': [
    { id: 'r1', rating: 5, body: 'Pirmajā sesijā man kļuva neērti, un tas bija tieši tas, kas vajadzēja. Pēc četriem mēnešiem komanda beidzot runā atklāti.', created_at: '2026-06-14T10:00:00Z', author_name: 'Kristaps V.' },
    { id: 'r2', rating: 5, body: 'Ilze neļauj izlocīties. Ja atnāc ar gatavu attaisnojumu, tas ilgi neizturēs.', created_at: '2026-05-02T10:00:00Z', author_name: 'Līga M.' },
    { id: 'r3', rating: 4, body: 'Ļoti laba, bet tempu vajadzēja lēnāku. Man vajadzēja vairāk laika starp sesijām.', created_at: '2026-03-21T10:00:00Z', author_name: 'Andris B.' },
    { id: 'r4', rating: 5, body: 'Vienīgā, kas man pateica, ka problēma esmu es, nevis komanda. Tas maksāja, bet bija vērts.', created_at: '2026-02-08T10:00:00Z', author_name: 'Ieva S.' },
    { id: 'r5', rating: 5, body: 'Strukturēti, konkrēti, bez tukšas filozofēšanas.', created_at: '2025-12-19T10:00:00Z', author_name: 'Mārtiņš K.' },
    { id: 'r6', rating: 5, body: 'Iesaku katram, kurš pirmo reizi kļuvis par vadītāju.', created_at: '2025-11-03T10:00:00Z', author_name: 'Elīna P.' },
  ],
  'anna-kalnina': [
    { id: 'r7', rating: 5, body: 'Anna zina, par ko runā, jo pati tur ir bijusi. To jūt no pirmās sarunas.', created_at: '2026-07-01T10:00:00Z', author_name: 'Dita R.' },
    { id: 'r8', rating: 5, body: 'Nesolīja ātrus rezultātus un tieši tāpēc noticēju. Pusgads, un es atkal strādāju.', created_at: '2026-04-17T10:00:00Z', author_name: 'Jānis L.' },
    { id: 'r9', rating: 5, body: 'Bez "pozitīvās domāšanas". Paldies par to.', created_at: '2026-01-25T10:00:00Z', author_name: 'Agnese T.' },
  ],
  'juris-lacis': [
    { id: 'r10', rating: 5, body: 'Runāja ar mani kā ar cilvēku, ne kā ar lietu. Pirms tam tā nebija darījis neviens.', created_at: '2026-05-30T10:00:00Z', author_name: 'Anonīms lietotājs' },
    { id: 'r11', rating: 4, body: 'Grūtas sarunas, bet noderīgas. Sagatavoja tam, kas mani tiešām gaidīja.', created_at: '2026-02-11T10:00:00Z', author_name: 'Anonīms lietotājs' },
  ],
  'maris-ozols': [
    { id: 'r12', rating: 5, body: 'Divās sesijās salauza manu biznesa plānu gabalos. Trešajā palīdzēja salikt no jauna, un šoreiz tas turējās.', created_at: '2026-06-05T10:00:00Z', author_name: 'Roberts Z.' },
    { id: 'r13', rating: 4, body: 'Ļoti stiprs finanšu daļā. Mīkstākās tēmās mazāk.', created_at: '2026-03-14T10:00:00Z', author_name: 'Sandra N.' },
  ],
  'elina-vitola': [
    { id: 'r14', rating: 5, body: 'Sistēma, ne motivācija. Tieši kā solīts.', created_at: '2026-06-22T10:00:00Z', author_name: 'Toms A.' },
  ],
  'sanita-liepa': [
    { id: 'r15', rating: 5, body: 'Pirmo reizi divos gados mēs ar dēlu esam sarunājušies bez kliegšanas.', created_at: '2026-07-10T10:00:00Z', author_name: 'Inese K.' },
    { id: 'r16', rating: 5, body: 'Sanita strādā ar vecākiem, un tas sākumā kaitināja. Tagad saprotu, kāpēc.', created_at: '2026-04-02T10:00:00Z', author_name: 'Gatis D.' },
  ],
  'andrejs-zvaigzne': [
    { id: 'r17', rating: 5, body: 'Nekādas ezotērikas, kā solīts. Skaidri un praktiski.', created_at: '2026-05-18T10:00:00Z', author_name: 'Marta V.' },
    { id: 'r18', rating: 4, body: 'Noderīgi, lai gan sākumā šķita pārāk sausi.', created_at: '2026-01-09T10:00:00Z', author_name: 'Uldis G.' },
  ],
  'raimonds-krastins': [],
}

function demoPage(slug: string): CoachPage | null {
  const card = DEMO_COACHES.find((coach) => coach.slug === slug)
  const extras = DEMO_EXTRAS[slug]
  if (!card || !extras) return null

  return {
    coach: { ...card, user_id: null, cert_proof_url: null, ...extras },
    reviews: DEMO_REVIEWS[slug] ?? [],
    isDemo: true,
  }
}

/** Visi slug'i, kas jāpāragatavo statiski. */
export async function listCoachSlugs(): Promise<string[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('coach_profiles')
    .select('slug')
    .eq('is_published', true)

  if (error || !data || data.length === 0) {
    return Object.keys(DEMO_EXTRAS)
  }
  return data.map((row) => row.slug)
}

/**
 * Ielādē vienu profilu. Vispirms datubāze, tad demonstrācijas dati.
 * Atgriež null, ja tāda slug nav nekur — lapa tad met notFound().
 */
export async function loadCoachPage(slug: string): Promise<CoachPage | null> {
  const supabase = createPublicClient()

  const { data: coach, error } = await supabase
    .from('coach_profiles')
    .select(
      'id, user_id, slug, full_name, tagline, bio, avatar_url, certification, cert_other_label, cert_proof_url, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, calendly_url, books_top, movies_top, music_top, gallery_urls, profile_views'
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) {
    console.error('Neizdevās ielādēt kouča profilu:', error.message)
  }

  if (!coach) {
    return demoPage(slug)
  }

  const [{ data: rating }, { data: reviewRows }] = await Promise.all([
    supabase
      .from('coach_ratings')
      .select('avg_rating, review_count')
      .eq('coach_id', coach.id)
      .maybeSingle(),
    supabase
      .from('reviews')
      .select('id, rating, body, created_at, is_anonymous, client_id, profiles(display_name)')
      .eq('coach_id', coach.id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false }),
  ])

  const reviews: ReviewWithAuthor[] = (reviewRows ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    body: row.body,
    created_at: row.created_at,
    // Anonīmajiem vārdu neizvelkam vispār — tas nedrīkst nonākt HTML'ā
    author_name: row.is_anonymous
      ? null
      : ((row.profiles as { display_name: string | null } | null)
          ?.display_name ?? null),
  }))

  return {
    coach: {
      ...coach,
      books_top: (coach.books_top ?? []) as BookEntry[],
      movies_top: (coach.movies_top ?? []) as MovieEntry[],
      music_top: (coach.music_top ?? []) as MusicEntry[],
      avg_rating: rating?.avg_rating ?? null,
      review_count: rating?.review_count ?? 0,
    },
    reviews,
    isDemo: false,
  }
}
