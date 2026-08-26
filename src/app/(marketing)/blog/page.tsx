import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { CoachAvatar } from '@/components/coach-avatar'
import { LinkButton } from '@/components/link-button'
import { listPublishedPosts } from '@/lib/posts'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Blog')
  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: { canonical: '/blog' },
  }
}

const dateFormatter = new Intl.DateTimeFormat('lv-LV', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export default async function BlogPage() {
  const t = await getTranslations('Blog')
  const posts = await listPublishedPosts()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="rule-gold font-display text-4xl sm:text-5xl">
        {t('title')}
      </h1>
      <p className="mt-5 max-w-xl text-mist">{t('lead')}</p>

      {posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-hairline px-6 py-16 text-center">
          <p className="text-mist">{t('empty')}</p>
          <LinkButton
            href="/dashboard/raksti"
            variant="outline"
            className="mt-6 h-10"
          >
            {t('writeOwn')}
          </LinkButton>
        </div>
      ) : (
        <ul className="mt-12 flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="group relative flex gap-5 rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-gold/40">
                {post.cover_image_url && (
                  <div className="relative hidden h-28 w-40 shrink-0 overflow-hidden rounded-xl bg-ink sm:block">
                    <Image
                      src={post.cover_image_url}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">
                    {post.excerpt}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-mist">
                    {post.author && (
                      <span className="flex items-center gap-2">
                        <CoachAvatar
                          name={post.author.full_name}
                          url={post.author.avatar_url}
                          px={24}
                          className="rounded-full"
                        />
                        <span className="text-cream">
                          {post.author.full_name}
                        </span>
                      </span>
                    )}
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {dateFormatter.format(new Date(post.published_at))}
                      </time>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
