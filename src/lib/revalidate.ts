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
  /*
   * Viss zem saknes izkārtojuma: sākumlapa, profili, blogs, tēmu lapas,
   * sitemap — visās valodās.
   *
   * Agrāk te bija atsevišķi ceļi ('/[locale]', '/[locale]/blog', ...), bet
   * sākumlapa, blogs un tēmu lapas dzīvo mapē (marketing), un Next.js
   * maršruta grupu prasa ceļā: '/[locale]', 'page' neatbilda nevienai
   * lapai. Kamēr lapas pašas atjaunojās ik minūti, to neviens nemanīja;
   * kad logs kļuva stunda (ISR taupīšana), jauns profils sarakstā
   * parādījās tikai pēc stundas. '/' + 'layout' aptver visu un nav
   * atkarīgs no mapju nosaukumiem.
   *
   * Tas neko nepārbūvē uzreiz — lapa tiek uzbūvēta no jauna tikai tad,
   * kad kāds to atver. Neatvērtas lapas ISR ierakstus netērē.
   */
  revalidatePath('/', 'layout')
}
