-- =============================================================
-- Audita labojumi
--
-- Kopīgais cēlonis gandrīz visiem: noteikums pastāvēja, bet tikai
-- vienā vietā — vai nu tikai INSERT politikā, vai tikai React kodā.
-- Kas runā ar Supabase tieši, tam noteikuma nebija.
-- =============================================================


-- =============================================================
-- 1. ATSAUKSMES: KO AUTORS DRĪKST MAINĪT           (atradumi 01, 02)
--
-- Aizliegums rakstīt atsauksmi pašam sev bija tikai INSERT politikā.
-- Labošanas politika prasīja vienīgi, lai autors paliek tas pats —
-- par coach_id tā neteica neko. Tātad: uzraksti atsauksmi kādam
-- citam, tad pārcel to uz savu profilu un esi pats sev iedevis
-- piecas zvaigznes.
--
-- Tā pati politika neierobežoja is_visible, tāpēc administratora
-- paslēptu atsauksmi autors varēja ieslēgt atpakaļ.
--
-- RLS with check nevar redzēt veco rindu, tāpēc kolonnas sargā
-- trigeris, tāpat kā is_verified un is_admin.
-- =============================================================

create or replace function public.protect_review_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is null
     or auth.role() = 'service_role'
     or public.is_admin() then
    return new;
  end if;

  -- Autors drīkst mainīt vērtējumu, tekstu un anonimitāti. Neko citu.
  new.coach_id   := old.coach_id;
  new.client_id  := old.client_id;
  new.is_visible := old.is_visible;
  new.created_at := old.created_at;

  return new;
end;
$$;

drop trigger if exists reviews_protect_columns on public.reviews;
create trigger reviews_protect_columns
  before update on public.reviews
  for each row execute function public.protect_review_columns();


-- =============================================================
-- 2. ANONIMITĀTE DATUBĀZĒ, NE KODĀ                    (atradums 03)
--
-- reviews bija publiski lasāmas, profiles arī. Tāpēc jebkurš varēja
-- pieprasīt reviews?select=client_id,profiles(display_name) un iegūt
-- katra "anonīmā" autora vārdu. To, ka mēs vārdu izmetam Reactā,
-- datubāze neredz.
--
-- Tagad publiskā puse lasa skatu, kurā client_id vispār nav, un
-- vārds ir null jau pašā vaicājumā.
-- =============================================================

create or replace view public.reviews_public
with (security_invoker = off) as
  select
    r.id,
    r.coach_id,
    r.rating,
    r.body,
    r.created_at,
    case when r.is_anonymous then null else p.display_name end as author_name
  from public.reviews r
  left join public.profiles p on p.id = r.client_id
  where r.is_visible;

grant select on public.reviews_public to anon, authenticated;

-- Pamattabulu publiski vairs nelasa neviens
drop policy if exists "Public can read visible reviews" on public.reviews;

-- Bet savu atsauksmi autoram jāredz — bez tā forma nezina,
-- vai viņš šim koučam jau ir rakstījis
create policy "Klients redz savu atsauksmi" on public.reviews
  for select using (auth.uid() = client_id);

-- Reitingu skats agregē visas redzamās atsauksmes, tāpēc tam vairs
-- nedrīkst būt atkarīgs no izsaucēja tiesībām. Ārā tiek tikai vidējais
-- un skaits — neviena atsevišķa atsauksme.
create or replace view public.coach_ratings
with (security_invoker = off) as
  select
    coach_id,
    round(avg(rating)::numeric, 2) as avg_rating,
    count(*)::int                  as review_count
  from public.reviews
  where is_visible
  group by coach_id;

grant select on public.coach_ratings to anon, authenticated;


-- =============================================================
-- 3. PROFILI VAIRS NAV PUBLISKI                       (atradums 04)
--
-- "Anyone can read profiles" atdeva arī is_admin. Uzbrucējam nebija
-- jāmin, kuru kontu mērķēt — anonīms pieprasījums to pateica.
--
-- Publiskais iemesls, kāpēc politika vispār bija, bija atsauksmju
-- autoru vārdi. To tagad dara reviews_public skats.
-- =============================================================

