import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PostEditor } from './post-editor'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Raksts',
  robots: { index: false },
}

export default async function EditPostPage({
  params,
}: PageProps<'/dashboard/raksti/[id]'>) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/dashboard/raksti/${id}`)

  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!coach) redirect('/dashboard/profile')

  // RLS jau neļauj svešu rakstu ielādēt, bet paļauties tikai uz to nedrīkst
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('author_id', coach.id)
    .maybeSingle()

  if (!post) notFound()

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PostEditor post={post} userId={user.id} />
    </div>
  )
}
