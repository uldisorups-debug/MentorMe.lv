import './globals.css'

/**
 * Saknes izkārtojums ir apzināti tukšs.
 *
 * Valoda un teksti dzīvo [locale]/layout.tsx, jo tikai tur zināms,
 * kurā valodā lapa tiek rādīta. Šeit paliek tikai globālie stili.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
