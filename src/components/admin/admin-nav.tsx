'use client'

import { ShieldCheck } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/admin', label: 'Pārskats' },
  { href: '/admin/lietotaji', label: 'Lietotāji' },
  { href: '/admin/profili', label: 'Profili' },
  { href: '/admin/atsauksmes', label: 'Atsauksmes' },
  { href: '/admin/raksti', label: 'Raksti' },
  { href: '/admin/statistika', label: 'Statistika' },
] as const

export function AdminNav() {
  const pathname = usePathname()

  return (
    <div>
      <h1 className="flex items-center gap-2.5 font-display text-3xl">
        <ShieldCheck className="size-7 text-gold" />
        Administrācija
      </h1>

      <nav className="-mx-6 mt-6 flex gap-1 overflow-x-auto border-b border-hairline px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const active =
            tab.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                '-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm transition-colors',
                active
                  ? 'border-gold text-cream'
                  : 'border-transparent text-mist hover:text-cream'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
