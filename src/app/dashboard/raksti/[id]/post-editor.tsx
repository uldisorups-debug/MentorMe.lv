'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Eye, Pencil, Save, Trash2 } from 'lucide-react'
import { AvatarUpload } from '@/components/dashboard/avatar-upload'
import { Field, Section } from '@/components/dashboard/field'
import { LinkButton } from '@/components/link-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { renderMarkdown, readingMinutes } from '@/lib/markdown'
import {
  hasPostErrors,
  validatePost,
  type PostDraft,
  type PostErrors,
} from '@/lib/post-validation'
import { cn } from '@/lib/utils'
import type { Post } from '@/types/database'

export function PostEditor({ post, userId }: { post: Post; userId: string }) {
  const t = useTranslations('PostEditor')
  const router = useRouter()

  const [draft, setDraft] = useState<PostDraft>({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    content: post.content,
  })
  const [cover, setCover] = useState<string | null>(post.cover_image_url)
  const [published, setPublished] = useState(post.status === 'published')
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  const [errors, setErrors] = useState<PostErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const set = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setSavedAt(null)
  }

  // Priekšskatījums iet caur to pašu sanitizāciju, kas publiskā lapa —
  // citādi autors redzētu vienu, lasītājs citu
  const previewHtml = useMemo(
    () => (tab === 'preview' ? renderMarkdown(draft.content) : ''),
    [tab, draft.content]
  )

  async function save(nextPublished = published) {
    const found = validatePost(draft)
    setErrors(found)
    if (hasPostErrors(found)) return

    setSaving(true)
    setSaveError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .update({
        title: draft.title.trim(),
        slug: draft.slug.trim(),
        excerpt: draft.excerpt.trim() || null,
        content: draft.content,
        cover_image_url: cover,
        status: nextPublished ? 'published' : 'draft',
      })
      .eq('id', post.id)

    setSaving(false)

    if (error) {
      console.error('Raksta saglabāšana neizdevās:', error.message)
      if (error.code === '23505') setErrors({ slug: t('slugTaken') })
      else setSaveError(t('saveError'))
      return
    }

    setPublished(nextPublished)
    setSavedAt(Date.now())
    router.refresh()
  }

  async function remove() {
    if (!window.confirm(t('deleteConfirm'))) return
    setSaving(true)
    const { error } = await createClient().from('posts').delete().eq('id', post.id)
    if (error) {
      console.error('Raksta dzēšana neizdevās:', error.message)
      setSaveError(t('saveError'))
      setSaving(false)
      return
    }
    router.push('/dashboard/raksti')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LinkButton
          href="/dashboard/raksti"
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5 text-mist hover:text-cream"
        >
          <ArrowLeft className="size-3.5" />
          {t('backToList')}
        </LinkButton>

        <Badge variant={published ? 'default' : 'outline'}>
          {published ? t('statusPublished') : t('statusDraft')}
        </Badge>
      </div>

      <Section title={t('title')}>
        <Field label={t('title')} htmlFor="post-title" hint={t('titleHint')} error={errors.title}>
          <Input
            id="post-title"
            value={draft.title}
            maxLength={140}
            onChange={(event) => set('title', event.target.value)}
            className="bg-ink"
          />
        </Field>

        <Field label={t('slug')} htmlFor="post-slug" hint={t('slugHint')} error={errors.slug}>
          <div className="flex items-center gap-1 rounded-lg border border-input bg-ink px-3">
            <span className="shrink-0 text-sm text-mist">mentorme.lv/blog/</span>
            <Input
              id="post-slug"
              value={draft.slug}
              onChange={(event) =>
                set('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'))
              }
              className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0"
            />
          </div>
        </Field>

        <Field
          label={t('excerpt')}
          htmlFor="post-excerpt"
          hint={t('excerptHint')}
          error={errors.excerpt}
        >
          <Textarea
            id="post-excerpt"
            rows={2}
            value={draft.excerpt}
            maxLength={300}
            onChange={(event) => set('excerpt', event.target.value)}
            className="bg-ink"
          />
        </Field>

        <Field label={t('cover')} hint={t('coverHint')}>
          <AvatarUpload
            userId={userId}
            value={cover}
            fallback="🖼"
            onChange={(url) => {
              setCover(url)
              setSavedAt(null)
            }}
          />
        </Field>
      </Section>

      <Section title={t('content')}>
        <div className="flex gap-1 rounded-lg border border-hairline bg-ink p-1">
          {(['write', 'preview'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTab(mode)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm transition-colors',
                tab === mode ? 'bg-surface text-cream' : 'text-mist hover:text-cream'
              )}
            >
              {mode === 'write' ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}
              {mode === 'write' ? t('write') : t('preview')}
            </button>
          ))}
        </div>

        {tab === 'write' ? (
          <Field label={t('content')} htmlFor="post-content" hint={t('contentHint')} error={errors.content}>
            <Textarea
              id="post-content"
              rows={20}
              value={draft.content}
              onChange={(event) => set('content', event.target.value)}
              className="bg-ink font-mono text-sm"
            />
          </Field>
        ) : (
          <div className="rounded-lg border border-hairline bg-ink p-5">
            <div className="post-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        )}

        <p className="text-xs text-mist">
          {readingMinutes(draft.content)} min · {draft.content.trim().split(/\s+/).filter(Boolean).length} vārdi
        </p>
      </Section>

      <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center gap-3 border-t border-hairline bg-ink/90 px-6 py-4 backdrop-blur-lg">
        <Button className="h-11 gap-2 px-5" disabled={saving} onClick={() => save()}>
          <Save className="size-4" />
          {saving ? t('saving') : t('save')}
        </Button>

        <Button
          variant={published ? 'outline' : 'secondary'}
          className="h-11"
          disabled={saving}
          onClick={() => save(!published)}
        >
          {published ? t('unpublish') : t('publish')}
        </Button>

        {published && (
          <LinkButton
            href={`/blog/${post.slug}`}
            variant="ghost"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 text-mist hover:text-cream"
          >
            {t('view')}
          </LinkButton>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('deletePost')}
          className="ml-auto text-mist hover:text-coral"
          disabled={saving}
          onClick={remove}
        >
          <Trash2 className="size-4" />
        </Button>

        <span aria-live="polite" className="w-full text-sm sm:w-auto">
          {saveError && <span className="text-coral">{saveError}</span>}
          {!saveError && savedAt && <span className="text-gold">{t('saved')}</span>}
        </span>
      </div>
    </div>
  )
}
