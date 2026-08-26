import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/components/link-button'

export const metadata: Metadata = {
  title: 'Par mums',
  description:
    'Zināšanas nemirst pašas. Tās mirst tad, kad tām nav, kam pāriet. MentorMe.lv ir vieta, kur satiekas tas, kurš zina, un tas, kurš grib zināt.',
}

/**
 * Manifests, nevis parasta lapa.
 *
 * Teksts rakstīts latviski tieši šeit, nevis messages/lv.json, jo garu
 * prozu JSON virknēs nevar ne lasīt, ne rediģēt. Kad pievienosim en/ru,
 * šī lapa dabūs atsevišķu satura failu katrai valodai.
 */

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-2xl leading-snug text-balance sm:text-3xl">
      {children}
    </p>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed text-mist">{children}</p>
}

function Story({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="border-l-2 border-gold/30 pl-5">
      <h3 className="font-display text-lg text-cream">{title}</h3>
      <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-mist">
        {children}
      </div>
    </li>
  )
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs font-medium tracking-widest text-gold uppercase">
        Mūsu mērķis
      </p>
      <h1 className="mt-4 font-display text-4xl leading-[1.15] text-balance sm:text-5xl">
        Zināšanas nemirst pašas. Tās mirst tad, kad tām nav, kam pāriet.
      </h1>

      <div className="mt-12 flex flex-col gap-6">
        <P>
          Katru gadu Latvijā kļūst par vienu koklētāju mazāk. Ne tāpēc, ka
          kokle būtu kļuvusi nevajadzīga — bet tāpēc, ka cilvēks, kurš prot uz
          tās spēlēt, dzīvo otrā Latvijas galā, un neviens nekad nav uzzinājis,
          ka pie viņa varēja atbraukt mācīties.
        </P>
        <P>
          Talsu novadā kāda sieviete zina ievārījuma recepti, kuru neviens cits
          neprot pagatavot tāpat. Kad lauku māju pārdos, recepte aizies līdzi.
          Ne tāpēc, ka viņa to slēptu. Tāpēc, ka neviens neatnāca un
          nepajautāja.
        </P>
        <P>
          Tā pazūd prasmes. Ne skaļi, ne uzreiz — vienkārši kādā brīdī vairs
          nav neviena, kas tās prot.
        </P>
      </div>

      <div className="mt-14 rounded-2xl border border-hairline bg-surface p-8">
        <Lead>
          Šī vietne pastāv tāpēc, ka katram cilvēkam ir zināšanas, par kurām
          kāds cits ir gatavs maksāt. Un abi parasti nekad viens otru nesatiek.
        </Lead>
      </div>

      <div className="mt-14">
        <h2 className="rule-gold font-display text-2xl">Kam tas domāts</h2>
        <ul className="mt-8 flex flex-col gap-8">
          <Story title="Jānim, kurš nosēdēja astoņpadsmit gadus">
            <p>
              Par divdesmit eiro viņš izstāstīs, kā izdzīvot pirmajās dienās:
              ko darīt, ko nedarīt, kam neticēt. Cilvēkam, kuram termiņš
              priekšā, tā ir informācija, kuras nav nekur citur.
            </p>
            <p className="text-cream">
              Nezinot pamatlietas, viņš zaudēs krietni vairāk par divdesmit
              eiro.
            </p>
          </Story>

          <Story title="Tantei, kura grib iemācīt vārīt zapti">
            <p>
              Viņa to dara piecdesmit gadus. Viņai nav mājaslapas, nav
              Instagram konta un nav ne mazākās vēlmes to visu taisīt. Viņai
              vajag vienu lapu, kur pierakstīties, un jaunas meitenes, kas
              atbrauks.
            </p>
          </Story>

          <Story title="Bērnam, kurš meklē privātskolotāju">
            <p>
              Matemātikā pirms devītās klases eksāmena. Angļu valodā. Fizikā.
              Vai vienkārši tāpēc, ka grib iemācīties spēlēt bungas, un skolā
              tādas nav.
            </p>
          </Story>

          <Story title="Cilvēkam, kurš grib pats izremontēt istabu">
            <p>
              Nevis nolīgt celtnieku, bet pajautāt celtniekam, kā to izdarīt
              pašam. Divas stundas ar cilvēku, kurš zina, ietaupa nedēļu
              kļūdu.
            </p>
          </Story>

          <Story title="Šefpavāram no Itālijas">
            <p>
              Kurš dzirdējis, ka Kurzemē kāda sieviete kūpina gaļu tā, kā to
              darīja pirms simt gadiem, un grib to iemācīties no viņas pašas —
              nevis no video.
            </p>
          </Story>

          <Story title="Tūristam, kurš negrib suvenīru">
            <p>
              Bet grib vienu dienu, kurā iemācās ķert butes un tās izkūpināt.
              Nopīt Jāņu vainagu. Nodejot sudmaliņas. Aizbraukt mājās ar to, ko
              neviens nevar nopirkt lidostā.
            </p>
          </Story>

          <Story title="Un koučiem un mentoriem arī">
            <p>
              Sertificētiem un nesertificētiem. Tiem ar ICF MCC un divi
              tūkstoši piecsimt stundām, un tiem, kas tikai vāc pirmās prakses
              stundas. Tā ir viena nozare starp četrpadsmit — ne vairāk, bet
              arī ne mazāk svarīga par pārējām.
            </p>
          </Story>
        </ul>
      </div>

      <div className="mt-16 flex flex-col gap-6">
        <h2 className="rule-gold font-display text-2xl">Kā mēs to darām</h2>
        <P>
          Viena lapa, kur var atrast cilvēku pēc tā, ko viņš prot, kur viņš
          dzīvo un vai viņš māca klātienē vai attālināti. Jo dažas lietas var
          iemācīties caur ekrānu, un dažas nevar — kokli, mālu un kūpinātavu
          nevar.
        </P>
        <P>
          Bez maksas abām pusēm. Mēs neņemam komisiju no tā, par ko jūs
          vienojaties. Mēs neuzglabājam jūsu saraksti. Mēs tikai palīdzam
          satikties.
        </P>
        <P>
          Nav svarīgi, vai tev ir diploms. Ir svarīgi, vai tu proti kaut ko,
          ko kāds cits grib iemācīties.
        </P>
      </div>

      <div className="mt-16 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-coral/5 p-8">
        <Lead>
          Ja tu kaut ko proti — kāds tevi meklē. Viņš vienkārši vēl nezina, kur
          tu esi.
        </Lead>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton
            href="/auth/login?next=%2Fdashboard%2Fprofile"
            className="h-12 gap-2 px-6 text-base"
          >
            Pievienot savu profilu
            <ArrowRight className="size-4" />
          </LinkButton>
          <LinkButton
            href="/#kouci"
            variant="outline"
            className="h-12 px-6 text-base"
          >
            Meklēt to, kas zina
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
