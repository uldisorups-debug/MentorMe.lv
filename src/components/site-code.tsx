'use client'

import { useEffect, useSyncExternalStore } from 'react'
import {
  parseConsent,
  readConsentCookie,
  subscribeConsent,
} from '@/lib/cookie-consent'

/** Vienreiz uz lapas ielādi — arī ja valodas maiņa komponenti pārmontē */
const INJECTED_FLAG = '__mentormeSiteCode'

/**
 * Skripts, kas ielikts caur innerHTML, neizpildās. Tāpēc katru <script>
 * uzbūvējam no jauna ar tiem pašiem atribūtiem un saturu — tā pārlūks to
 * ielādē un palaiž, tieši kā tas būtu bijis HTML no paša sākuma.
 */
function materialize(node: Node): Node {
  if (node instanceof HTMLScriptElement) {
    const script = document.createElement('script')
    for (const attr of Array.from(node.attributes)) {
      script.setAttribute(attr.name, attr.value)
    }
    script.text = node.text
    return script
  }
  const clone = node.cloneNode(false)
  for (const child of Array.from(node.childNodes)) {
    clone.appendChild(materialize(child))
  }
  return clone
}

function inject(html: string, target: HTMLElement) {
  if (!html.trim()) return
  const template = document.createElement('template')
  template.innerHTML = html
  for (const node of Array.from(template.content.childNodes)) {
    target.appendChild(materialize(node))
  }
}

/**
 * Administratora ielīmētais kods (admin → Kods), piemēram, Microsoft
 * Clarity. Darbojas kā Mozello "Papildu kods": <head> kods nonāk
 * galvenē, <body> kods lapas beigās.
 *
 * Ja kodam vajag piekrišanu (noklusējums — analītika liek sīkdatnes),
 * tas tiek ielādēts tikai pēc tam, kad cilvēks sīkdatņu logā piekritis
 * statistikai. Tieši tāpat kā Google Analytics.
 *
 * Meta tagi (domēna verifikācija) šeit nav — tie ir servera HTML, sk.
 * extractMetaTags().
 */
export function SiteCode({
  head,
  body,
  needsConsent,
}: {
  head: string
  body: string
  needsConsent: boolean
}) {
  const raw = useSyncExternalStore(subscribeConsent, readConsentCookie, () => null)
  const allowed = !needsConsent || parseConsent(raw)?.analytics === true

  useEffect(() => {
    if (!allowed || (!head && !body)) return
    const w = window as unknown as Record<string, boolean>
    if (w[INJECTED_FLAG]) return
    w[INJECTED_FLAG] = true

    try {
      inject(head, document.head)
      inject(body, document.body)
    } catch (error) {
      // Salūzis ielīmētais kods nedrīkst salauzt lapu
      console.error('Vietnes kods:', error)
    }
  }, [allowed, head, body])

  return null
}
