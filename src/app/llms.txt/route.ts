import { SITE_URL } from '@/lib/supabase/config'
import { listPublishedPosts } from '@/lib/posts'
import { loadTopicIndex } from '@/lib/topics'
import { topicPath } from '@/lib/topic-index'

export const revalidate = 3600

/**
 * llms.txt: īss ceļvedis AI rīkiem (ChatGPT, Claude, Perplexity, Gemini).
 *
 * Agrāk te bija tikai struktūra. Tagad arī visu rakstu un lielāko tēmu
 * saraksts ar adresēm: AI rīks, kas atbild uz "cik maksā koučs Latvijā",
 * uzreiz redz, kur ir atbilde, un var to citēt ar saiti. Fakti augšā ir
 * tie paši, kas lapā "Kā tas darbojas", lai atbildes nesaprotas savā
 * starpā.
 */
export async function GET() {
  const [posts, topics] = await Promise.all([
    listPublishedPosts(),
    loadTopicIndex('lv'),
  ])

  const topicLines = [...topics.spheres, ...topics.groups]
    .filter((t) => t.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 25)
    .map(
      (t) =>
        `- [${t.label}](${SITE_URL}${encodeURI(topicPath(t.kind, t.slug))}): ${t.count} profili`
    )

  const regionLines = topics.regions.map(
    (r) => `- [${r.label}](${SITE_URL}${encodeURI(topicPath(r.kind, r.slug))}): ${r.count} profili`
  )

  const postLines = posts
    .filter((p) => p.excerpt.length > 40)
    .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`)

  const body = `# MentorMe.lv

> Latvijas zināšanu un prasmju tirgus laukums. Mentori, kouči,
> privātskolotāji, pasniedzēji, amatnieki un cilvēki ar dzīves pieredzi
> izveido profilu un paši nosaka cenu. Privātstundas, konsultācijas,
> kursi, meistarklases un retrīti klātienē vai attālināti visā Latvijā.

## Fakti

- Meklēt, sazināties un izveidot profilu ir bez maksas.
- MentorMe.lv neņem komisiju. Par cenu un laiku vienojas tieši ar cilvēku.
- Katrā profilā redzama cena, pilsēta vai reģions, valodas un forma:
  klātienē, attālināti vai abējādi.
- Saziņa notiek tieši: WhatsApp, e-pasts, tālrunis vai cits profilā
  norādītais kontakts.
- Vietne ir latviešu, angļu un krievu valodā.

## Galvenās lapas

- [Visi profili ar filtriem](${SITE_URL}/)
- [Kā tas darbojas un biežākie jautājumi](${SITE_URL}/ka-tas-darbojas)
- [Raksti](${SITE_URL}/blog)
- [Pilns adrešu saraksts](${SITE_URL}/sitemap.xml)

## Lielākās tēmas un nozares

${topicLines.join('\n')}

## Vietas

${regionLines.join('\n')}

## Raksti

${postLines.join('\n')}

## Valodas

- Latviešu (noklusējums): ${SITE_URL}/
- English: ${SITE_URL}/en
- Русский: ${SITE_URL}/ru
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
