import Link from 'next/link'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type ButtonProps = ComponentProps<typeof Button>
type LinkHref = ComponentProps<typeof Link>['href']

/**
 * Poga, kas ir saite.
 *
 * Base UI Button pēc noklusējuma sagaida īstu <button>. Kad to renderē
 * kā <a>, jāpasaka nativeButton={false} — citādi tas brīdina konsolē par
 * pazaudētu pogas semantiku. Šeit tas ir izdarīts vienreiz.
 *
 * target/rel neietilpst <button> atribūtos, tāpēc tie tiek padoti
 * tieši Link komponentei, nevis caur Button props.
 */
export function LinkButton({
  href,
  target,
  rel,
  children,
  ...props
}: Omit<ButtonProps, 'render' | 'nativeButton'> & {
  href: LinkHref
  target?: string
  rel?: string
}) {
  return (
    <Button
      {...props}
      nativeButton={false}
      render={<Link href={href} target={target} rel={rel} />}
    >
      {children}
    </Button>
  )
}
