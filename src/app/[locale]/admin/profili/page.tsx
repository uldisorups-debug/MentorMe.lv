import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { AdminRow, EmptyState } from '@/components/admin/admin-row'
import { ProfileActions } from '@/components/admin/moderation-actions'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Profili', robots: { index: false } }

export default async function AdminProfilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: coaches }, me] = await Promise.all([
    supabase
      .from('coach_profiles')
      .select('id, slug, full_name, tagline, is_published, is_verified, cert_proof_url, certification, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('display_name').eq('id', user!.id).maybeSingle(),
  ])

  const admin = { adminId: user!.id, adminName: me.data?.display_name ?? null }
  const waiting = (coaches ?? []).filter((c) => c.cert_proof_url && !c.is_verified)

  /*
   * Bucket ir privāts, tāpēc failam vajag parakstītu saiti. Līdz šim
   * panelī bija tikai ceļš kā teksts un norāde iet uz Supabase — proti,
   * sertifikātu no lapas pārbaudīt nevarēja vispār.
   *
   * Piecas minūtes: pietiekami, lai atvērtu, par īsu, lai saite kaut kur
   * paliktu karājoties.
   */
  const certLinks = new Map<string, string>()
  await Promise.all(
    waiting.map(async (c) => {
      const { data, error } = await supabase.storage
        .from('certificates')
        .createSignedUrl(c.cert_proof_url!, 300)
      if (error) {
        console.error(`Sertifikāta saite ${c.slug}:`, error.message)
        return
      }
      if (data) certLinks.set(c.id, data.signedUrl)
    })
  )

  return (
    <div className="flex flex-col gap-8">
      {waiting.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Gaida sertifikāta pārbaudi</h2>
          <p className="mt-1 text-sm text-mist">
            Sertifikāts publiskajā profilā neparādās. Saite der piecas minūtes.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {waiting.map((c) => (
              <AdminRow
                key={c.id}
                danger
                title={c.full_name}
                subtitle={
                  <>
                    Norādīts: {c.certification ?? 'nav'} ·{' '}
                    {certLinks.has(c.id) ? (
                      <a
                        href={certLinks.get(c.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline"
                      >
                        Atvērt sertifikātu
                      </a>
                    ) : (
                      <span className="text-mist">
                        failu neizdevās atvērt — skaties Supabase Storage
                      </span>
                    )}
                  </>
                }
                actions={
                  <ProfileActions
                    id={c.id}
                    label={c.full_name}
                    isVerified={c.is_verified}
                    isPublished={c.is_published}
                    admin={admin}
                  />
                }
              />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl">Visi profili</h2>
        {!coaches || coaches.length === 0 ? (
          <div className="mt-4"><EmptyState>Nav neviena profila.</EmptyState></div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {coaches.map((c) => (
              <AdminRow
                key={c.id}
                title={c.full_name}
                subtitle={<>/profils/{c.slug}{c.tagline && ` · ${c.tagline}`}</>}
                badges={
                  <>
                    {c.is_verified && <Badge>Verificēts</Badge>}
                    <Badge variant="outline" className="text-mist">
                      {c.is_published ? 'Publicēts' : 'Melnraksts'}
                    </Badge>
                  </>
                }
                actions={
                  <ProfileActions
                    id={c.id}
                    label={c.full_name}
                    isVerified={c.is_verified}
                    isPublished={c.is_published}
                    admin={admin}
                  />
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
