/**
 * Kopīgais ietvars juridiskajām lapām.
 *
 * Trīs lapas ar vienādu uzbūvi — virsraksts, spēkā stāšanās datums un
 * sadaļas ar hairline atdalītājiem. Bez šī katrā no tām būtu tas pats
 * izkārtojums pārrakstīts no jauna, un tās sāktu klusi atšķirties.
 */
export function LegalPage({
  title,
  updated,
  lead,
  children,
}: {
  title: string
  updated: string
  lead?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-mist">Spēkā no {updated}.</p>
      {lead && (
        <p className="mt-6 leading-relaxed text-mist">{lead}</p>
      )}

      <div className="mt-10 flex flex-col gap-8">{children}</div>
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-hairline pt-8">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-mist">
        {children}
      </div>
    </section>
  )
}

/** Uzskaitījums ar zelta punktiem — lasās vieglāk nekā rindkopa. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={index} className="grid grid-cols-[0.75rem_1fr] gap-3">
          <span aria-hidden="true" className="pt-2 text-gold">
            ·
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
