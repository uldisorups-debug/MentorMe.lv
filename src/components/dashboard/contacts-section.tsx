'use client'

import { useTranslations } from 'next-intl'
import { Field } from '@/components/dashboard/field'
import { Input } from '@/components/ui/input'
import { validateContact, type ContactKind } from '@/lib/contacts'

export type ContactDraft = {
  email: string
  whatsapp: string
  telegram: string
  messenger_url: string
  linkedin_url: string
  other_label: string
  other_value: string
}

export const EMPTY_CONTACTS: ContactDraft = {
  email: '',
  whatsapp: '',
  telegram: '',
  messenger_url: '',
  linkedin_url: '',
  other_label: '',
  other_value: '',
}

const FIELDS: {
  key: keyof ContactDraft
  kind: ContactKind | null
  labelKey: string
  placeholder: string
}[] = [
  { key: 'email', kind: 'email', labelKey: 'contactEmail', placeholder: 'vards@uznemums.lv' },
  { key: 'whatsapp', kind: 'whatsapp', labelKey: 'contactWhatsapp', placeholder: '+371 28 348 301' },
  { key: 'telegram', kind: 'telegram', labelKey: 'contactTelegram', placeholder: 'lietotajvards' },
  { key: 'messenger_url', kind: 'messenger', labelKey: 'contactMessenger', placeholder: 'https://m.me/tavs.profils' },
  { key: 'linkedin_url', kind: 'linkedin', labelKey: 'contactLinkedin', placeholder: 'https://linkedin.com/in/tavs-profils' },
  { key: 'other_label', kind: null, labelKey: 'contactOtherLabel', placeholder: 'Signal' },
  { key: 'other_value', kind: null, labelKey: 'contactOtherValue', placeholder: 'https://signal.me/...' },
]

export function ContactsSection({
  contacts,
  onChange,
  consent,
  onConsent,
  consentError,
}: {
  contacts: ContactDraft
  onChange: (next: ContactDraft) => void
  consent: boolean
  onConsent: (next: boolean) => void
  consentError?: string
}) {
  const t = useTranslations('Editor')

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs leading-relaxed text-mist">{t('contactsHint')}</p>

      {FIELDS.map((field) => {
        const value = contacts[field.key]
        // Kļūdu rādām tikai tad, kad laukā kaut kas ir — tukšs ir atļauts
        const error =
          field.kind && value.trim() !== ''
            ? (validateContact(field.kind, value) ?? undefined)
            : undefined

        return (
          <Field
            key={field.key}
            label={t(field.labelKey)}
            htmlFor={`contact-${field.key}`}
            error={error}
          >
            <Input
              id={`contact-${field.key}`}
              value={value}
              placeholder={field.placeholder}
              onChange={(event) =>
                onChange({ ...contacts, [field.key]: event.target.value })
              }
              className="bg-ink"
            />
          </Field>
        )
      })}

      <div className="rounded-lg border border-hairline bg-ink px-4 py-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsent(event.target.checked)}
            className="mt-0.5 size-4 accent-[var(--gold)]"
          />
          <span>
            <span className="block text-sm font-medium">{t('consentLabel')}</span>
            <span className="mt-1 block text-xs leading-relaxed text-mist">
              {t('consentHint')}
            </span>
          </span>
        </label>
      </div>

      {consentError && <p className="-mt-2 text-xs text-coral">{consentError}</p>}
    </div>
  )
}
