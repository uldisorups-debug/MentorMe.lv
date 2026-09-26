/**
 * Skrejošā josla ar visām tēmām, ko šeit var atrast.
 *
 * Tā ir atbilde cilvēkam, kurš ienāk, ierauga pirmās kartītes ar
 * "Bizness & vadība" un nodomā, ka te ir tikai biznesa kouči. Pirms
 * viņš nonāk līdz sarakstam, viņš jau ir redzējis kokli, keramiku,
 * maizes cepšanu un matemātiku.
 *
 * Saraksts ir divreiz pēc kārtas, lai animācija varētu iet bezgalīgi
 * bez redzamas šuves (sk. .animate-marquee). Otrā kopija ir
 * aria-hidden — ekrānlasītājam pietiek ar vienu.
 */
export function SkillsMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null

  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className="flex items-center font-display text-2xl whitespace-nowrap text-cream/80 italic sm:text-3xl"
        >
          {item}
          <span aria-hidden="true" className="mx-6 text-base text-gold not-italic sm:mx-8">
            ✦
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="group/marquee relative overflow-hidden border-y border-hairline bg-ink-deep/60 py-5">
      {/* Malas izplūst fonā, lai josla neizskatās nogriezta ar nazi */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-32"
      />
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
