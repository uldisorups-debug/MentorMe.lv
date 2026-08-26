import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function GalleryGrid({
  urls,
  coachName,
}: {
  urls: string[]
  coachName: string
}) {
  const t = useTranslations('Coach')
  if (urls.length === 0) return null

  return (
    <section className="border-t border-hairline pt-10">
      <h2 className="font-display text-2xl">{t('gallery')}</h2>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-4/3 overflow-hidden rounded-xl border border-hairline bg-surface"
          >
            <Image
              src={url}
              alt={t('galleryAlt', { name: coachName, index: index + 1 })}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
