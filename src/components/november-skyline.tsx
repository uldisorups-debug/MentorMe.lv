'use client'

import { useSyncExternalStore } from 'react'
import { isNovemberSeason } from '@/lib/season'

const subscribe = () => () => {}

/**
 * Novembra akcents sākumlapā: Vecrīgas torņu līnija ar karogu virs pils.
 *
 * Tikai rotājums — aria-hidden, bez teksta, ārpus plūsmas (absolute),
 * lai lapa nelēkā, kad tas parādās. Serverī netiek zīmēts vispār:
 * sākumlapa glabājas kešā diennakti, un datumu zina tikai pārlūks.
 *
 * Pēc 24. novembra pazūd pats; failu un tā izsaukumu hero-section.tsx
 * tad var dzēst.
 */
export function NovemberSkyline() {
  const show = useSyncExternalStore(subscribe, isNovemberSeason, () => false)
  if (!show) return null

  return (
    <svg
      aria-hidden="true"
      viewBox="-20 0 480 64"
      className="pointer-events-none absolute bottom-3 left-1/2 w-[min(88vw,30rem)] -translate-x-1/2 animate-in fade-in duration-1000 sm:bottom-6"
      fill="none"
    >
      <defs>
        <linearGradient id="skyline-fade" gradientUnits="userSpaceOnUse" x1="-20" x2="460">
          <stop offset="0" stopColor="#a7a9be" stopOpacity="0" />
          <stop offset="0.16" stopColor="#a7a9be" stopOpacity="0.55" />
          <stop offset="0.84" stopColor="#a7a9be" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a7a9be" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Pils tornis, Doms, Pēterbaznīca, Jēkaba baznīca, Brīvības piemineklis */}
      <path
        d="M-20 60H64V50H72V38L77 31L82 38V50H104V54H118L124 47L130 54H136L141 48L146 54H156V40H164V30C164 24 170 24 170 19V12V19C170 24 176 24 176 30V40H184V54H196L201 48L206 54H214V42H219V30H221L222 24H223L224 17H225L226.5 3L228 17H229L230 24H231L232 30H234V42H239V54H256L261 49L266 54H276V40L281 22L286 40V54H316V50H320.5L322 26L323.5 18L325 26L326.5 50H331V54H350L356 49L362 54H376V60H460"
        stroke="url(#skyline-fade)"
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Karogs virs pils torņa — tur tas plīvo arī īstenībā */}
      <path d="M77 31V15" stroke="#a7a9be" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />
      <rect x="77.6" y="15" width="18" height="9" rx="0.6" fill="#9e3039" />
      <rect x="77.6" y="18.6" width="18" height="1.8" fill="#fffffe" />
    </svg>
  )
}

/**
 * Lente lapas augšā: Latvijas karogs, kas pāriet Lielvārdes jostā.
 *
 * Zīmējums ir gatavs SVG fails (public/sezona/josta.svg); šaurā ekrānā
 * redzams tā vidus, kur karogs kļūst par jostu. Tāpat kā torņu līnija,
 * pazūd pati 25. novembrī.
 */
export function NovemberRibbon() {
  const show = useSyncExternalStore(subscribe, isNovemberSeason, () => false)
  if (!show) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/sezona/josta.svg"
      alt=""
      aria-hidden="true"
      width={1600}
      height={100}
      className="pointer-events-none absolute top-0 left-0 h-14 w-full animate-in object-cover fade-in duration-1000 sm:h-16 min-[1600px]:h-auto"
    />
  )
}
