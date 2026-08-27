/**
 * Supabase kļūdas pārtulkošana cilvēku valodā.
 *
 * Supabase atbild angliski un bez stabila koda, tāpēc jāskatās pašā
 * tekstā. Ja nekas nesakrīt, atgriežam null un rādām Supabase teikto,
 * kāds tas ir — labāk svešs teikums nekā "kaut kas nogāja greizi",
 * pēc kā neviens nesaprot, ko darīt tālāk.
 */
export type AuthErrorKey =
  | 'errInvalidCredentials'
  | 'errAlreadyRegistered'
  | 'errNotConfirmed'
  | 'errRateLimited'
  | 'errWeakPassword'
  | null

export function authErrorKey(message: string): AuthErrorKey {
  const text = message.toLowerCase()

  if (text.includes('invalid login credentials')) return 'errInvalidCredentials'
  if (text.includes('already registered')) return 'errAlreadyRegistered'
  if (text.includes('email not confirmed')) return 'errNotConfirmed'
  if (text.includes('weak password') || text.includes('password should be')) {
    return 'errWeakPassword'
  }
  // "For security purposes, you can only request this after 27 seconds."
  if (
    text.includes('rate limit') ||
    text.includes('too many requests') ||
    text.includes('for security purposes')
  ) {
    return 'errRateLimited'
  }

  return null
}

/** Īsākā parole, ko pieņemam. Supabase noklusējums ir 6 — mēs prasām vairāk. */
export const MIN_PASSWORD_LENGTH = 8

export function passwordTooShort(value: string): boolean {
  return value.length < MIN_PASSWORD_LENGTH
}
