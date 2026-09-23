import { SITE_URL } from '@/lib/supabase/config'

export const revalidate = 3600

/**
 * llms.txt — īss ceļvedis AI rīkiem (ChatGPT, Claude, Perplexity), kas
 * apraksta vietnes struktūru bez nepieciešamības parsēt katru lapu.
 *
 * Satur struktūru, ne pilnu saturu ar nolūku: profilu saraksts mainās
 * katru dienu, un failu, kas to mēģinātu uzturēt sinhronā, vajadzētu
 * atjaunot pēc katras publicēšanas. Pilnie teksti jau ir pieejami
 * servera puses renderētā HTML katrā attiecīgajā adresē — tas ir tas,
 * ko rāpuļprogramma tur atradīs.
 */
export function GET() {
  const body = `# MentorMe.lv

> Latvijas zināšanu un prasmju direktorija. Cilvēki ar prasmi — no
> mentoriem un koučiem līdz amatniekiem un skolotājiem — izveido
> profilu, paši nosaka cenu, un tos atrod pēc prasmes un atrašanās
> vietas. Bez maksas abām pusēm.

## Galvenais

- [Visi meistari](${SITE_URL}/): pilns saraksts ar filtriem pēc
  nozares, apmācību formas, vietas, budžeta un kvalifikācijas
- [Kā tas darbojas](${SITE_URL}/ka-tas-darbojas)
- [Raksti](${SITE_URL}/blog): paši meistari raksta par to, ko prot

## Valodas

- Latviešu (noklusējums): ${SITE_URL}/
- English: ${SITE_URL}/en
- Русский: ${SITE_URL}/ru

## Piezīme

Meklētāja rezultāti mainās katru dienu — jauni profili tiek pievienoti
pastāvīgi. Šis fails apraksta struktūru, ne pilnu saturu; profilu un
rakstu pilnie teksti ir pieejami servera puses renderētā HTML katrā
attiecīgajā adresē, arī rāpuļprogrammām bez JavaScript izpildes.
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
