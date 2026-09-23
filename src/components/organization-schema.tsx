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
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        description: 'Latvijas zināšanu un prasmju direktorija.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#site`,
        url: SITE_URL,
        name: 'MentorMe.lv',
        inLanguage: ['lv', 'en', 'ru'],
        publisher: { '@id': `${SITE_URL}/#org` },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
