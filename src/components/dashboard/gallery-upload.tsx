'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeStoredFile, uploadFile } from '@/lib/upload-client'
import { UPLOAD_RULES, validateCount } from '@/lib/uploads'
import { useUploadError } from '@/components/dashboard/use-upload-error'

export function GalleryUpload({
  userId,
  urls,
  onChange,
}: {
  userId: string
  urls: string[]
  onChange: (next: string[]) => void
}) {
  const t = useTranslations('Editor')
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const { error, setError, describe } = useUploadError()

  async function add(files: FileList | null) {
    if (!files || files.length === 0) return

    const picked = Array.from(files)
    const tooMany = validateCount(urls.length, picked.length, 'gallery')
    if (tooMany) {
      setError(describe(tooMany))
      return
    }

    setBusy(true)
    setError(null)

    const uploaded: string[] = []
    for (const file of picked) {
      const result = await uploadFile('gallery', file, userId)
      if (!result.ok) {
        setError(describe(result.error))
        break // Pārtraucam, bet paturam to, kas jau aizgāja
      }
      uploaded.push(result.url)
    }

    if (uploaded.length > 0) onChange([...urls, ...uploaded])
    setBusy(false)
  }

  async function remove(url: string) {
    onChange(urls.filter((item) => item !== url))
    await removeStoredFile('gallery', url)
  }

  const full = urls.length >= (UPLOAD_RULES.gallery.maxCount ?? Infinity)

  return (
    <div>
      <p className="text-xs text-mist">{t('galleryHint')}</p>

      {urls.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-hairline bg-ink"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover"
              />
              <button
                type="button"
                aria-label={t('galleryRemove')}
                onClick={() => remove(url)}
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-md bg-ink/85 text-mist opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-coral focus-visible:outline-none"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-hairline px-4 py-6 text-center text-sm text-mist">
          {t('galleryEmpty')}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={UPLOAD_RULES.gallery.mimeTypes.join(',')}
        className="sr-only"
        onChange={(event) => {
          add(event.target.files)
          event.target.value = ''
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={busy || full}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="size-4" />
        {busy ? t('uploading') : t('galleryAdd')}
      </Button>

      {error && <p className="mt-3 text-xs text-coral">{error}</p>}
    </div>
  )
}
