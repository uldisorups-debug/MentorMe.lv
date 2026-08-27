import { ImageResponse } from 'next/og'
import { loadPost } from '@/lib/posts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MentorMe.lv raksts'

/**
 * Raksta OG bilde: virsraksts, autors, zīmols.
 *
 * Autora bildi šeit nevelkam — ImageResponse to ņemtu no Supabase
 * Storage katrai ģenerēšanai un koplietošanas priekšskatījums kļūtu lēns.
 */
export default async function BlogOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await loadPost(slug)

  const title = post?.title ?? 'MentorMe.lv'
  const author = post?.author?.full_name ?? null

  // Gari virsraksti jāsamazina, citādi tie izlien no kadra
  const fontSize = title.length > 70 ? 48 : title.length > 45 ? 58 : 68

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0F0E17',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 3, background: '#E8C547' }} />
          <div style={{ fontSize: 24, color: '#A7A9BE' }}>MentorMe.lv</div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize,
            color: '#FFFFFE',
            lineHeight: 1.2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {author && (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                background: 'linear-gradient(135deg, #E8C54744, #FF6B6B33)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#E8C547',
              }}
            >
              {author
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0] ?? '')
                .join('')
                .toUpperCase()}
            </div>
          )}
          <div style={{ fontSize: 28, color: '#A7A9BE' }}>
            {author ?? 'Raksti'}
          </div>
        </div>
      </div>
    ),
    size
  )
}
