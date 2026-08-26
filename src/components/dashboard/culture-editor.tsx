'use client'

import { useTranslations } from 'next-intl'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { BookEntry, MovieEntry, MusicEntry } from '@/types/database'

type AnyEntry = BookEntry | MovieEntry | MusicEntry

/** Divi teksta lauki + redzamības slēdzis vienā rindā. */
function EntryRows<T extends AnyEntry>({
  entries,
  onChange,
  fields,
  empty,
}: {
  entries: T[]
  onChange: (next: T[]) => void
  /** [atslēga, etiķete, tips] katram no diviem laukiem */
  fields: [keyof T, string, 'text' | 'number'][]
  empty: T
}) {
  const t = useTranslations('Editor')

  function update(index: number, patch: Partial<T>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2">
          {fields.map(([key, label, type]) => (
            <Input
              key={String(key)}
              type={type}
              aria-label={label}
              placeholder={label}
              value={(entry[key] as string | number | null) ?? ''}
              onChange={(event) =>
                update(index, {
                  [key]:
                    type === 'number'
                      ? event.target.value === ''
                        ? null
                        : Number(event.target.value)
                      : event.target.value,
                } as Partial<T>)
              }
              className={cn(
                'h-9 min-w-0 bg-ink',
                type === 'number' ? 'w-24' : 'flex-1'
              )}
            />
          ))}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={entry.visible ? t('visible') : t('hidden')}
            aria-pressed={entry.visible}
            onClick={() => update(index, { visible: !entry.visible } as Partial<T>)}
            className={entry.visible ? 'text-gold' : 'text-mist/50'}
          >
            {entry.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('removeRow')}
            onClick={() => onChange(entries.filter((_, i) => i !== index))}
            className="text-mist hover:text-coral"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start text-mist hover:text-cream"
        onClick={() => onChange([...entries, { ...empty }])}
      >
        <Plus className="size-3.5" />
        {t('addRow')}
      </Button>
    </div>
  )
}

export function CultureEditor({
  books,
  movies,
  music,
  onBooks,
  onMovies,
  onMusic,
}: {
  books: BookEntry[]
  movies: MovieEntry[]
  music: MusicEntry[]
  onBooks: (next: BookEntry[]) => void
  onMovies: (next: MovieEntry[]) => void
  onMusic: (next: MusicEntry[]) => void
}) {
  const t = useTranslations('Editor')

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs leading-relaxed text-mist">{t('cultureHint')}</p>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true">📚</span>
          {t('books')}
        </h3>
        <EntryRows<BookEntry>
          entries={books}
          onChange={onBooks}
          fields={[
            ['title', t('bookTitle'), 'text'],
            ['author', t('bookAuthor'), 'text'],
          ]}
          empty={{ title: '', author: '', visible: true }}
        />
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true">🎬</span>
          {t('movies')}
        </h3>
        <EntryRows<MovieEntry>
          entries={movies}
          onChange={onMovies}
          fields={[
            ['title', t('movieTitle'), 'text'],
            ['year', t('movieYear'), 'number'],
          ]}
          empty={{ title: '', year: null, visible: true }}
        />
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true">🎵</span>
          {t('music')}
        </h3>
        <EntryRows<MusicEntry>
          entries={music}
          onChange={onMusic}
          fields={[
            ['artist', t('musicArtist'), 'text'],
            ['genre', t('musicGenre'), 'text'],
          ]}
          empty={{ artist: '', genre: '', visible: true }}
        />
      </div>
    </div>
  )
}
