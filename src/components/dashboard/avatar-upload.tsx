'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeStoredFile, uploadFile } from '@/lib/upload-client'
import { UPLOAD_RULES } from '@/lib/uploads'
import { useUploadError } from '@/components/dashboard/use-upload-error'

export function AvatarUpload({
  userId,
  value,
  fallback,
  onChange,
}: {
  userId: string
  value: string | null
  /** Iniciāļi, ko rādīt, kamēr bildes nav */
  fallback: string
  onChange: (url: string | null) => void
}) {
  const t = useTranslations('Editor')
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const { error, setError, describe } = useUploadError()

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)

    const result = await uploadFile('avatar', file, userId)
    if (!result.ok) {
      setError(describe(result.error))
      setBusy(false)
      return
    }

    // Veco bildi noņemam tikai pēc tam, kad jaunā ir vietā
    if (value) await removeStoredFile('avatar', value)
    onChange(result.url)
    setBusy(false)
  }

  async function clear() {
    if (!value) return
    setBusy(true)
    await removeStoredFile('avatar', value)
    onChange(null)
    setBusy(false)
  }

  return (
    <div>
      <div className="flex items-center gap-5">
        <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-gold/25 to-coral/20">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center font-display text-2xl text-gold">
              {fallback}
            </span>
          )}
        </span>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={UPLOAD_RULES.avatar.mimeTypes.join(',')}
            className="sr-only"
            onChange={(event) => {
              pick(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              {busy ? t('uploading') : t('avatar')}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                aria-label={t('remove')}
                disabled={busy}
                onClick={clear}
                className="text-mist hover:text-coral"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-mist">{t('avatarHint')}</p>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-coral">{error}</p>}
    </div>
  )
}
