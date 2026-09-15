import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MentorMe.lv — atrodi to, kas zina'

/**
 * Koplietošanas bilde visai lapai.
 *
 * Bez šīs sākumlapai og:image nebija vispār, un Facebook ar Instagram
 * tādā gadījumā noskenē lapu un paņem pirmo lielo bildi, ko atrod —
 * proti, kāda meistara avatāru. Ielūgums pievienoties MentorMe.lv
 * atnāca ar svešas sievietes seju.
 *
 * Šis fails guļ [locale] saknē, tāpēc tas kļūst par noklusējumu visām
 * lapām zem tās. Profiliem un rakstiem ir savas bildes, un tās paliek.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0F0E17',
          padding: 96,
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 108, letterSpacing: -2 }}>
          <span style={{ color: '#FFFFFE' }}>Mentor</span>
          <span style={{ color: '#E8C547' }}>Me</span>
          <span style={{ color: '#A7A9BE' }}>.lv</span>
        </div>

        <div
          style={{
            width: 96,
            height: 4,
            background: '#E8C547',
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        <div
          style={{
            display: 'flex',
            fontSize: 42,
            color: '#A7A9BE',
            lineHeight: 1.35,
            maxWidth: 820,
            fontFamily: 'sans-serif',
          }}
        >
          Kokle, matemātika, zapte vai bizness — kāds Latvijā to prot un ir
          gatavs tev to iemācīt.
        </div>
      </div>
    ),
    size
  )
}
