import { SiteShell } from '@/components/site-shell'

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SiteShell>{children}</SiteShell>
}
