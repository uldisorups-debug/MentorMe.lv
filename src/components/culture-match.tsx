import { useTranslations } from 'next-intl'
import type { BookEntry, MovieEntry, MusicEntry } from '@/types/database'

function Column({
  icon,
  title,
  items,
}: {
  icon: string
  title: string
  items: { primary: string; secondary: string | null }[]
}) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.primary} className="text-sm leading-snug">
            <span className="text-cream">{item.primary}</span>
            {item.secondary && (
              <span className="block text-xs text-mist">{item.secondary}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Rāda tikai tos ierakstus, kuriem visible = true.
 * Ja neviens nav redzams, visa sadaļa pazūd.
 */
export function CultureMatch({
  books,
  movies,
  music,
}: {
  books: BookEntry[]
  movies: MovieEntry[]
  music: MusicEntry[]
}) {
  const t = useTranslations('Culture')

  const visibleBooks = books
    .filter((b) => b.visible)
    .map((b) => ({ primary: b.title, secondary: b.author }))
  const visibleMovies = movies
    .filter((m) => m.visible)
    .map((m) => ({ primary: m.title, secondary: m.year ? String(m.year) : null }))
  const visibleMusic = music
    .filter((m) => m.visible)
    .map((m) => ({ primary: m.artist, secondary: m.genre }))

  const total = visibleBooks.length + visibleMovies.length + visibleMusic.length
  if (total === 0) return null

  return (
    <section className="border-t border-hairline pt-10">
      <h2 className="font-display text-2xl">{t('title')}</h2>
      <p className="mt-2 max-w-lg text-sm text-mist">{t('lead')}</p>

      <div className="mt-6 grid gap-8 sm:grid-cols-3">
        <Column icon="📚" title={t('books')} items={visibleBooks} />
        <Column icon="🎬" title={t('movies')} items={visibleMovies} />
        <Column icon="🎵" title={t('music')} items={visibleMusic} />
      </div>
    </section>
  )
}
