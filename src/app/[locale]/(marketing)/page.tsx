import { CoachDirectory } from '@/components/coach-directory'
import { ForCoaches } from '@/components/for-coaches'
import { HeroSection } from '@/components/hero-section'
import { SkillsMarquee } from '@/components/skills-marquee'
import type { CoachCardData } from '@/lib/coaches'
import { setRequestLocale } from 'next-intl/server'
import { loadTaxonomy } from '@/lib/taxonomy'
import { createPublicClient } from '@/lib/supabase/public'

/*
 * Cik profilu sākumlapa ievelk vienā piegājienā.
 *
 * Filtrēšana notiek pārlūkā, pār jau ielādētu sarakstu — pie šāda
 * profilu skaita tas ir ātrāks un patīkamāks par pieprasījumu uz katru
 * filtra maiņu. Kad šis griestus sāk sist, filtrēšana un lappuses
 * jāpārceļ uz servera pusi; zemāk esošais brīdinājums to pateiks.
 */
const DIRECTORY_LIMIT = 500

// ISR — lapa tiek pārbūvēta ne biežāk kā reizi minūtē.
export const revalidate = 60

async function loadDirectory(locale: string) {
  const supabase = createPublicClient()

  const [taxonomy, coachesResult] = await Promise.all([
    loadTaxonomy(locale),
    supabase
      .from('coach_profiles')
      // Viena virkne bez salīmēšanas — citādi PostgREST tipi neizvelk kolonnas
      .select(
        'id, slug, full_name, tagline, avatar_url, qualification, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, teaching_format, region_slug, city, experience_kinds, is_background, avg_rating, review_count, profile_views, created_at'
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(DIRECTORY_LIMIT),
  ])

  if (coachesResult.error) {
    console.error('Neizdevās ielādēt kouču sarakstu:', coachesResult.error.message)
  }

  if ((coachesResult.data?.length ?? 0) >= DIRECTORY_LIMIT) {
    console.warn(
      `Sākumlapa sasniedza ${DIRECTORY_LIMIT} profilu griestus — laiks filtrēšanu pārcelt uz servera pusi.`
    )
  }

  // Reitings tagad nāk līdzi pašam profilam — bez otrā vaicājuma un
  // bez visas atsauksmju tabulas agregēšanas katrā pārbūvē
  const dbCoaches: CoachCardData[] = coachesResult.data ?? []

  return { taxonomy, coaches: dbCoaches }
}

/**
 * Tēmas skrejošajai joslai — pa vienai no katras nozares pēc kārtas.
 *
 * Pēc datubāzes secības pirmās desmit būtu koučings, un josla
 * atkārtotu tieši to iespaidu, ko tā ir domāta izkliedēt. Pārmaiņus
 * no katras nozares iznāk kokle, matemātika, keramika, joga...
 */
const MARQUEE_LIMIT = 36

function marqueeItems(groups: { label: string; sphere: string }[]): string[] {
  const bySphere = new Map<string, string[]>()
  for (const group of groups) {
    if (group.sphere === 'cits') continue
    bySphere.set(group.sphere, [...(bySphere.get(group.sphere) ?? []), group.label])
  }

  const columns = [...bySphere.values()]
  const items: string[] = []
  for (let row = 0; items.length < MARQUEE_LIMIT; row++) {
    const next = columns.map((labels) => labels[row]).filter(Boolean)
    if (next.length === 0) break
    items.push(...next)
  }
  return items.slice(0, MARQUEE_LIMIT)
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  setRequestLocale(locale)

  const { taxonomy, coaches } = await loadDirectory(locale)

  return (
    <>
      <HeroSection
        coachCount={coaches.length}
        sphereCount={taxonomy.spheres.length}
      />
      <SkillsMarquee items={marqueeItems(taxonomy.groups)} />
      <CoachDirectory coaches={coaches} taxonomy={taxonomy} />
      <ForCoaches />
    </>
  )
}
