import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { topicPath, type TopicEntry, type TopicIndex } from '@/lib/topic-index'

function LinkRow({ title, entries }: { title: string; entries: TopicEntry[] }) {
  if (entries.length === 0) return null
  return (
    <div>
      <h3 className="text-xs tracking-widest text-mist uppercase">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {entries.map((e) => (
          <li key={`${e.kind}-${e.slug}`}>
            <Link
              href={topicPath(e.kind, e.slug)}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-sm text-mist transition-colors hover:border-gold/40 hover:text-cream"
            >
              {e.label}
              <span className="text-xs text-mist/60">{e.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Saites uz visām tēmu, nozaru un vietu lapām, kurās kāds ir.
 *
 * Parastas &lt;a&gt; saites servera HTML — tās Google redz un pa tām
 * aiziet, atšķirībā no filtru pogām, kas strādā tikai ar JavaScript.
 */
export function TopicLinks({ index }: { index: TopicIndex }) {
  const t = useTranslations('Topics')
  if (index.groups.length === 0) return null

  return (
    <section aria-labelledby="temas" className="px-6 pt-4 pb-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-hairline pt-10">
        <h2 id="temas" className="font-display text-2xl">
          {t('browseTitle')}
        </h2>
        <LinkRow title={t('spheresLabel')} entries={index.spheres} />
        <LinkRow title={t('groupsLabel')} entries={index.groups} />
        <LinkRow title={t('regionsLabel')} entries={index.regions} />
      </div>
    </section>
  )
}
