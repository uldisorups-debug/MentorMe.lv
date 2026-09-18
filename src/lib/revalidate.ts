import { revalidatePath } from 'next/cache'

/**
 * Pārbūvē visas publiskās lapas: sarakstu, profilus, blogu un sitemap.
 *
 * Profila lapa un saraksts ir statiski ar ISR — bez šī izmaiņas
 * parādītos tikai pēc minūtes, un cilvēks, kurš tikko kaut ko saglabāja,
 * redzētu veco versiju un domātu, ka nekas nenotika.
 *
 * Atsvaidzinām maršrutu, ne konkrētu adresi: ar next-intl viena lapa
 * dzīvo trijās adresēs (/vards, /en/vards, /ru/vards), un uzminēt tās
 * visas ir vairāk vietu, kur kļūdīties.
 */
export function revalidatePublicPages(): void {
  revalidatePath('/[locale]/[slug]', 'page')
  revalidatePath('/[locale]', 'page')

  /*
   * Arī sitemap. Tam ir stundas logs, un bez šī jauns profils Google
   * kartē nonāca tikai pēc stundas — publicēts, redzams lapā, bet
   * meklētājam vēl neesošs. Stunda nav traģēdija, bet tā ir stunda
   * velti tieši tajā brīdī, kad cilvēks visvairāk grib, lai viņu atrod.
   */
  /*
   * Arī blogs. Raksta publicēšana līdz šim neatsvaidzināja neko: redaktors
   * sauca router.refresh(), un tas atjauno tikai to lapu, uz kuras cilvēks
   * stāv, ne publiskās. Autors redzēja "Publicēts", bet sarakstā raksta
   * nebija.
   */
  revalidatePath('/[locale]/blog', 'page')
  revalidatePath('/[locale]/blog/[slug]', 'page')

  revalidatePath('/sitemap.xml')
}
