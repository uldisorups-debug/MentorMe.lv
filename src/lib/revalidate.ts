import { revalidatePath } from 'next/cache'

/**
 * Pārbūvē publiskās lapas, kurās redzams profils.
 *
 * Profila lapa un saraksts ir statiski ar ISR — bez šī izmaiņas
 * parādītos tikai pēc minūtes, un cilvēks, kurš tikko kaut ko saglabāja,
 * redzētu veco versiju un domātu, ka nekas nenotika.
 *
 * Atsvaidzinām maršrutu, ne konkrētu adresi: ar next-intl viena lapa
 * dzīvo trijās adresēs (/profils/..., /en/profils/..., /ru/...), un
 * uzminēt tās visas ir vairāk vietu, kur kļūdīties.
 */
export function revalidateProfilePages(): void {
  revalidatePath('/[locale]/profils/[slug]', 'page')
  revalidatePath('/[locale]', 'page')
}
