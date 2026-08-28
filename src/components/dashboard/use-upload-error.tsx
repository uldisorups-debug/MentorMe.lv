'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { UploadError } from '@/lib/uploads'
import type { ResizeFailure } from '@/lib/image-resize'

/** Pārvērš augšupielādes kļūdas kodu cilvēka valodā. */
export function useUploadError() {
  const t = useTranslations('Editor')
  const [error, setError] = useState<string | null>(null)

  function describe(
    problem: UploadError | { code: 'failed' } | { code: ResizeFailure }
  ): string {
    switch (problem.code) {
      case 'not-an-image':
        return t('uploadNotImage')
      case 'input-too-large':
        return t('uploadInputTooLarge')
      case 'decode-failed':
        return t('uploadUnreadable')
      case 'too-large':
        return t('uploadTooLarge', { limitMb: problem.limitMb })
      case 'wrong-type':
        return t('uploadWrongType', { allowed: problem.allowed })
      case 'too-many':
        return t('uploadTooMany', { max: problem.max })
      default:
        return t('uploadFailed')
    }
  }

  return { error, setError, describe }
}
