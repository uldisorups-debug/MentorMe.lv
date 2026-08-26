'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { UploadError } from '@/lib/uploads'

/** Pārvērš augšupielādes kļūdas kodu cilvēka valodā. */
export function useUploadError() {
  const t = useTranslations('Editor')
  const [error, setError] = useState<string | null>(null)

  function describe(problem: UploadError | { code: 'failed' }): string {
    switch (problem.code) {
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
