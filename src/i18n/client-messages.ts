import type { AbstractIntlMessages } from 'next-intl'

/**
 * Kuras tekstu grupas nonāk pārlūkā.
 *
 * next-intl sūta klientam visu, ko padod NextIntlClientProvider. Tāpēc
 * publiskajām lapām dodam tikai to, ko lieto to client komponentes —
 * redaktora septiņdesmit teksti uz kouča profila lapas ir lieks svars.
 */

const PUBLIC_GROUPS = [
  'Filters',
  'Coaches',
  'Price',
  'Reviews',
  'Auth',
  'Nav',
  'Contact',
  'Blog',
] as const

const DASHBOARD_GROUPS = [
  ...PUBLIC_GROUPS,
  'Editor',
  'Account',
  'PostEditor',
] as const

function pick(
  messages: AbstractIntlMessages,
  groups: readonly string[]
): AbstractIntlMessages {
  return Object.fromEntries(
    groups.filter((g) => g in messages).map((g) => [g, messages[g]])
  )
}

export function publicMessages(messages: AbstractIntlMessages) {
  return pick(messages, PUBLIC_GROUPS)
}

/**
 * Ligzdots NextIntlClientProvider aizstāj kontekstu, nevis papildina to,
 * tāpēc panelim jāpadod arī visas publiskās grupas.
 */
export function dashboardMessages(messages: AbstractIntlMessages) {
  return pick(messages, DASHBOARD_GROUPS)
}
