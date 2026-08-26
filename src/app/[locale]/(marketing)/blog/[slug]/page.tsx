import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowLeft, Eye } from 'lucide-react'
import { CoachAvatar } from '@/components/coach-avatar'
import { LinkButton } from '@/components/link-button'
import { PostViewTracker } from '@/components/post-view-tracker'
import { renderMarkdown, readingMinutes } from '@/lib/markdown'
import { listPostSlugs, loadPost } from '@/lib/posts'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await listPostSlugs()
  // Katrs slug reiz katrā valodā — citādi /en/... krīt uz dinamisko
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  )
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const post = await loadPost(slug)
  const t = await getTranslations('Blog')

  if (!post) return { title: t('notFound') }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published_at ?? undefined,
      authors: post.author ? [post.author.full_name] : undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

const dateFormatter = new Intl.DateTimeFormat('lv-LV', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export default async function PostPage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const post = await loadPost(slug)
  if (!post) notFound()

  const t = await getTranslations('Blog')
  const html = renderMarkdown(post.content)
  const minutes = readingMinutes(post.content)

  // Strukturētie dati — bez tiem Google neredz, ka šis ir raksts ar autoru
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at ?? undefined,
    author: post.author
      ? { '@type': 'Person', name: post.author.full_name }
      : undefined,
    image: post.cover_image_url ?? undefined,
  }

  return (
    <>
      <PostViewTracker slug={post.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-2xl px-6 py-16">
        <LinkButton
          href="/blog"
          variant="ghost"
          size="sm"
          className="-ml-2 mb-8 gap-1.5 text-mist hover:text-cream"
        >
          <ArrowLeft className="size-3.5" />
          {t('backToBlog')}
        </LinkButton>

        <h1 className="font-display text-3xl leading-tight text-balance sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline pb-6 text-sm text-mist">
          {post.author && (
            <a
              href={`/profils/${post.author.slug}`}
              className="flex items-center gap-2 transition-colors hover:text-cream"
            >
              <CoachAvatar
                name={post.author.full_name}
                url={post.author.avatar_url}
                px={32}
                className="rounded-full"
              />
              <span className="text-cream">{post.author.full_name}</span>
            </a>
          )}
          {post.published_at && (
            <time dateTime={post.published_at}>
              {dateFormatter.format(new Date(post.published_at))}
            </time>
          )}
          <span>{t('readingTime', { minutes })}</span>
          {post.view_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {t('views', { count: post.view_count })}
            </span>
          )}
        </div>

        {post.cover_image_url && (
          <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-2xl border border-hairline bg-surface">
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 42rem"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/*
          Saturs nāk no lietotāja, tāpēc tas ir izgājis cauri DOMPurify
          renderMarkdown() iekšienē. Neapstrādātu HTML te likt nedrīkst.
        */}
        <div
          className="post-body mt-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.author && (
          <div className="mt-14 flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-surface p-6">
            <CoachAvatar
              name={post.author.full_name}
              url={post.author.avatar_url}
              px={56}
              className="rounded-full"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-mist">{t('by')}</p>
              <p className="font-display text-lg">{post.author.full_name}</p>
            </div>
            <LinkButton
              href={`/profils/${post.author.slug}`}
              variant="outline"
              className="h-10"
            >
              {t('authorProfile')}
            </LinkButton>
          </div>
        )}
      </article>
    </>
  )
}
