import { ImageResponse } from 'next/og'
import { certLabel } from '@/lib/coaches'
import { loadCoachPage } from '@/lib/coach-profile'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MentorMe.lv kouča profils'

/**
 * Katram koučam sava OG bilde: iniciāļi, vārds, tagline, sertifikāts.
 *
 * Avatāra bildi šeit neliekam — ImageResponse to vilktu no Supabase
 * Storage katrai ģenerēšanai, un tas palēninātu koplietošanas priekšskatījumu.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await loadCoachPage(slug)

  const name = page?.coach.full_name ?? 'MentorMe.lv'
  const tagline = page?.coach.tagline ?? 'Kouči un mentori Latvijā'
  const cert = page ? certLabel(page.coach.certification) : null

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 32,
              background: 'linear-gradient(135deg, #E8C54744, #FF6B6B33)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              color: '#E8C547',
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 64, color: '#FFFFFE' }}>{name}</div>
            {cert && (
              <div style={{ fontSize: 28, color: '#E8C547' }}>{cert}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 36, color: '#A7A9BE', lineHeight: 1.35 }}>
            {tagline}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 3, background: '#E8C547' }} />
            <div style={{ fontSize: 26, color: '#FFFFFE' }}>MentorMe.lv</div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
