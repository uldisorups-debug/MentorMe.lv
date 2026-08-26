'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BadgeCheck, FileCheck2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeStoredFile, uploadFile } from '@/lib/upload-client'
import { UPLOAD_RULES } from '@/lib/uploads'
import { useUploadError } from '@/components/dashboard/use-upload-error'

/**
 * Sertifikāts iet privātajā bucket'ā, tāpēc glabājam ceļu, ne publisko URL.
 * Publiskajā profilā šis fails neparādās nekad — to redz tikai administrators.
 */
export function CertificateUpload({
  userId,
  value,
  isVerified,
  onChange,
}: {
  userId: string
  value: string | null
  isVerified: boolean
  onChange: (path: string | null) => void
}) {
  const t = useTranslations('Editor')
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const { error, setError, describe } = useUploadError()

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)

    const result = await uploadFile('certificate', file, userId)
    if (!result.ok) {
      setError(describe(result.error))
      setBusy(false)
      return
    }

    if (value) await removeStoredFile('certificate', value)
    onChange(result.path)
    setBusy(false)
  }

  async function clear() {
    if (!value) return
    setBusy(true)
    await removeStoredFile('certificate', value)
    onChange(null)
    setBusy(false)
  }

  return (
    <div>
      <p className="text-xs leading-relaxed text-mist">{t('certProofHint')}</p>

      {isVerified && (
        <p className="mt-3 flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-soft">
          <BadgeCheck className="size-4 shrink-0" />
          {t('verifiedNote')}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_RULES.certificate.mimeTypes.join(',')}
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {busy ? t('uploading') : t('certProof')}
        </Button>

        {value && (
          <>
            <span className="flex items-center gap-1.5 text-xs text-mist">
              <FileCheck2 className="size-4 text-gold" />
              {t('certProofUploaded')}
            </span>
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
          </>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-coral">{error}</p>}
    </div>
  )
}
