'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyCode({
  code,
  label,
  copiedLabel,
}: {
  code: string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Pārlūks neļauj — kods ir redzams, to var iezīmēt pats
    }
  }

  return (
    <div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-hairline bg-ink-deep p-3 font-mono text-xs leading-relaxed text-mist">
        {code}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm transition-colors hover:border-gold/40"
      >
        {copied ? <Check className="size-4 text-gold" /> : <Copy className="size-4" />}
        {copied ? copiedLabel : label}
      </button>
    </div>
  )
}
