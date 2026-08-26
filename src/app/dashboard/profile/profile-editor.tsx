'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ExternalLink, Save } from 'lucide-react'
import { AvatarUpload } from '@/components/dashboard/avatar-upload'
import { CertificateUpload } from '@/components/dashboard/certificate-upload'
import { ChipPicker } from '@/components/dashboard/chip-picker'
import { CultureEditor } from '@/components/dashboard/culture-editor'
import { Field, Section } from '@/components/dashboard/field'
import { GalleryUpload } from '@/components/dashboard/gallery-upload'
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
import type {
  BookEntry,
  CertLevel,
  CoachProfile,
  MovieEntry,
  MusicEntry,
  PriceTier,
} from '@/types/database'

const LANGUAGE_OPTIONS = [
  { value: 'lv', label: 'Latviešu' },
  { value: 'en', label: 'Angļu' },
  { value: 'ru', label: 'Krievu' },
]

const MAX_NICHES = 4

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

export function ProfileEditor({
  userId,
  coach,
  categories,
}: {
  userId: string
  coach: CoachProfile
  categories: { value: string; label: string }[]
}) {
  const t = useTranslations('Editor')
  const router = useRouter()

  // Teksta lauki dzīvo kā virknes — tā tukšs lauks paliek tukšs,
  // nevis pārvēršas par 0.
  const [draft, setDraft] = useState<ProfileDraft>({
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
  })

  const [certification, setCertification] = useState<CertLevel>(
    coach.certification ?? 'none'
  )
  const [certOtherLabel, setCertOtherLabel] = useState(coach.cert_other_label ?? '')
  const [certProof, setCertProof] = useState<string | null>(coach.cert_proof_url)
  const [priceTier, setPriceTier] = useState<PriceTier>(coach.price_tier)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(coach.avatar_url)
  const [gallery, setGallery] = useState<string[]>(coach.gallery_urls)
  const [books, setBooks] = useState<BookEntry[]>(coach.books_top)
  const [movies, setMovies] = useState<MovieEntry[]>(coach.movies_top)
  const [music, setMusic] = useState<MusicEntry[]>(coach.music_top)

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
    const found = validateProfile(draft)
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
        full_name: draft.full_name.trim(),
        tagline: draft.tagline.trim() || null,
        bio: draft.bio.trim() || null,
        avatar_url: avatarUrl,
        certification,
        cert_other_label:
          certification === 'other' ? certOtherLabel.trim() || null : null,
        cert_proof_url: certProof,
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
        calendly_url: draft.calendly_url.trim() || null,
        books_top: cleanBooks,
        movies_top: cleanMovies,
        music_top: cleanMusic,
        gallery_urls: gallery,
        is_published: draft.is_published,
      })
      .eq('user_id', userId)

    setSaving(false)

    if (error) {
      console.error('Profila saglabāšana neizdevās:', error.message)
      setSaveError(t('saveError'))
      return
    }

    setBooks(cleanBooks)
    setMovies(cleanMovies)
    setMusic(cleanMusic)
    setSavedAt(Date.now())
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

        <CertificateUpload
          userId={userId}
          value={certProof}
          isVerified={coach.is_verified}
          onChange={(path) => {
            setCertProof(path)
            setSavedAt(null)
          }}
        />

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

      <Section title={t('sectionGallery')}>
        <GalleryUpload
          userId={userId}
          urls={gallery}
          onChange={(next) => {
            setGallery(next)
            setSavedAt(null)
          }}
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
            href={`/coach/${coach.slug}`}
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
