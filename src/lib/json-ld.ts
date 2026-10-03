/**
 * Strukturētie dati <script type="application/ld+json"> iekšienē.
 *
 * JSON.stringify neaizsargā "<", un pārlūks <script> aizver pie pirmā
 * "</script>", lai kur tas būtu — arī JSON virknes vidū. Rakstu virsraksti,
 * kopsavilkumi un profilu teksti nāk no lietotājiem, tāpēc virsraksts
 * "</script><script>..." būtu kods, kas izpildās katram lasītājam.
 * < JSON nozīmē to pašu "<", bet HTML parsētājs to neredz kā tagu.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
