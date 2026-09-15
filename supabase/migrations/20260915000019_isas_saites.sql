-- =============================================================
-- Īsās profila adreses: mentorme.lv/uldis-orups
--
-- Profils pārcēlās no /profils/uldis-orups uz /uldis-orups. Tagad
-- meistara adrese dzīvo tajā pašā līmenī, kur lapas pašas ceļi, un
-- viens vārds var aizēnot otru.
--
-- Next.js strīdu vienmēr izšķir par labu savam ceļam: ja kāda profila
-- adrese sanāktu "blog", lapa /blog atvērtu rakstu sarakstu, un tas
-- profils īsajā adresē nebūtu sasniedzams nekad. Kļūda būtu klusa —
-- neviens neko nemestu, vienkārši atvērtos nepareizā lapa.
--
-- Tāpēc saraksts ar vārdiem, ko par adresi paņemt nevar.
-- =============================================================


create or replace function public.slug_is_reserved(candidate text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(coalesce(candidate, '')) = any (array[
    -- Valodas
    'lv', 'en', 'ru',

    -- Lapas ceļi, arī vecie, kas vēl tiek pāradresēti
    'profils', 'coach', 'blog', 'admin', 'auth', 'dashboard',
    'kontakti', 'privatums', 'sikdatnes', 'lietosanas-noteikumi',
    'ka-tas-darbojas', 'par-mums', 'api',

    -- Faili un metadati lapas saknē
    'robots', 'robots-txt', 'sitemap', 'sitemap-xml',
    'favicon', 'favicon-ico', 'icon', 'apple-icon',
    'opengraph-image', 'manifest', 'next', '_next',

    /*
     * Šo vēl nav, bet kādreiz var būt. Jaunu lapu pieliek vienā rindā;
     * ja tobrīd kādam meistaram jau ir tāda adrese, viņa profils klusi
     * pazūd no īsās saites. Lētāk tos vārdus aizņemt tagad.
     */
    'cenas', 'meklet', 'kursi', 'mentori', 'kouci', 'meistari',
    'pieteikties', 'registreties', 'iestatijumi', 'par'
  ]);
$$;

revoke execute on function public.slug_is_reserved(text) from public;
grant  execute on function public.slug_is_reserved(text) to anon, authenticated;


create or replace function public.set_coach_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  base_slug  text;
  final_slug text;
  n int := 0;
begin
  /*
   * Adrese, ko cilvēks ierakstījis pats, klusi jāmaina nedrīkst — viņš
   * to redz laukā tieši tādu, kādu uzrakstīja. Tāpēc kļūda, nevis
   * labojums.
   *
   * 23505 ar nolūku: redaktors šo kodu jau prot un parāda "šī adrese
   * jau ir aizņemta". Tā arī ir taisnība — to aizņēmusi pati lapa.
   */
  if new.slug is not null and new.slug <> '' then
    if public.slug_is_reserved(new.slug) then
      raise exception using
        errcode = '23505',
        message = format('Adrese "%s" ir rezervēta lapas vajadzībām', new.slug);
    end if;
    return new;
  end if;

  -- Adrese, ko taisām mēs paši no vārda: te klusi pieliekam ciparu,
  -- gluži tāpat kā tad, ja tāda jau ir aizņemta.
  base_slug  := coalesce(public.slugify(new.full_name), 'koucs');
  final_slug := base_slug;

  while public.slug_is_reserved(final_slug)
     or exists (
          select 1 from public.coach_profiles
           where slug = final_slug and id is distinct from new.id
        )
  loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$;
