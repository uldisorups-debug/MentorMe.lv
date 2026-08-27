/**
 * Teksts -> adrese.
 *
 * Atkārto to pašu, ko public.slugify() datubāzē. Divas ieviesumu vietas
 * nav ideāli, bet alternatīva — braukt uz serveri pie katra taustiņa
 * nospiediena — ir sliktāka. Ja maina vienu, jāmaina otra.
 */

const LATVIAN = 'āĀčČēĒģĢīĪķĶļĻņŅšŠūŪžŽ'
const ASCII = 'aAcCeEgGiIkKlLnNsSuUzZ'

export function slugify(text: string): string {
  const transliterated = [...text]
    .map((ch) => {
      const index = LATVIAN.indexOf(ch)
      return index === -1 ? ch : ASCII[index]
    })
    .join('')

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
