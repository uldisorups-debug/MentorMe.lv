'use client'

import { useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ExternalLink, Save } from 'lucide-react'
import { AvatarUpload } from '@/components/dashboard/avatar-upload'
import { ChipPicker } from '@/components/dashboard/chip-picker'
import {
  ContactsSection,
  type ContactDraft,
} from '@/components/dashboard/contacts-section'
import { CultureEditor } from '@/components/dashboard/culture-editor'
import { Field, Section } from '@/components/dashboard/field'
import { initials } from '@/components/coach-avatar'
import { LinkButton } from '@/components/link-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import {
  hasErrors,
  validateProfile,
  type FieldErrors,
  type ProfileDraft,
} from '@/lib/profile-validation'
import { hasAnyContact } from '@/lib/contacts'
import type {
  BookEntry,
  CoachContacts,
  CertLevel,
  CoachProfile,
  MovieEntry,
  MusicEntry,
  PriceTier,
  TeachingFormat,
} from '@/types/database'

const LANGUAGE_OPTIONS = [
  { value: 'lv', label: 'Latviešu' },
  { value: 'en', label: 'Angļu' },
  { value: 'ru', label: 'Krievu' },
]

const MAX_NICHES = 4

export function ProfileEditor({
  userId,
  coach,
  contacts: savedContacts,
  categories,
  regions,
}: {
  userId: string
  coach: CoachProfile
  contacts: CoachContacts | null
  categories: { value: string; label: string }[]
  regions: { value: string; label: string }[]
}) {
  const t = useTranslations('Editor')
  const router = useRouter()

  // Teksta lauki dzīvo kā virknes — tā tukšs lauks paliek tukšs,
  // nevis pārvēršas par 0.
  const [draft, setDraft] = useState<ProfileDraft>({
    slug: coach.slug,
    full_name: coach.full_name,
    tagline: coach.tagline ?? '',
    bio: coach.bio ?? '',
    years_experience:
      coach.years_experience === null ? '' : String(coach.years_experience),
    price_from: coach.price_from === null ? '' : String(coach.price_from),
    price_to: coach.price_to === null ? '' : String(coach.price_to),
    calendly_url: coach.calendly_url ?? '',
    niches: coach.niches,
    session_languages: coach.session_languages,
    is_published: coach.is_published,
    has_contact: false, // aizpildās save() brīdī
    contacts_filled: false,
    consent_given: false,
  })

  const [certification, setCertification] = useState<CertLevel>(
    coach.certification ?? 'none'
  )
  const [certOtherLabel, setCertOtherLabel] = useState(coach.cert_other_label ?? '')
  const [certNote, setCertNote] = useState(coach.cert_note ?? '')
  const [priceTier, setPriceTier] = useState<PriceTier>(coach.price_tier)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(coach.avatar_url)
  const [books, setBooks] = useState<BookEntry[]>(coach.books_top)
  const [movies, setMovies] = useState<MovieEntry[]>(coach.movies_top)
  const [music, setMusic] = useState<MusicEntry[]>(coach.music_top)

  const [contacts, setContacts] = useState<ContactDraft>({
    email: savedContacts?.email ?? '',
    whatsapp: savedContacts?.whatsapp ?? '',
    telegram: savedContacts?.telegram ?? '',
    messenger_url: savedContacts?.messenger_url ?? '',
    linkedin_url: savedContacts?.linkedin_url ?? '',
    instagram: savedContacts?.instagram ?? '',
    other_label: savedContacts?.other_label ?? '',
    other_value: savedContacts?.other_value ?? '',
  })
  const [consent, setConsent] = useState(Boolean(savedContacts?.consent_at))
  const [format, setFormat] = useState<TeachingFormat>(coach.teaching_format)
  const [region, setRegion] = useState(coach.region_slug ?? 'none')
  const [city, setCity] = useState(coach.city ?? '')
  const [forTourists, setForTourists] = useState(coach.for_tourists)

  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setSavedAt(null)
  }

  const certOptions = useMemo(
    () => [
      { value: 'none', label: 'Bez sertifikāta' },
      { value: 'acc', label: 'ICF ACC' },
      { value: 'pcc', label: 'ICF PCC' },
      { value: 'mcc', label: 'ICF MCC' },
      { value: 'metacoach', label: 'MetaCoach' },
      { value: 'other', label: 'Cita' },
    ],
    []
  )

  const formatOptions = useMemo(
    () => [
      { value: 'remote', label: t('formatRemote') },
      { value: 'in_person', label: t('formatInPerson') },
      { value: 'hybrid', label: t('formatHybrid') },
    ],
    [t]
  )

  const regionOptions = useMemo(
    () => [{ value: 'none', label: t('regionNone') }, ...regions],
    [regions, t]
  )

  const tierOptions = useMemo(
    () => [
      { value: 'free', label: 'Bezmaksas' },
      { value: 'affordable', label: 'Pieejama' },
      { value: 'mid', label: 'Vidēja' },
      { value: 'premium', label: 'Augstākā' },
    ],
    []
  )

  async function save() {
    // Kontaktu klātbūtne nav atsevišķs lauks formā — to aprēķinām no
    // ievadītā tieši pirms pārbaudes, lai stāvoklis nenovecotu
    const contactValues = {
      email: contacts.email || null,
      whatsapp: contacts.whatsapp || null,
      telegram: contacts.telegram || null,
      messenger_url: contacts.messenger_url || null,
      linkedin_url: contacts.linkedin_url || null,
      instagram: contacts.instagram || null,
      other_label: contacts.other_label || null,
      other_value: contacts.other_value || null,
    }
    const contactsFilled = Object.values(contactValues).some((v) => v !== null)
    const reachable =
      (consent && hasAnyContact(contactValues)) ||
      draft.calendly_url.trim() !== ''

    const checked = {
      ...draft,
      has_contact: reachable,
      contacts_filled: contactsFilled,
      consent_given: consent,
    }

    const found = validateProfile(checked)
    setErrors(found)
    if (hasErrors(found)) {
      setSaveError(draft.is_published ? t('publishBlocked') : null)
      return
    }

    setSaving(true)
    setSaveError(null)

    // Tukšas kultūras rindas nav ko glabāt
    const cleanBooks = books.filter((b) => b.title.trim() !== '')
    const cleanMovies = movies.filter((m) => m.title.trim() !== '')
    const cleanMusic = music.filter((m) => m.artist.trim() !== '')

    const supabase = createClient()
    const { error } = await supabase
      .from('coach_profiles')
      .update({
        slug: draft.slug.trim(),
        full_name: draft.full_name.trim(),
        tagline: draft.tagline.trim() || null,
        bio: draft.bio.trim() || null,
        avatar_url: avatarUrl,
        certification,
        cert_other_label:
          certification === 'other' ? certOtherLabel.trim() || null : null,
        cert_note: certNote.trim() || null,
        years_experience:
          draft.years_experience.trim() === ''
            ? null
            : Number(draft.years_experience),
        session_languages: draft.session_languages,
        price_tier: priceTier,
        price_from:
          draft.price_from.trim() === '' ? null : Number(draft.price_from),
        price_to: draft.price_to.trim() === '' ? null : Number(draft.price_to),
        niches: draft.niches,
        teaching_format: format,
        region_slug: region === 'none' ? null : region,
        city: city.trim() || null,
        for_tourists: forTourists,
        calendly_url: draft.calendly_url.trim() || null,
        books_top: cleanBooks,
        movies_top: cleanMovies,
        music_top: cleanMusic,
        is_published: draft.is_published,
      })
      .eq('user_id', userId)

    setSaving(false)

    if (error) {
      console.error('Profila saglabāšana neizdevās:', error.message)

      /*
       * Datubāzei ir savi ierobežojumi blakus priekšpuses pārbaudēm.
       * Ja tie nostrādā, cilvēkam jāzina, kurš tieši — "saglabāšana
       * neizdevās" liek domāt, ka vainīgs serveris, un viņš mēģina to
       * pašu vēl piecas reizes.
       */
      if (error.code === '23505') {
        // Unikalitātes pārkāpums, praksē vienmēr aizņemts slug
        setErrors({ slug: t('slugTaken') })
        setSaveError(null)
      } else if (error.code === '23514') {
        setSaveError(t('errTooLong'))
      } else if (error.code === 'P0004') {
        setSaveError(t('errUnknownNiche'))
      } else {
        setSaveError(`${t('saveError')} (${error.message})`)
      }
      return
    }

    /*
     * Loma seko publicēšanai, ne lapas atvēršanai. Agrāk to uzlika
     * jau tad, kad kāds vienkārši atvēra redaktoru — arī aiz ziņkāres.
     */
    if (draft.is_published) {
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'coach' })
        .eq('id', userId)
      if (roleError) {
        console.error('Lomas maiņa neizdevās:', roleError.message)
      }
    }

    // Kontakti dzīvo atsevišķā tabulā, tāpēc atsevišķs upsert.
    // consent_at glabā datumu, nevis boolean — lai vēlāk var pierādīt,
    // kad tieši cilvēks piekrita.
    const { error: contactError } = await supabase
      .from('coach_contacts')
      .upsert({
        coach_id: coach.id,
        ...contactValues,
        consent_at: consent
          ? (savedContacts?.consent_at ?? new Date().toISOString())
          : null,
      })

    if (contactError) {
      console.error('Kontaktu saglabāšana neizdevās:', contactError.message)
      setSaveError(t('saveError'))
      return
    }

    setBooks(cleanBooks)
    setMovies(cleanMovies)
    setMusic(cleanMusic)
    setSavedAt(Date.now())

    /*
     * Publiskā lapa ir statiska ar ISR. Bez šī izmaiņas tur parādītos
     * tikai pēc minūtes, un cilvēks, kurš tikko saglabāja un uzreiz
     * atvēra savu profilu, redzētu veco versiju.
     *
     * Ja neizdodas, klusējam: profils ir saglabāts, un lapa atjaunosies
     * pati pēc minūtes. Kļūdas paziņojums te maldinātu.
     */
    try {
      await fetch('/api/revalidate-profile', { method: 'POST' })
    } catch (refreshError) {
      console.error('Publiskās lapas atsvaidzināšana:', refreshError)
    }

    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <Section title={t('sectionBasics')}>
        <AvatarUpload
          userId={userId}
          value={avatarUrl}
          fallback={initials(draft.full_name || '?')}
          onChange={(url) => {
            setAvatarUrl(url)
            setSavedAt(null)
          }}
        />

        <Field label={t('fullName')} htmlFor="full_name" error={errors.full_name}>
          <Input
            id="full_name"
            value={draft.full_name}
            onChange={(event) => set('full_name', event.target.value)}
            className="bg-ink"
          />
        </Field>

        <Field
          label={t('slug')}
          htmlFor="slug"
          hint={t('slugHint')}
          error={errors.slug}
        >
          <div className="flex items-center gap-1 rounded-lg border border-input bg-ink px-3">
            <span className="shrink-0 text-sm text-mist">mentorme.lv/profils/</span>
            <Input
              id="slug"
              value={draft.slug}
              maxLength={60}
              onChange={(event) =>
                set('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))
              }
              className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>
        </Field>

        <Field
          label={t('tagline')}
          htmlFor="tagline"
          hint={t('taglineHint')}
          error={errors.tagline}
        >
          <Input
            id="tagline"
            value={draft.tagline}
            maxLength={120}
            onChange={(event) => set('tagline', event.target.value)}
            className="bg-ink"
          />
        </Field>

        <Field
          label={t('bio')}
          htmlFor="bio"
          hint={t('bioHint')}
          error={errors.bio}
        >
          <Textarea
            id="bio"
            rows={8}
            value={draft.bio}
            maxLength={4000}
            onChange={(event) => set('bio', event.target.value)}
            className="bg-ink"
          />
        </Field>
      </Section>

      <Section title={t('sectionProfessional')}>
        <Field label={t('certification')}>
          <Select
            items={certOptions}
            value={certification}
            onValueChange={(next) => setCertification(String(next) as CertLevel)}
          >
            <SelectTrigger className="h-10 w-full bg-ink">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {certOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {certification === 'other' && (
          <Field label={t('certOtherLabel')} htmlFor="cert_other">
            <Input
              id="cert_other"
              value={certOtherLabel}
              onChange={(event) => setCertOtherLabel(event.target.value)}
              className="bg-ink"
            />
          </Field>
        )}

        {/*
          Faila augšupielādes vietā apraksts. Pārbaudīt sertifikātu
          administrators tik un tā varēja tikai sarakstoties — fails to
          neatviegloja, bet aizņēma līdz 5 MB no viena cilvēka.
        */}
        <Field label={t('certNote')} hint={t('certNoteHint')} htmlFor="cert_note">
          <Textarea
            id="cert_note"
            rows={3}
            maxLength={400}
            value={certNote}
            onChange={(event) => {
              setCertNote(event.target.value)
              setSavedAt(null)
            }}
            className="bg-ink"
          />
        </Field>

        <Field
          label={t('yearsExperience')}
          htmlFor="years"
          error={errors.years_experience}
        >
          <Input
            id="years"
            type="number"
            min={0}
            max={80}
            value={draft.years_experience}
            onChange={(event) => set('years_experience', event.target.value)}
            className="w-32 bg-ink"
          />
        </Field>

        <Field label={t('languages')} error={errors.session_languages}>
          <ChipPicker
            label={t('languages')}
            options={LANGUAGE_OPTIONS}
            selected={draft.session_languages}
            onChange={(next) => set('session_languages', next)}
          />
        </Field>
      </Section>

      <Section title={t('sectionPricing')}>
        <Field label={t('priceTier')}>
          <Select
            items={tierOptions}
            value={priceTier}
            onValueChange={(next) => setPriceTier(String(next) as PriceTier)}
          >
            <SelectTrigger className="h-10 w-full bg-ink">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tierOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex flex-wrap gap-4">
          <Field
            label={t('priceFrom')}
            htmlFor="price_from"
            error={errors.price_from}
          >
            <Input
              id="price_from"
              type="number"
              min={0}
              value={draft.price_from}
              onChange={(event) => set('price_from', event.target.value)}
              className="w-32 bg-ink"
            />
          </Field>
          <Field label={t('priceTo')} htmlFor="price_to" error={errors.price_to}>
            <Input
              id="price_to"
              type="number"
              min={0}
              value={draft.price_to}
              onChange={(event) => set('price_to', event.target.value)}
              className="w-32 bg-ink"
            />
          </Field>
        </div>
        <p className="-mt-2 text-xs text-mist">{t('priceHint')}</p>
      </Section>

      <Section title={t('sectionFields')}>
        <Field label={t('sectionFields')} hint={t('nichesHint')} error={errors.niches}>
          <ChipPicker
            label={t('sectionFields')}
            options={categories}
            selected={draft.niches}
            onChange={(next) => set('niches', next)}
            max={MAX_NICHES}
          />
        </Field>
      </Section>

      <Section title={t('sectionWhere')}>
        <Field label={t('teachingFormat')}>
          <Select
            items={formatOptions}
            value={format}
            onValueChange={(next) => {
              setFormat(String(next) as TeachingFormat)
              setSavedAt(null)
            }}
          >
            <SelectTrigger className="h-10 w-full bg-ink">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t('region')} hint={t('regionHint')}>
          <Select
            items={regionOptions}
            value={region}
            onValueChange={(next) => {
              setRegion(String(next))
              setSavedAt(null)
            }}
          >
            <SelectTrigger className="h-10 w-full bg-ink">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t('city')} htmlFor="city" hint={t('cityHint')}>
          <Input
            id="city"
            value={city}
            maxLength={80}
            placeholder="Talsi"
            onChange={(event) => {
              setCity(event.target.value)
              setSavedAt(null)
            }}
            className="bg-ink"
          />
        </Field>

        <div className="rounded-lg border border-hairline bg-ink px-4 py-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={forTourists}
              onChange={(event) => {
                setForTourists(event.target.checked)
                setSavedAt(null)
              }}
              className="size-4 accent-[var(--gold)]"
            />
            <span className="text-sm font-medium">{t('forTourists')}</span>
          </label>
        </div>
      </Section>

      <Section title={t('sectionBooking')}>
        <Field
          label={t('calendly')}
          htmlFor="calendly"
          hint={t('calendlyHint')}
          error={errors.calendly_url}
        >
          <Input
            id="calendly"
            type="url"
            inputMode="url"
            placeholder="https://calendly.com/tavs-vards/15min"
            value={draft.calendly_url}
            onChange={(event) => set('calendly_url', event.target.value)}
            className="bg-ink"
          />
        </Field>
      </Section>

      <Section title={t('sectionContacts')}>
        <ContactsSection
          contacts={contacts}
          onChange={(next) => {
            setContacts(next)
            setSavedAt(null)
          }}
          consent={consent}
          onConsent={(next) => {
            setConsent(next)
            setSavedAt(null)
          }}
          consentError={errors.consent_given}
        />
      </Section>

      <Section title={t('sectionCulture')}>
        <CultureEditor
          books={books}
          movies={movies}
          music={music}
          onBooks={(next) => {
            setBooks(next)
            setSavedAt(null)
          }}
          onMovies={(next) => {
            setMovies(next)
            setSavedAt(null)
          }}
          onMusic={(next) => {
            setMusic(next)
            setSavedAt(null)
          }}
        />
      </Section>

      <Section title={t('sectionPublish')}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(event) => set('is_published', event.target.checked)}
                className="size-4 accent-[var(--gold)]"
              />
              <span className="text-sm font-medium">{t('publishToggle')}</span>
            </label>
            <p className="mt-1.5 text-xs text-mist">{t('publishHint')}</p>
          </div>

          {errors.has_contact && (
            <p className="w-full text-xs text-coral">{errors.has_contact}</p>
          )}

          <Badge variant={draft.is_published ? 'default' : 'outline'}>
            {draft.is_published ? t('statusLive') : t('statusDraft')}
          </Badge>
        </div>
      </Section>

      {/* Saglabāšanas josla pielīp apakšā, lai garā formā nav jāritina */}
      <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center gap-3 border-t border-hairline bg-ink/90 px-6 py-4 backdrop-blur-lg">
        <Button
          type="button"
          className="h-11 gap-2 px-6"
          disabled={saving}
          onClick={save}
        >
          <Save className="size-4" />
          {saving ? t('saving') : t('save')}
        </Button>

        {coach.is_published && (
          <LinkButton
            href={`/profils/${coach.slug}`}
            variant="ghost"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 text-mist hover:text-cream"
          >
            {t('viewPublic')}
            <ExternalLink className="size-3.5" />
          </LinkButton>
        )}

        <span aria-live="polite" className="text-sm">
          {saveError && <span className="text-coral">{saveError}</span>}
          {!saveError && savedAt && <span className="text-gold">{t('saved')}</span>}
        </span>
      </div>
    </div>
  )
}
