import type { CoachCardData } from '@/lib/coaches'
import { createPublicClient } from '@/lib/supabase/public'
import { loadTaxonomy } from '@/lib/taxonomy'
import {
  buildTopicIndex,
  coachMatches,
  findTopic,
  nicheToSphereMap,
  relatedTopics,
  type TopicEntry,
  type TopicIndex,
  type TopicKind,
} from '@/lib/topic-index'

/**
 * Visi publicētie profili kartītes apjomā.
 *
 * Tēmu lapas, sitemap un "līdzīgie profili" — visi lieto vienu un to
 * pašu sarakstu. Pie šāda profilu skaita tas ir viens ātrs vaicājums;
 * filtrēšana notiek atmiņā.
 */
export async function loadPublishedCards(): Promise<CoachCardData[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('coach_profiles')
    .select(
      'id, slug, full_name, tagline, avatar_url, qualification, is_verified, years_experience, session_languages, price_tier, price_from, price_to, niches, teaching_format, region_slug, city, experience_kinds, is_background, avg_rating, review_count, profile_views, created_at'
    )
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) console.error('Neizdevās ielādēt profilus tēmu lapām:', error.message)
  return data ?? []
}

export async function loadTopicIndex(locale: string): Promise<TopicIndex> {
  const [coaches, taxonomy] = await Promise.all([
    loadPublishedCards(),
    loadTaxonomy(locale),
  ])
  return buildTopicIndex(coaches, taxonomy)
}

export type TopicPageData = {
  topic: TopicEntry
  /** Tēmai — nozare, kurā tā ietilpst */
  parent: TopicEntry | null
  coaches: CoachCardData[]
  related: TopicEntry[]
  /** Nozares lapai — tēmas tajā; vietas lapai — citas vietas */
  children: TopicEntry[]
  nicheNames: Record<string, string>
  regionNames: Record<string, string>
}

export async function loadTopicPage(
  kind: TopicKind,
  slug: string,
  locale: string
): Promise<TopicPageData | null> {
  const [all, taxonomy] = await Promise.all([
    loadPublishedCards(),
    loadTaxonomy(locale),
  ])
  const index = buildTopicIndex(all, taxonomy)
  const topic = findTopic(index, kind, slug)
  if (!topic) return null

  const nicheToSphere = nicheToSphereMap(taxonomy)
  const coaches = all
    .filter((c) => coachMatches(c, kind, slug, nicheToSphere))
    // Fona profili — mūsu pašu, ne piedāvājumi — iet uz beigām
    .sort((a, b) => Number(a.is_background) - Number(b.is_background))

  const parent =
    kind === 'tema' && topic.sphere
      ? findTopic(index, 'nozare', topic.sphere)
      : null

  const children =
    kind === 'nozare'
      ? index.groups.filter((g) => g.sphere === slug)
      : kind === 'vieta'
        ? index.regions.filter((r) => r.slug !== slug)
        : index.groups.filter((g) => g.sphere === topic.sphere && g.slug !== slug)

  return {
    topic,
    parent,
    coaches,
    related: relatedTopics(
      coaches,
      index,
      kind === 'tema' ? slug : '',
    ).filter((r) => !children.some((c) => c.slug === r.slug)),
    children,
    nicheNames: Object.fromEntries(taxonomy.groups.map((g) => [g.value, g.label])),
    regionNames: Object.fromEntries(taxonomy.regions.map((r) => [r.value, r.label])),
  }
}
