'use client'

import { useEffect } from 'react'

/**
 * Brīdinājums, ja cilvēks aiziet ar nesaglabātu darbu.
 *
 * Inga aizpildīja visu profilu, noritināja līdz apakšai, ieraudzīja
 * pogu "Mani raksti" un nospieda to. Viss ierakstītais pazuda. Viņa
 * domāja, ka reģistrācija ir viena gara lapa un saglabājas pati.
 *
 * Divi notikumi, jo ar vienu nepietiek. beforeunload noķer cilni, kas
 * tiek aizvērta vai pārlādēta, bet next/link pārvietošanos lapas
 * iekšienē tas neredz vispār — pārlūks tur nekur neaiziet. Tāpēc otrs
 * klausītājs uz pašas saites, notveršanas fāzē, pirms React paspēj.
 *
 * confirm(), nevis mūsu paša logs: šim jāaptur navigācija, kamēr
 * cilvēks nav atbildējis, un to var izdarīt tikai pārlūks pats.
 */
export function useUnsavedGuard(dirty: boolean, question: string) {
  useEffect(() => {
    if (!dirty) return

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      // Vecāki pārlūki prasa arī šo; paša tekstu neviens vairs nerāda
      event.returnValue = ''
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      // Ctrl/Cmd klikšķis atver jaunu cilni — šī lapa paliek uz vietas
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('#')) return
      if (link.target && link.target !== '_self') return
      if (link.origin !== window.location.origin) return
      if (link.pathname === window.location.pathname) return

      if (!window.confirm(question)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [dirty, question])
}
