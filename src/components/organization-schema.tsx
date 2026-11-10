import { jsonLdHtml } from '@/lib/json-ld'
import { LINKEDIN_URL } from '@/lib/site-links'
import { SITE_URL } from '@/lib/supabase/config'

/**
 * Organization + WebSite strukturētie dati.
 *
 * Šie divi paliek vienādi katrā lapā un katrā valodā — tie apraksta
 * vietni pašu, ne konkrētu profilu vai rakstu. Bez tiem katra lapa
 * Google acīs ir izolēts teksts; ar tiem Google un AI rīki zina, ka
 * "MentorMe.lv" ir viena entītija, kurai pieder visas pārējās lapas.
 *
 * Liekam layout līmenī, ne tikai sākumlapā — izmaksā gandrīz neko, un
 * katrai rāpuļprogrammas apmeklētai lapai ir tas pats konteksts, nevis
 * tikai tai vienai, kuru tā nejauši atrod pirmo.
 */
export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#org`,
        name: 'MentorMe.lv',
        alternateName: 'MentorMe',
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        email: 'info@forgecore.lv',
        areaServed: { '@type': 'Country', name: 'Latvija' },
        /*
         * Kas stāv aiz vietnes — tie paši rekvizīti, kas kontaktu lapā.
         * Google un AI rīki uzticas vietnei, kuras īpašnieks ir zināms.
         */
        parentOrganization: {
          '@type': 'Organization',
          name: 'SIA "Forge Core"',
          vatID: 'LV40203671821',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Roja',
            addressRegion: 'Talsu novads',
            postalCode: 'LV-3264',
            addressCountry: 'LV',
          },
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'info@forgecore.lv',
          availableLanguage: ['lv', 'en', 'ru'],
        },
        // Tā pati organizācija citur — Google to sasaista ar šo vietni
        sameAs: [LINKEDIN_URL],
        description:
          'Latvijas zināšanu un prasmju direktorija: mentori, kouči, privātskolotāji, meistari, kursi, meistarklases un retrīti vienuviet.',
        // Par ko organizācija ir — Google un AI rīki to lieto, lai saprastu,
        // uz kādiem jautājumiem šī lapa ir atbilde
        knowsAbout: [
          'Mentorings',
          'Koučings',
          'Privātstundas',
          'Kursi',
          'Meistarklases',
          'Retrīti',
          'Amatniecība',
          'Valodu apmācība',
          'Mūzikas nodarbības',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#site`,
        url: SITE_URL,
        name: 'MentorMe.lv',
        alternateName: 'MentorMe',
        inLanguage: ['lv', 'en', 'ru'],
        publisher: { '@id': `${SITE_URL}/#org` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
    />
  )
}
