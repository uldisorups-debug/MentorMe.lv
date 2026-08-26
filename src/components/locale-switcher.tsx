'use client'

import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { Globe } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { LOCALE_LABELS, routing, type Locale } from '@/i18n/routing'

/**
 * Valodas maiņa, paliekot tajā pašā lapā.
 *
 * usePathname no @/i18n/navigation atgriež ceļu BEZ valodas prefiksa,
 * tāpēc router.replace ar citu locale aizved uz to pašu saturu citā
 * valodā, nevis uz sākumlapu.
 */
export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const params = useParams()
  const router = useRouter()

  const items = routing.locales.map((value) => ({
    value,
    label: LOCALE_LABELS[value],
  }))

  return (
    <Select
      items={items}
      value={locale}
      onValueChange={(next) => {
        router.replace(
          // @ts-expect-error — dinamiskie parametri (slug, id) nav zināmi tipiem
          { pathname, params },
          { locale: String(next) as Locale }
        )
      }}
    >
      <SelectTrigger
        aria-label={LOCALE_LABELS[locale]}
        className="h-9 gap-1.5 border-0 bg-transparent px-2 text-mist hover:text-cream"
      >
        <Globe className="size-4" />
        <span className="text-xs uppercase">{locale}</span>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
