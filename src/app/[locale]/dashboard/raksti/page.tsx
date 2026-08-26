import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { localePath } from '@/i18n/routing'
import { getLocale, getTranslations } from 'next-intl/server'
import { NewPostButton } from './new-post-button'
import { LinkButton } from '@/components/link-button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Mani raksti',
  robots: { index: false },
}

const dateFormatter = new Intl.DateTimeFormat('lv-LV', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export default async function MyPostsPage() {
  const locale = await getLocale()
  const t = await getTranslations('PostEditor')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(localePath(locale, '/auth/login?next=/dashboard/raksti'))

  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Rakstīt var tikai tas, kam ir profils — raksts vienmēr ir kāda vārdā
  if (!coach) redirect(localePath(locale, '/dashboard/profile'))

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, status, published_at, view_count, updated_at')
    .eq('author_id', coach.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">{t('listTitle')}</h1>
      <p className="mt-2 text-mist">{t('listLead')}</p>

      <div className="mt-8">
        <NewPostButton coachId={coach.id} />
      </div>

      {!posts || posts.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-hairline px-6 py-12 text-center text-sm text-mist">
          {t('empty')}
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{post.title}</p>
                <p className="mt-1 text-xs text-mist">
                  {dateFormatter.format(new Date(post.updated_at))}
                  {post.view_count > 0 && ` · ${post.view_count}`}
                </p>
              </div>

              <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                {post.status === 'published' ? t('statusPublished') : t('statusDraft')}
              </Badge>

              <LinkButton href={`/dashboard/raksti/${post.id}`} variant="outline" className="h-9">
                {t('edit')}
              </LinkButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
