'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

const TYPE_MS = 70
const DELETE_MS = 34
const HOLD_MS = 1700

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false // Serverī pieņemam, ka animācija ir atļauta
  )
}

type TypingState = {
  index: number
  text: string
  deleting: boolean
}

const INITIAL: TypingState = { index: 0, text: '', deleting: false }

function nextState(state: TypingState, words: string[]): TypingState {
  const word = words[state.index]

  if (!state.deleting) {
    return state.text === word
      ? { ...state, deleting: true }
      : { ...state, text: word.slice(0, state.text.length + 1) }
  }

  return state.text === ''
    ? { index: (state.index + 1) % words.length, text: '', deleting: false }
    : { ...state, text: state.text.slice(0, -1) }
}

/**
 * Raksta un dzēš vārdus pēc kārtas.
 *
 * Pieejamība: animētā daļa ir aria-hidden, bet visi varianti tiek atdoti
 * ekrānlasītājam caur sr-only tekstu vecākkomponentē. Ar ieslēgtu
 * prefers-reduced-motion animācija nenotiek — paliek pirmais vārds.
 */
export function TypingHeadline({ words }: { words: string[] }) {
  const [state, setState] = useState<TypingState>(INITIAL)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || words.length === 0) return

    const isHolding = !state.deleting && state.text === words[state.index]
    const delay = isHolding ? HOLD_MS : state.deleting ? DELETE_MS : TYPE_MS

    // setState notiek taimera atzvanā, nevis efekta ķermenī — citādi
    // React brīdina par kaskādes renderiem.
    const timer = setTimeout(
      () => setState((current) => nextState(current, words)),
      delay
    )

    return () => clearTimeout(timer)
  }, [state, words, reduced])

  return (
    <span aria-hidden="true" className="text-gold">
      {reduced ? words[0] : state.text}
      <span className="animate-caret ml-1 inline-block h-[0.85em] w-[3px] rounded-full bg-gold align-[-0.05em]" />
    </span>
  )
}
