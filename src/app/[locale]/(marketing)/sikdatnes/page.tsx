import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LegalPage, LegalSection } from '@/components/legal-page'
import { CookieSettingsLink } from '@/components/cookie-settings-link'

export const metadata: Metadata = {
  title: 'Sīkdatņu politika',
  description:
    'Kādas sīkdatnes MentorMe.lv liek pārlūkā, kāpēc, cik ilgi tās dzīvo un kā izvēli mainīt.',
}

/**
 * Saraksts atbilst tam, kas tiešām tiek uzlikts. Ja kādreiz pievienojam
 * kaut ko jaunu, vispirms jāpapildina šī tabula un tikai tad kods —
 * pretējā secībā politika kļūst par pieņēmumu, ne par aprakstu.
 */
const UPDATED = '2026. gada 28. augusts'

type Row = {
  name: string
  purpose: string
  life: string
  who: string
}

const ANALYTICS: Row[] = [
  {
    name: '_ga',
    purpose: 'Atšķir vienu pārlūku no cita, lai apmeklētājus neskaitītu divreiz',
    life: '2 gadi',
    who: 'Google',
  },
  {
    name: '_ga_…',
    purpose: 'Tur kopā vienu apmeklējuma reizi',
    life: '2 gadi',
    who: 'Google',
  },
]

const NECESSARY: Row[] = [
  {
    name: 'NEXT_LOCALE',
    purpose: 'Atceras, kurā valodā lapu lasi',
    life: '1 gads',
    who: 'MentorMe.lv',
  },
  {
    name: 'sb-…-auth-token',
    purpose: 'Tur tevi ielogotu, kamēr pārej no lapas uz lapu',
    life: 'Līdz iziešanai',
    who: 'Supabase',
  },
  {
    name: 'mentorme-consent',
    purpose: 'Atceras tieši šo izvēli, lai neprasītu to katru reizi',
    life: '1 gads',
    who: 'MentorMe.lv',
  },
]

function CookieTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-hairline">
            {['Nosaukums', 'Kam tā vajadzīga', 'Cik ilgi', 'Kas liek'].map(
              (head) => (
                <th
                  key={head}
                  className="py-2 pr-4 text-xs font-medium tracking-wide text-mist uppercase"
                >
                  {head}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-hairline/60">
              <td className="py-3 pr-4 align-top">
                <code className="text-xs text-cream">{row.name}</code>
              </td>
              <td className="py-3 pr-4 align-top text-mist">{row.purpose}</td>
              <td className="py-3 pr-4 align-top whitespace-nowrap text-mist">
                {row.life}
              </td>
              <td className="py-3 align-top whitespace-nowrap text-mist">
                {row.who}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function CookiePolicyPage({
  params,
}: PageProps<'/[locale]/sikdatnes'>) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <LegalPage
      title="Sīkdatņu politika"
      updated={UPDATED}
      lead={
        <>
          Sīkdatne ir maza rindiņa, ko lapa noliek tavā pārlūkā, lai kaut ko
          atcerētos. Šeit ir pilns saraksts ar tām, ko liekam mēs — bez
          vispārinājumiem un bez &bdquo;un līdzīgām tehnoloģijām&ldquo;.
        </>
      }
    >
      <LegalSection title="Nepieciešamās">
        <p>
          Bez šīm lapa nestrādā, tāpēc tās ir vienmēr un izslēgt tās nevar. Tās
          neseko tevi pa citām vietnēm un netiek nodotas reklāmdevējiem.
        </p>
        <CookieTable rows={NECESSARY} />
      </LegalSection>

      <LegalSection title="Statistika — tikai ar tavu atļauju">
        <p>
          Skaitām, cik cilvēku bija, kuras lapas viņi skatīja un no kurienes
          atnāca. Tas ir vienīgais veids, kā saprast, vai lapa vispār kādam
          noder. Skaitītājs ir{' '}
          <strong className="text-cream">Google Analytics 4</strong>.
        </p>
        <CookieTable rows={ANALYTICS} />
        <p>
          Šīs sīkdatnes liek Google, un tās atceras tavu pārlūku līdz diviem
          gadiem. Tieši tāpēc tās nav automātiskas:{' '}
          <strong className="text-cream">
            kamēr neesi piekritis, skaitītājs netiek ielādēts vispār
          </strong>{' '}
          — ne ielādēts un izslēgts, bet vienkārši nav.
        </p>
        <p>
          Ja piekrišanu atsauc, mēs šīs sīkdatnes izdzēšam turpat uz vietas un
          skaitītāju apturam. IP adrese Google pusē tiek anonimizēta.
        </p>
        <p>
          Google ir ASV uzņēmums. Datu nodošana notiek uz Eiropas Komisijas
          pieņemtā ES–ASV datu privātuma ietvara pamata, kuram Google ir
          pievienojies.
        </p>
      </LegalSection>

      <LegalSection title="Ko mēs neliekam">
        <p>
          Reklāmas sīkdatņu, Facebook pikseļa, Google Ads atkārtotās mērķēšanas
          un datu tirdzniecības trešajām pusēm šeit nav. Google Analytics ir
          statistikai, ne reklāmai — reklāmas signāli tajā ir izslēgti. Ja
          kādreiz kaut kas mainīsies, tas vispirms parādīsies šajā lapā.
        </p>
      </LegalSection>

      <LegalSection title="Kas nav sīkdatne, bet der zināt">
        <p>
          Kad kāds atver meistara profilu vai rakstu, skaitītājs pieaug par
          vienu. Lai viens cilvēks to nevarētu uzskrūvēt, no adreses, profila un
          šodienas datuma tiek izrēķināts neatgriezenisks jaucējkods.{' '}
          <strong className="text-cream">Pati adrese netiek glabāta nekur</strong>
          , un šie kodi tiek dzēsti pēc divām dienām.
        </p>
      </LegalSection>

      <LegalSection title="Kā mainīt izvēli">
        <p>
          Izvēli var mainīt jebkurā brīdī —{' '}
          <CookieSettingsLink label="atver sīkdatņu iestatījumus" />. Tas pats
          gadās, ja pārlūkā iztīri sīkdatnes: piekrišana pazūd kopā ar tām, un
          nākamreiz pajautāsim vēlreiz.
        </p>
        <p>
          Nepieciešamās sīkdatnes var izslēgt pārlūka iestatījumos, bet tad lapa
          nestrādās, kā vajag: valoda pārsviedīsies atpakaļ un ielogoties nebūs
          iespējams.
        </p>
      </LegalSection>

      <LegalSection title="Kur meklēt vairāk">
        <p>
          Kādus datus vācam un kādas ir tavas tiesības —{' '}
          <Link href="/privatums" className="text-gold hover:underline">
            privātuma politikā
          </Link>
          . Ko drīkst un ko nedrīkst lapā —{' '}
          <Link
            href="/lietosanas-noteikumi"
            className="text-gold hover:underline"
          >
            lietošanas noteikumos
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
