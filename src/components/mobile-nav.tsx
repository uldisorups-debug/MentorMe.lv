'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Menu } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/**
 * Navigācija telefonā.
 *
 * Līdz šim galvenes saites bija paslēptas zem lg izmēra, un telefonā
 * no visas lapas bija sasniedzams tikai logotips. Uz datora tas nebija
 * pamanāms; uz telefona lapa bija bez izejām.
 *
 * Tikai Nav grupas teksti: Footer grupa klientam netiek sūtīta, un
 * vilkt to iekšā viena vārda dēļ nozīmētu piekraut katru lapu.
 */
export function MobileNav() {
  const t = useTranslations('Nav')
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/ka-tas-darbojas', label: t('howItWorks') },
    { href: '/blog', label: t('blog') },
    { href: '/#kouciem', label: t('forCoaches') },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            aria-label={t('menu')}
            className="size-9 px-0 text-mist hover:text-cream lg:hidden"
          >
            <Menu className="size-5" />
          </Button>
        }
      />

      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-display text-lg">
            Mentor<span className="text-gold">Me</span>
            <span className="text-mist">.lv</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4 pb-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base text-mist transition-colors hover:bg-surface hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
