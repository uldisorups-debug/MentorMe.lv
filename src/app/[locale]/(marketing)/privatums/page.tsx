import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export const metadata: Metadata = {
  title: 'Privātuma politika',
  description:
    'Kādus datus MentorMe.lv vāc, kāpēc, cik ilgi glabā un kādas ir tavas tiesības.',
}

/**
 * Atbilst tam, ko kods tiešām dara. Rekvizīti no SIA "Forge Core"
 * oficiālā dokumenta. Pirms īstas plūsmas to būtu vērts iedot juristam
 * apskatīt — es neesmu jurists.
 *
 * Bankas rekvizītus šeit neliekam ar nolūku: publiskā privātuma
 * politikā tiem nav ko darīt.
 */

const UPDATED = '2026. gada 28. augusts'

function Section({
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

export default async function PrivacyPage({
  params,
}: PageProps<'/[locale]/privatums'>) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl">Privātuma politika</h1>
      <p className="mt-3 text-sm text-mist">Spēkā no {UPDATED}.</p>

      <div className="mt-10 flex flex-col gap-8">
        <Section title="Kas ir pārzinis">
          <p>
            Par datu apstrādi MentorMe.lv atbild{' '}
            <strong className="text-cream">SIA &quot;Forge Core&quot;</strong>,
            reģistrācijas numurs 40203671821, PVN numurs LV40203671821.
          </p>
          <p>
            Juridiskā adrese: &quot;Klapēni&quot;, Roja, Rojas pagasts, Talsu
            novads, LV-3264, Latvija.
          </p>
          <p>
            Jautājumos par datiem raksti uz{' '}
            <a href="mailto:info@forgecore.lv" className="text-gold hover:underline">
              info@forgecore.lv
            </a>
            .
          </p>
        </Section>

        <Section title="Kādus datus vācam">
          <p>
            <strong className="text-cream">Ienākot ar Google, LinkedIn vai Facebook:</strong>{' '}
            vārdu, e-pasta adresi un profila bildi. Šos datus mums nodod
            attiecīgais pakalpojums, kad tu tam atļauj.
          </p>
          <p>
            <strong className="text-cream">Reģistrējoties ar e-pastu:</strong>{' '}
            adresi un paroli. Paroli glabā Supabase šifrētā veidā — mēs to
            neredzam un nevaram atgūt, tikai palīdzēt tev uzstādīt jaunu.
          </p>
          <p>
            <strong className="text-cream">Kouča profilā:</strong> to, ko ievadi pats
            — aprakstu, cenu, jomas, valodas, bildes, sertifikātu un saziņas
            kanālus.
          </p>
          <p>
            <strong className="text-cream">Atsauksmēs:</strong> vērtējumu, tekstu un
            to, vai izvēlējies parādīties ar vārdu vai anonīmi.
          </p>
          <p>
            Mēs <strong className="text-cream">neuzglabājam</strong> saraksti starp
            tevi un kouču. Kad nospied &quot;Sūtīt ziņu&quot;, mēs tikai parādām
            kouča kontaktus — pati saruna notiek WhatsApp, e-pastā vai citur, un
            mums tai piekļuves nav.
          </p>
        </Section>

        <Section title="Kāpēc tos vācam">
          <p>
            Lai platforma darbotos: lai tu vari izveidot profilu, lai citi tevi
            atrod, un lai atsauksmes nāktu no īstiem cilvēkiem, nevis robotiem.
            Juridiskais pamats tam ir līguma izpilde — bez šiem datiem lapa
            nevar sniegt to, ko tu no tās gaidi.
          </p>
          <p>
            Kouča saziņas kanālus apstrādājam, pamatojoties uz{' '}
            <strong className="text-cream">tavu piekrišanu</strong>, ko dod, saglabājot
            tos profilā. Piekrišanu vari atsaukt jebkurā brīdī, noņemot ķeksi
            profila redaktorā — tad kontakti pazūd uzreiz.
          </p>
        </Section>

        <Section title="Kas tavus datus redz">
          <p>
            <strong className="text-cream">Publiski</strong> — tikai publicēta kouča
            profila saturs: vārds, apraksts, bildes, cena, jomas un atsauksmes.
          </p>
          <p>
            <strong className="text-cream">Tikai reģistrētiem lietotājiem</strong> —
            kouča saziņas kanāli. Tos glabājam atsevišķi, un neielogotam
            apmeklētājam datubāze tos neatdod vispār; tie nenonāk pat lapas
            pirmkodā.
          </p>
          <p>
            <strong className="text-cream">Neviens cits</strong> — tavu e-pastu, ar ko
            ienāci, neredz ne kouči, ne citi lietotāji. Datus nepārdodam un
            nenododam reklāmdevējiem.
          </p>
          <p>
            <strong className="text-cream">Skatījumu skaitīšana.</strong> Lai viens
            cilvēks neuzpūstu skaitli, atverot lapu simt reižu, mēs saglabājam
            neatgriezenisku jaucējkodu, kas veidots no adreses, profila un
            datuma. Pati adrese netiek glabāta, un ieraksti tiek dzēsti pēc
            divām dienām — pēc tam tie tāpat vairs neko nenozīmē.
          </p>
        </Section>

        <Section title="Kur dati glabājas">
          <p>
            Datubāze un failu krātuve darbojas uz{' '}
            <strong className="text-cream">Supabase</strong> infrastruktūras Eiropas
            Savienībā. Mājaslapu apkalpo{' '}
            <strong className="text-cream">Vercel</strong>. Ar abiem ir noslēgti datu
            apstrādes līgumi.
          </p>
        </Section>

        <Section title="Cik ilgi glabājam">
          <p>
            Kamēr tev ir konts. Kad kontu izdzēs, profils, kontakti, bildes,
            raksti un saņemtās atsauksmes tiek izdzēstas neatgriezeniski.
          </p>
        </Section>

        <Section title="Sīkdatnes un statistika">
          <p>
            Nepieciešamās sīkdatnes ir trīs: valodas izvēle, pieteikšanās sesija
            un pati sīkdatņu izvēle. Bez tām lapa nestrādā, tāpēc tām piekrišana
            nav jāprasa.
          </p>
          <p>
            Apmeklējumus skaitām ar Google Analytics 4, un tas notiek{' '}
            <strong className="text-cream">tikai ar tavu piekrišanu</strong>.
            Kamēr neesi piekritis, skaitītājs netiek ielādēts vispār. Piekrišanu
            var atsaukt jebkurā brīdī — tad Google sīkdatnes tiek izdzēstas.
            Reklāmas un atkārtotās mērķēšanas sīkdatņu mums nav nevienas.
          </p>
          <p>
            Pilns saraksts ar to, kas tieši nonāk pārlūkā, ir{' '}
            <Link href="/sikdatnes" className="text-gold hover:underline">
              sīkdatņu politikā
            </Link>
            . Izvēli var mainīt jebkurā brīdī, kājenē atverot sīkdatņu
            iestatījumus.
          </p>
        </Section>

        <Section title="Tavas tiesības">
          <p>
            Tev ir tiesības uzzināt, kādi dati par tevi ir, tos labot, dzēst,
            atsaukt piekrišanu un iebilst pret apstrādi.
          </p>
          <p>
            Profilu vari labot jebkurā brīdī redaktorā. Kontu un visus datus vari
            izdzēst pats sadaļā &quot;Konts&quot;. Ja kaut kas nav skaidrs, raksti uz{' '}
            <a href="mailto:info@forgecore.lv" className="text-gold hover:underline">
              info@forgecore.lv
            </a>
            .
          </p>
          <p>
            Ja uzskati, ka tavus datus apstrādājam nepareizi, vari sūdzēties{' '}
            <a
              href="https://www.dvi.gov.lv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Datu valsts inspekcijai
            </a>
            .
          </p>
        </Section>

        <Section title="Izmaiņas">
          <p>
            Ja politiku mainīsim būtiski, paziņosim par to lapā. Šī versija ir
            spēkā no {UPDATED}.
          </p>
          <p>
            Ko drīkst un ko nedrīkst lapā, aprakstīts{' '}
            <Link
              href="/lietosanas-noteikumi"
              className="text-gold hover:underline"
            >
              lietošanas noteikumos
            </Link>
            .
          </p>
        </Section>
      </div>
    </div>
  )
}
