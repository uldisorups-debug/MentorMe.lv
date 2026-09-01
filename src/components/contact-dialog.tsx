'use client'

import { useState } from 'react'
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Lock, Mail, MessageCircle, Send, Link as LinkIcon } from 'lucide-react'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from '@/components/provider-icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LinkButton } from '@/components/link-button'
import { createClient } from '@/lib/supabase/client'
import { buildContactLinks, type ContactKind, type ContactLink } from '@/lib/contacts'

// lucide zīmolu ikonas vairs nesatur, tāpēc WhatsApp, Messenger un
// LinkedIn nāk no mūsu pašu komplekta
const ICONS: Record<ContactKind, (p: { className?: string }) => React.ReactNode> = {
  whatsapp: WhatsAppIcon,
  email: Mail,
  telegram: Send,
  messenger: FacebookIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  other: LinkIcon,
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'anonymous' }
  | { kind: 'ready'; links: ContactLink[] }

/**
 * "Sūtīt ziņu" — atklāj kouča kontaktus reģistrētam lietotājam.
 *
 * Iekšējās sarakstes nav ar nolūku: saruna notiek kouča parastajā
 * lietotnē, tāpēc viņam nav jāatgriežas šeit, lai ziņu ieraudzītu.
 *
 * Kontakti tiek pieprasīti tikai dialoga atvēršanas brīdī. Neielogotam
 * datubāze tos neatdod vispār — tie nekad nenonāk lapas kodā.
 */
export function ContactDialog({
  coachId,
  coachName,
}: {
  coachId: string
  coachName: string
}) {
  const t = useTranslations('Contact')
  const pathname = usePathname()
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function load(open: boolean) {
    if (!open) {
      setState({ kind: 'idle' })
      return
    }

    setState({ kind: 'loading' })
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setState({ kind: 'anonymous' })
      return
    }

    const { data, error } = await supabase
      .from('coach_contacts')
      .select(
        'email, whatsapp, telegram, messenger_url, linkedin_url, instagram, other_label, other_value, consent_at'
      )
      .eq('coach_id', coachId)
      .maybeSingle()

    if (error) console.error('Neizdevās ielādēt kontaktus:', error.message)

    // Bez piekrišanas kontaktus nerādām, pat ja tie ir ievadīti
    const links = data?.consent_at ? buildContactLinks(data) : []
    setState({ kind: 'ready', links })
  }

  return (
    <Dialog onOpenChange={load}>
      <DialogTrigger
        render={
          <Button className="h-11 w-full gap-2 text-sm">
            <MessageCircle className="size-4" />
            {t('sendMessage')}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        {state.kind === 'anonymous' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="size-4 text-gold" />
                {t('loginTitle')}
              </DialogTitle>
              <DialogDescription>{t('loginBody')}</DialogDescription>
            </DialogHeader>
            <LinkButton
              href={`/auth/login?next=${encodeURIComponent(pathname ?? '/')}`}
              className="h-11 w-full"
            >
              {t('loginCta')}
            </LinkButton>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('dialogTitle', { name: coachName })}</DialogTitle>
              {state.kind === 'ready' && state.links.length > 0 && (
                <DialogDescription>
                  {t('dialogLeadOpen', { name: coachName })}
                </DialogDescription>
              )}
            </DialogHeader>

            {state.kind !== 'ready' ? (
              <div className="flex flex-col gap-2">
                <span className="h-11 animate-pulse rounded-lg bg-surface" />
                <span className="h-11 animate-pulse rounded-lg bg-surface" />
              </div>
            ) : state.links.length === 0 ? (
              <p className="py-2 text-sm text-mist">
                {t('noContacts', { name: coachName })}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {state.links.map((link) => {
                  const Icon = ICONS[link.kind]
                  return (
                    <li key={link.kind}>
                      <LinkButton
                        href={link.href}
                        variant="outline"
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="h-11 w-full justify-start gap-3 text-sm"
                      >
                        <Icon className="size-4 text-gold" />
                        {link.label}
                      </LinkButton>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
