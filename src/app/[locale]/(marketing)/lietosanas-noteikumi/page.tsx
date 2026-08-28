import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LegalList, LegalPage, LegalSection } from '@/components/legal-page'

export const metadata: Metadata = {
  title: 'Lietošanas noteikumi',
  description:
    'Kā MentorMe.lv strādā, ko drīkst un ko nedrīkst, un kas atbild par to, kas notiek pēc iepazīšanās.',
}

/**
 * Rakstīts pēc tā, ko lapa tiešām dara, ne pēc parauga. Divas lietas te
 * ir svarīgākās un abas ir neparastas: mēs neesam darījuma puse, un
 * saruna notiek ārpus lapas. Ja to nepateiktu skaidri, cilvēks domātu,
 * ka mēs par nodarbību atbildam.
 *
 * Es neesmu jurists. Pirms lielākas plūsmas šo būtu vērts iedot
 * cilvēkam, kas ir.
 */
const UPDATED = '2026. gada 28. augusts'

export default async function TermsPage({
  params,
}: PageProps<'/[locale]/lietosanas-noteikumi'>) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <LegalPage
      title="Lietošanas noteikumi"
      updated={UPDATED}
      lead={
        <>
          MentorMe.lv ir saraksts ar cilvēkiem, kuriem pieder zināšanas, un
          vietu, kur viņus atrast. Mēs savedam kopā — pārējais notiek starp
          jums diviem. Šie noteikumi pasaka, ko tas nozīmē praksē.
        </>
      }
    >
      <LegalSection title="Kas mēs esam">
        <p>
          Lapu uztur <strong className="text-cream">SIA &bdquo;Forge Core&ldquo;</strong>,
          reģistrācijas numurs 40203671821, juridiskā adrese &bdquo;Klapēni&ldquo;,
          Roja, Rojas pagasts, Talsu novads, LV-3264. Sazināties var, rakstot uz{' '}
          <a href="mailto:info@forgecore.lv" className="text-gold hover:underline">
            info@forgecore.lv
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Kas ir bez maksas">
        <p>
          Viss. Meklēt, lasīt profilus, skatīt atsauksmes, izveidot savu profilu
          un saņemt uzrunas — par to nemaksā neviens. Mēs neņemam komisiju no
          nodarbībām un nepieprasām daļu no tā, ko meistars nopelna.
        </p>
        <p>
          Ja kādreiz kaut kas kļūs maksas, to pateiksim iepriekš un skaidri. Kas
          jau ir bijis bezmaksas, par tādu arī paliks.
        </p>
      </LegalSection>

      <LegalSection title="Konts">
        <p>
          Meklēt un lasīt var bez konta. Konts vajadzīgs tikai diviem: tiem, kas
          izliek savu profilu, un tiem, kas atstāj atsauksmi.
        </p>
        <LegalList
          items={[
            'Kontu drīkst izveidot cilvēks no 16 gadu vecuma. Jaunākiem vajag vecāku ziņu.',
            'Viens cilvēks — viens konts. Neizliecies par kādu citu un nelieto svešu vārdu.',
            'Par savu paroli atbildi tu. Ja liekas, ka kāds tai ticis klāt, nomaini to un raksti mums.',
            'Savu kontu vari izdzēst pats jebkurā brīdī — profila iestatījumos.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Profils un tā saturs">
        <p>
          To, kas rakstīts profilā, raksta pats meistars. Mēs to nepārbaudām
          iepriekš un negarantējam, ka tas atbilst patiesībai.
        </p>
        <LegalList
          items={[
            'Raksti par sevi patiesi. Nepiedēvē sev pieredzi, kuras nav, un sertifikātus, kurus neesi saņēmis.',
            <>
              Zīme &bdquo;Verificēts&ldquo; nozīmē tikai vienu: mēs esam ar aci
              apskatījuši augšupielādēto sertifikātu. Tā nav ne kvalitātes zīme,
              ne mūsu ieteikums.
            </>,
            'Bildes ievieto tikai tādas, kuras esi tiesīgs izmantot. Svešas bildes no interneta noņemsim.',
            'Cenu norādi godīgi. Ja profilā rakstīts viens, bet sarunā prasīts cits, cilvēki to pamana un raksta mums.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Atsauksmes">
        <p>
          Atsauksmi var atstāt tikai ar kontu — tā nevar aizskriet garām un
          nomest izdomātu vērtējumu. Vārdu var neatklāt: to izvēlas pats autors.
        </p>
        <LegalList
          items={[
            'Raksti par savu pieredzi, ne par baumām.',
            'Atsauksmi par sevi pašu rakstīt nevar, un pārcelt to uz citu profilu arī ne.',
            'Savu atsauksmi drīkst labot. Dzēst to var tikai administrators — citādi neērtu atsauksmi varētu panākt izdzēst ar spiedienu uz cilvēku.',
            'Apvainojumus, draudus, reklāmu un svešu personas datu izpaušanu noņemam.',
          ]}
        />
        <p>
          Ja kāda atsauksme šķiet izdomāta, blakus tai ir poga &bdquo;Ziņot&ldquo;.
          Katru ziņojumu pārbaudām manuāli.
        </p>
      </LegalSection>

      <LegalSection title="Raksti">
        <p>
          Meistari drīkst rakstīt par to, ko paši prot. Viens autors dienā
          publicē vienu rakstu — tas nav sods, tas neļauj vienam cilvēkam
          aizņemt visu pirmo lapu.
        </p>
        <p>
          Publicē tikai savu tekstu. Pārrakstīts sveša raksta saturs, slēpta
          reklāma un saites uz maksas kursiem, kas izliekas par padomu, tiks
          noņemtas.
        </p>
      </LegalSection>

      <LegalSection title="Saruna notiek ārpus lapas">
        <p>
          Mums nav iekšējās sarakstes. Nospiežot &bdquo;Sūtīt ziņu&ldquo;,
          parādās meistara paša kontakti — WhatsApp, e-pasts, Telegram vai kas
          cits, ko viņš norādījis. Tālāk jūs runājat tur.
        </p>
        <p>
          Tas nozīmē divas lietas.{' '}
          <strong className="text-cream">
            Mēs neredzam, par ko jūs vienojaties
          </strong>
          , un tāpēc nevaram to ne apstiprināt, ne apstrīdēt. Un norēķini notiek
          starp jums — mēs neesam ne maksājumu starpnieks, ne darījuma puse.
        </p>
      </LegalSection>

      <LegalSection title="Par ko mēs atbildam un par ko ne">
        <p>
          Mēs atbildam par to, ka lapa strādā, ka dati ir droši un ka ziņojumus
          par pārkāpumiem pārbaudām.
        </p>
        <p>
          Mēs neatbildam par nodarbības kvalitāti, par to, vai meistars ieradās,
          par vienošanos starp jums, par samaksu un par sekām, kas no tā rodas.
          Mēs neesam ne aģentūra, ne darba devējs, ne garantijas devējs.
        </p>
        <p>
          Lapa var būt uz laiku nepieejama — atjauninājumu, kļūdu vai piegādātāja
          dēļ. Mēs cenšamies to novērst ātri, bet nepārtrauktu pieejamību
          negarantējam.
        </p>
      </LegalSection>

      <LegalSection title="Kad mēs profilu noņemam">
        <p>
          Profilu vai kontu varam noņemt bez brīdinājuma, ja tas ir izdomāts, ja
          cilvēks izliekas par kādu citu, ja tiek piedāvāts kaut kas nelikumīgs,
          vai ja lapa tiek izmantota spamam.
        </p>
        <p>
          Pārējos gadījumos — piemēram, ja kaut kas rakstīts neprecīzi — vispirms
          rakstām un lūdzam salabot. Ja rakstu noņem administrators, autors to
          atpakaļ publicēt nevar; par to var rakstīt mums.
        </p>
      </LegalSection>

      <LegalSection title="Tavs saturs paliek tavs">
        <p>
          Viss, ko ievieto profilā vai rakstos, pieder tev. Mums vajag tikai
          tiesības to rādīt lapā un meklētājos — bez tā profils nebūtu redzams.
          Dzēšot kontu, tas pazūd no lapas.
        </p>
      </LegalSection>

      <LegalSection title="Noteikumu maiņa">
        <p>
          Ja noteikumus mainīsim, jaunais datums parādīsies lapas augšā. Būtiskas
          izmaiņas paziņosim tiem, kam ir konts. Turpinot lietot lapu pēc
          izmaiņām, tu piekrīti jaunajai redakcijai.
        </p>
      </LegalSection>

      <LegalSection title="Strīdi">
        <p>
          Piemērojami Latvijas Republikas likumi. Vispirms mēģināsim vienoties
          sarakstoties — tas ir ātrāk visiem. Ja neizdodas, strīdu izšķir
          Latvijas tiesa.
        </p>
        <p>
          Kā apejamies ar datiem, aprakstīts{' '}
          <Link href="/privatums" className="text-gold hover:underline">
            privātuma politikā
          </Link>
          , un ko liekam pārlūkā —{' '}
          <Link href="/sikdatnes" className="text-gold hover:underline">
            sīkdatņu politikā
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