drop policy if exists "Anyone can read profiles" on public.profiles;

create policy "Lietotājs redz savu profilu" on public.profiles
  for select using (auth.uid() = id);

create policy "Administrators redz profilus" on public.profiles
  for select using (public.is_admin());


-- =============================================================
-- 4. KONTAKTI: PIEKRIŠANA UN PUBLICĒTS PROFILS        (atradums 05)
--
-- Politika bija using (true) — bez consent_at, bez is_published.
-- Piekrišanu ievēroja tikai contact-dialog.tsx, tāpēc viens bezmaksas
-- konts un viens pieprasījums atdeva visu kontaktu bāzi, arī no
-- melnrakstiem un no tiem, kas piekrišanu nav devuši.
-- =============================================================

drop policy if exists "Kontaktus redz tikai ielogotie" on public.coach_contacts;

create policy "Kontaktus redz ielogotie, ja koučs piekritis"
  on public.coach_contacts
  for select to authenticated
  using (
    consent_at is not null
    and exists (
      select 1 from public.coach_profiles c
      where c.id = coach_id and c.is_published
    )
  );

-- Koučs savus kontaktus redz vienmēr, arī pirms piekrišanas —
-- to jau nodrošina esošā "Koučs pārvalda savus kontaktus" politika


-- =============================================================
-- 5. RAKSTI: ADMINISTRATORA LĒMUMS IR GALĪGS          (atradums 02)
--
-- "Autors pārvalda savus rakstus" ir for all, tāpēc administratora
-- status = 'draft' autors atgrieza uz 'published'. Vajag atšķirt,
-- kurš rakstu noņēma — pats autors vai administrators.
-- =============================================================

alter table public.posts
  add column if not exists hidden_by_admin boolean not null default false;

create or replace function public.protect_post_moderation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is null
     or auth.role() = 'service_role'
     or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.hidden_by_admin := false;
    return new;
  end if;

  -- Karogu autors mainīt nevar
  new.hidden_by_admin := old.hidden_by_admin;

  if old.hidden_by_admin and new.status = 'published' then
    raise exception 'Šo rakstu noņēmis administrators. Raksti mums, ja tas ir kļūda.'
      using errcode = 'P0003';
  end if;

  return new;
end;
$$;

drop trigger if exists posts_protect_moderation on public.posts;
create trigger posts_protect_moderation
  before insert or update on public.posts
  for each row execute function public.protect_post_moderation();


-- =============================================================
-- 6. VIENA RAKSTA DIENĀ LIMITU VAIRS NEAPIET          (atradums 15)
--
-- published_at tika uzlikts tikai tad, ja tas bija tukšs. Tāpēc vecu
-- rakstu varēja pārslēgt uz melnrakstu un publicēt vēlreiz: limits to
-- neieskaitīja šodienā, un blogā tas palika vecajā vietā.
--
-- Tagad datums tiek uzlikts katrā pārejā no melnraksta uz publicētu.
-- Vienkārša publicēta raksta labošana to neaiztiek.
-- =============================================================

create or replace function public.stamp_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;


-- =============================================================
-- 7. GARUMA UN SKAITA ROBEŽAS                         (atradums 07)
--
-- Līdz šim tās dzīvoja tikai profile-validation.ts un uploads.ts.
-- Priekšpusi var apiet; datubāzi nevar. Skaitļi sakrīt ar tiem, kas
-- jau ir kodā, lai lietotājs nekad neredzētu divus dažādus atteikumus.
-- =============================================================

alter table public.coach_profiles
  add constraint coach_full_name_len
    check (char_length(full_name) between 2 and 80),
  add constraint coach_tagline_len
    check (tagline is null or char_length(tagline) <= 120),
  add constraint coach_bio_len
    check (bio is null or char_length(bio) <= 4000),
  add constraint coach_city_len
    check (city is null or char_length(city) <= 80),
  add constraint coach_gallery_max
    check (cardinality(gallery_urls) <= 3),
  add constraint coach_niches_max
    check (cardinality(niches) <= 12),
  add constraint coach_languages_max
    check (cardinality(session_languages) between 1 and 10);

