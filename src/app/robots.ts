import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/supabase/config'

/*
 * Privātās zonas visās valodās. Agrāk bija tikai '/dashboard/' un
 * '/auth/' — '/en/dashboard/', '/ru/auth/' un '/admin/' palika atvērti.
 */
const PRIVATE = [
  '/dashboard/',
  '/auth/',
  '/admin/',
  '/api/',
  '/*/dashboard/',
  '/*/auth/',
  '/*/admin/',
]

/*
 * AI meklētāji (ChatGPT, Claude, Perplexity, Gemini) atļauti skaidri.
 * '*' tos jau atļauj, bet skaidrs ieraksts nozīmē, ka kāds vēlāk ar
 * vienu globālu aizliegumu nejauši neizslēdz vietni no AI atbildēm.
 */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
