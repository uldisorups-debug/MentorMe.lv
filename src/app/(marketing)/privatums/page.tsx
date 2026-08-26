import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privātuma politika',
  description:
    'Kādus datus MentorMe.lv vāc, kāpēc, cik ilgi glabā un kādas ir tavas tiesības.',
}

/**
 * MELNRAKSTS. Atbilst tam, ko kods tiešām dara, bet pirms īstas
 * plūsmas to būtu vērts iedot juristam apskatīt. Vietas, kas prasa
 * Ulda lēmumu, atzīmētas ar [AIZPILDĪT].
 */

const UPDATED = '2026. gada 27. augusts'

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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl">Privātuma politika</h1>
      <p className="mt-3 text-sm text-mist">Spēkā no {UPDATED}.</p>

      <div className="mt-10 flex flex-col gap-8">
        <Section title="Kas ir pārzinis">
          <p>
            Par datu apstrādi MentorMe.lv atbild{' '}
            <strong className="text-cream">
              SIA &quot;Forge Core&quot;, reģ. nr. [AIZPILDĪT]
            </strong>
            , juridiskā adrese [AIZPILDĪT], Rīga, Latvija.
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

        <Section title="Sīkdatnes">
          <p>
            Lietojam tikai tās sīkdatnes, kas nepieciešamas pieteikšanās
            saglabāšanai. Tām piekrišana nav jāprasa, un izsekošanas vai
            reklāmas sīkdatņu mums nav.
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
        </Section>
      </div>
    </div>
  )
}