alter table public.posts
  add constraint post_content_len check (char_length(content) <= 40000);

alter table public.reviews
  add constraint review_body_len
    check (body is null or char_length(body) <= 1500);

alter table public.profiles
  add constraint display_name_len
    check (display_name is null or char_length(display_name) <= 80);


-- =============================================================
-- 8. NIŠAS SASAISTĒ AR KATEGORIJĀM                    (atradums 08)
--
-- region_slug ir īsta svešatslēga. niches bija vienkāršs teksta
-- masīvs — izdzēšot kategoriju, profilos palika slug'i, kas nekur
-- nenorāda, un profils klusi pazuda no nozares.
--
-- Postgres masīva elementam svešatslēgu uzlikt nevar, tāpēc trigeris.
-- =============================================================

create or replace function public.validate_niches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  unknown_slug text;
begin
  select n into unknown_slug
    from unnest(new.niches) as n
   where not exists (select 1 from public.categories c where c.slug = n)
   limit 1;

  if unknown_slug is not null then
    raise exception 'Nezināma tēma: %', unknown_slug using errcode = 'P0004';
  end if;

  return new;
end;
$$;

drop trigger if exists coach_profiles_validate_niches on public.coach_profiles;
create trigger coach_profiles_validate_niches
  before insert or update of niches on public.coach_profiles
  for each row execute function public.validate_niches();

-- Otrs virziens: kategoriju, kas kādam pieder, izdzēst nevar
create or replace function public.block_used_category_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  users int;
begin
  select count(*) into users
    from public.coach_profiles c
   where old.slug = any (c.niches);

  if users > 0 then
    raise exception 'Šo tēmu lieto % profils(-i). Vispirms nomaini tos.', users
      using errcode = 'P0005';
  end if;

  return old;
end;
$$;

drop trigger if exists categories_block_used_delete on public.categories;
create trigger categories_block_used_delete
  before delete on public.categories
  for each row execute function public.block_used_category_delete();


-- =============================================================
-- 9. SKATĪJUMI: NEZINĀMU APMEKLĒTĀJU NESKAITĀM        (atradums 16)
--
-- Ja x-forwarded-for nebija, visi kļuva par 'nezinams' un dienā
-- ieskaitījās viens skatījums kopā — skaitlis, kas nenozīmē neko.
-- Labāk neskaitīt nemaz nekā skaitīt nepareizi.
--
-- Pa ceļam: rakstu funkcijai pietrūka žurnāla tīrīšanas, lai gan abas
-- raksta vienā tabulā (atradums 20).
-- =============================================================

create or replace function public.visitor_fingerprint(target_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers json;
  visitor text;
begin
  headers := nullif(current_setting('request.headers', true), '')::json;
  if headers is null then
    return null;
  end if;

  -- Aiz Vercel un Cloudflare īstā adrese ir pirmā x-forwarded-for vērtība
  visitor := coalesce(
    nullif(split_part(headers ->> 'x-forwarded-for', ',', 1), ''),
    nullif(headers ->> 'x-real-ip', ''),
    nullif(headers ->> 'cf-connecting-ip', '')
  );

  if visitor is null then
    return null;
  end if;

  -- Datums jaucējkodā nozīmē, ka rīt tas pats cilvēks skaitās vēlreiz.
  -- IP netiek glabāts nekur — tikai šis neatgriezeniskais kods.
  return encode(
    extensions.digest(visitor || target_id::text || current_date::text, 'sha256'),
    'hex'
  );
end;
$$;

create or replace function public.increment_profile_views(coach_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
  finger text;
begin
  select c.id into target
    from public.coach_profiles c
   where c.slug = coach_slug and c.is_published;

  if target is null then
    return;
  end if;

  finger := public.visitor_fingerprint(target);
  if finger is null then
    return;
  end if;

  insert into public.profile_view_log (fingerprint)
  values (finger)
  on conflict (fingerprint) do nothing;

  if found then
    update public.coach_profiles
       set profile_views = profile_views + 1
     where id = target;
  end if;

  if random() < 0.01 then
    delete from public.profile_view_log where viewed_on < current_date - 2;
  end if;
end;
$$;

create or replace function public.increment_post_views(post_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
  finger text;
begin
  select p.id into target
    from public.posts p
   where p.slug = post_slug and p.status = 'published';

  if target is null then
    return;
  end if;

  finger := public.visitor_fingerprint(target);
  if finger is null then
    return;
  end if;

  insert into public.profile_view_log (fingerprint)
  values (finger)
  on conflict (fingerprint) do nothing;

  if found then
    update public.posts set view_count = view_count + 1 where id = target;
  end if;

  -- Tā pati tīrīšana, kas profiliem — abas funkcijas raksta vienā tabulā
  if random() < 0.01 then
    delete from public.profile_view_log where viewed_on < current_date - 2;
  end if;
end;
$$;

grant execute on function public.increment_profile_views(text) to anon, authenticated;
grant execute on function public.increment_post_views(text)    to anon, authenticated;


-- =============================================================
-- 10. FAILI: ADMINISTRATORS REDZ UN DZĒŠ         (atradumi 06, 17)
--
-- Sertifikātu bucket ir privāts, un administratora politikas tam
-- nebija — pārbaudīt sertifikātu no paneļa nevarēja, tikai redzēt
-- ceļu kā tekstu.
--
-- Dzēšot kontu, rindas no storage.objects pazuda, bet pats fails
-- krātuvē palika un pēc tiešās saites joprojām atvērās. Failus tagad
-- dzēš lietotne caur Storage API — tam vajag šo politiku.
-- =============================================================

drop policy if exists "Administrators redz sertifikātus" on storage.objects;
create policy "Administrators redz sertifikātus" on storage.objects
  for select using (bucket_id = 'certificates' and public.is_admin());

drop policy if exists "Administrators dzēš failus" on storage.objects;
create policy "Administrators dzēš failus" on storage.objects
  for delete using (
    bucket_id in ('avatars', 'gallery', 'certificates') and public.is_admin()
  );


-- =============================================================
-- 11. INDEKSI, KAS NETIKA LIETOTI NEKAD               (atradums 09)
--
-- Datubāze bija indeksēta filtrēšanai, ko lietotne nedara: viss
-- notiek pārlūkā, pār jau ielādētu sarakstu. Šie indeksi maksāja
-- rakstīšanas laiku un neatgrieza neko.
--
-- Kad kouču skaits pāraugs pāris simtus un filtrēšana pāries uz
-- servera pusi, tie jāatjauno — līdz tam tie ir tikai svars.
-- =============================================================

drop index if exists public.coach_profiles_niches_idx;
drop index if exists public.coach_profiles_languages_idx;
drop index if exists public.coach_profiles_cert_idx;
drop index if exists public.coach_profiles_price_idx;
drop index if exists public.coach_profiles_search_idx;
drop index if exists public.posts_search_idx;

-- Toties šis tiek lietots katrā sākumlapas pārbūvē un līdz šim nebija
create index if not exists coach_profiles_listing_idx
  on public.coach_profiles (created_at desc)
  where is_published;


-- =============================================================
-- 12. RAKSTU KOPSAVILKUMI                             (atradums 11)
--
-- Bloga saraksts vilka katra raksta pilnu tekstu tikai tāpēc, ka
-- kopsavilkums varēja izrādīties tukšs. Turpmāk to aizpilda redaktors
-- saglabāšanas brīdī; šis ir vienreizējs esošo rakstu aizpildījums.
-- =============================================================

update public.posts
   set excerpt = left(
         regexp_replace(
           regexp_replace(content, '[#>*_`\[\]()!-]', '', 'g'),
           '\s+', ' ', 'g'
         ),
         200
       )
 where excerpt is null or trim(excerpt) = '';
