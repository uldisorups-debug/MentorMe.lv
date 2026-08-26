-- =============================================================
-- MentorMe.lv — sākotnējā shēma
--
-- Palaišana: Supabase Dashboard -> SQL Editor -> New query
--            -> ielīmē visu failu -> Run
--
-- Skripts ir idempotents tiktāl, cik Postgres to ļauj: to var
-- palaist tukšā projektā vienu reizi. Atkārtotai palaišanai
-- vispirms jānomet objekti (skat. faila beigās esošo DROP bloku).
-- =============================================================

create extension if not exists "uuid-ossp";

-- =============================================================
-- 1. ENUMI
-- =============================================================

create type user_role  as enum ('client', 'coach');
create type price_tier as enum ('free', 'affordable', 'mid', 'premium');
create type cert_level as enum ('none', 'acc', 'pcc', 'mcc', 'metacoach', 'other');


-- =============================================================
-- 2. PALĪGFUNKCIJAS
-- =============================================================

-- Latviešu diakritika -> ASCII slug. Neizmanto unaccent paplašinājumu,
-- jo tā izvietojums Supabase projektos mēdz atšķirties.
create or replace function public.slugify(txt text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both '-' from
      regexp_replace(
        lower(translate(
          coalesce(txt, ''),
          'āĀčČēĒģĢīĪķĶļĻņŅšŠūŪžŽ',
          'aAcCeEgGiIkKlLnNsSuUzZ'
        )),
        '[^a-z0-9]+', '-', 'g'
      )
    ),
    ''
  );
$$;

-- updated_at uzturēšana
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- =============================================================
-- 3. PROFILES  (paplašina auth.users)
-- =============================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         user_role   not null default 'client',
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- LABOJUMS #1: bez šī trigera pirmā OAuth pieteikšanās neizveido
-- profiles rindu, un lietotājs paliek "puskarājoties".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================
-- 4. COACH_PROFILES
-- =============================================================

create table public.coach_profiles (
  id      uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,

  -- LABOJUMS #2: brīfā slug kolonnas nebija, bet route ir /coach/[slug]
  slug text not null unique,

  -- Pamatinfo
  full_name text not null,
  tagline   text,
  bio       text,
  avatar_url text,

  -- Profesionālā daļa
  certification     cert_level default 'none',
  cert_other_label  text,          -- brīvs teksts, ja certification = 'other'
  cert_proof_url    text,          -- privātā bucket ceļš, nevis publisks URL
  is_verified       boolean not null default false,
  years_experience  int check (years_experience is null or years_experience between 0 and 80),
  session_languages text[] not null default '{lv}',

  -- Cena
  price_tier price_tier not null default 'free',
  price_from int check (price_from is null or price_from >= 0),
  price_to   int check (price_to   is null or price_to   >= 0),
  constraint price_range_valid check (
    price_from is null or price_to is null or price_to >= price_from
  ),

  -- Nišas (categories.slug vērtības)
  niches text[] not null default '{}',

  -- Rezervācija
  calendly_url text,

  -- Kultūras sakritība
  books_top  jsonb not null default '[]'::jsonb,
  movies_top jsonb not null default '[]'::jsonb,
  music_top  jsonb not null default '[]'::jsonb,

  -- Galerija
  gallery_urls text[] not null default '{}',

  -- Meta
  is_published  boolean not null default false,
  profile_views int     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Slug ģenerēšana ar unikalitātes atrisināšanu.
-- Kirilicas/citu rakstu gadījumā slugify atgriež null -> fallback 'koucs-N'.
create or replace function public.set_coach_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug  text;
  final_slug text;
  n int := 0;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;

  base_slug  := coalesce(public.slugify(new.full_name), 'koucs');
  final_slug := base_slug;

  while exists (
    select 1 from public.coach_profiles
    where slug = final_slug and id is distinct from new.id
  ) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$;

-- Tikai BEFORE INSERT — slug paliek stabils SEO dēļ, arī ja vārdu maina.
create trigger coach_profiles_set_slug
  before insert on public.coach_profiles
  for each row execute function public.set_coach_slug();

create trigger coach_profiles_touch_updated_at
  before update on public.coach_profiles
  for each row execute function public.touch_updated_at();

-- LABOJUMS #3 (drošība): brīfa RLS politika "for all using (auth.uid() = user_id)"
-- ļautu koučam pašam ieslēgt is_verified = true un uzlikt sev verificēta
-- zīmi bez jebkādas sertifikāta pārbaudes. Šis trigeris to bloķē —
-- is_verified var mainīt tikai service_role (admin puse).
create or replace function public.protect_verified_flag()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_verified := false;
  else
    new.is_verified := old.is_verified;
  end if;

  return new;
end;
$$;

create trigger coach_profiles_protect_verified
  before insert or update on public.coach_profiles
  for each row execute function public.protect_verified_flag();

-- Indeksi — bez tiem filtrēšana pēc nišām skenē visu tabulu
create index coach_profiles_published_idx on public.coach_profiles (is_published)
  where is_published;
create index coach_profiles_niches_idx    on public.coach_profiles using gin (niches);
create index coach_profiles_languages_idx on public.coach_profiles using gin (session_languages);
create index coach_profiles_cert_idx      on public.coach_profiles (certification);
create index coach_profiles_price_idx     on public.coach_profiles (price_tier);

-- Meklēšana pēc vārda/tagline/bio. 'simple' konfigurācija, jo
-- Postgres iebūvētas latviešu valodas tsearch konfigurācijas nav.
create index coach_profiles_search_idx on public.coach_profiles
  using gin (to_tsvector('simple',
    coalesce(full_name, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(bio, '')
  ));


-- =============================================================
-- 5. REVIEWS
-- =============================================================

create table public.reviews (
  id         uuid primary key default uuid_generate_v4(),
  coach_id   uuid not null references public.coach_profiles(id) on delete cascade,
  client_id  uuid not null references public.profiles(id) on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  body       text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  unique (coach_id, client_id)
);

create index reviews_coach_idx on public.reviews (coach_id) where is_visible;


-- =============================================================
-- 6. CATEGORIES
-- =============================================================

create table public.categories (
  id      uuid primary key default uuid_generate_v4(),
  slug    text unique not null,
  name_lv text not null,
  name_en text,
  name_ru text,
  icon    text,
  sort_order int not null default 0
);

insert into public.categories (slug, name_lv, name_en, icon, sort_order) values
  ('bizness',    'Bizness & vadība',   'Business & Leadership', '💼',  1),
  ('karjera',    'Karjera',            'Career',                '🎯',  2),
  ('finanses',   'Finanses',           'Finances',              '💰',  3),
  ('mental',     'Mentālā veselība',   'Mental Health',         '🧠',  4),
  ('attiecibas', 'Attiecības',         'Relationships',         '❤️',  5),
  ('vecaki',     'Vecāki & ģimene',    'Parenting & Family',    '👨‍👩‍👧', 6),
  ('sports',     'Sports & fitness',   'Sports & Fitness',      '🏋️',  7),
  ('garigs',     'Garīgā izaugsme',    'Spiritual Growth',      '✨',  8),
  ('radosa',     'Radošums',           'Creativity',            '🎨',  9),
  ('dzive',      'Dzīves pieredze',    'Life Experience',       '🌍', 10),
  ('cietums',    'Rehabilitācija',     'Rehabilitation',        '🔄', 11),
  ('lidz',       'Jauno pieaugušo',    'Young Adults',          '🚀', 12);


-- =============================================================
-- 7. REITINGU SKATS  (kartītēm un profila lapai)
-- =============================================================

create or replace view public.coach_ratings
with (security_invoker = on) as
  select
    coach_id,
    round(avg(rating)::numeric, 2) as avg_rating,
    count(*)::int                  as review_count
  from public.reviews
  where is_visible
  group by coach_id;

grant select on public.coach_ratings to anon, authenticated;


-- =============================================================
-- 8. PROFILA SKATĪJUMU SKAITĪTĀJS
-- =============================================================
-- RLS neļauj svešam lietotājam rakstīt koučam rindā, tāpēc caur RPC.

create or replace function public.increment_profile_views(coach_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.coach_profiles
     set profile_views = profile_views + 1
   where slug = coach_slug and is_published;
end;
$$;

grant execute on function public.increment_profile_views(text) to anon, authenticated;


-- =============================================================
-- 9. RLS
-- =============================================================

alter table public.profiles       enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.reviews        enable row level security;
alter table public.categories     enable row level security;

-- ---- profiles ----
-- LABOJUMS #4: brīfā bija tikai "users can view own profile". Tas nozīmē,
-- ka atsauksmju autoru vārdus neviens nevarētu nolasīt un atsauksmes
-- rādītos bez vārda. Tabulā nav jutīgu datu (e-pasts dzīvo auth.users),
-- tāpēc publisks select ir droši.
create policy "Anyone can read profiles" on public.profiles
  for select using (true);

-- LABOJUMS #5: bez INSERT politikas jaunu profilu nevar izveidot vispār.
-- Trigeris to dara ar security definer, bet šī ir rezerve klienta pusei.
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---- coach_profiles ----
create policy "Public can view published coaches" on public.coach_profiles
  for select using (is_published);

create policy "Coach can manage own profile" on public.coach_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- reviews ----
-- LABOJUMS #6: brīfā bija using (true) — paslēptās atsauksmes joprojām
-- būtu publiski nolasāmas, un is_visible karogam nebūtu jēgas.
create policy "Public can read visible reviews" on public.reviews
  for select using (is_visible);

create policy "Coach can read own hidden reviews" on public.reviews
  for select using (
    exists (
      select 1 from public.coach_profiles c
      where c.id = reviews.coach_id and c.user_id = auth.uid()
    )
  );

-- Klients nedrīkst rakstīt atsauksmi pats sev
create policy "Clients can write reviews" on public.reviews
  for insert with check (
    auth.uid() = client_id
    and not exists (
      select 1 from public.coach_profiles c
      where c.id = coach_id and c.user_id = auth.uid()
    )
  );

create policy "Clients can update own review" on public.reviews
  for update using (auth.uid() = client_id) with check (auth.uid() = client_id);

create policy "Clients can delete own review" on public.reviews
  for delete using (auth.uid() = client_id);

-- ---- categories ----
create policy "Anyone can read categories" on public.categories
  for select using (true);


-- =============================================================
-- 10. STORAGE BUCKETS
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',      'avatars',      true,   2 * 1024 * 1024,
     array['image/jpeg','image/png','image/webp']),
  ('gallery',      'gallery',      true,   5 * 1024 * 1024,
     array['image/jpeg','image/png','image/webp']),
  ('certificates', 'certificates', false, 10 * 1024 * 1024,
     array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Failu ceļa konvencija: <user_id>/<faila-nosaukums>
-- Uz to balstās visas zemāk esošās politikas.

create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users manage own avatars" on storage.objects
  for all
  using      (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public read gallery" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "Users manage own gallery" on storage.objects
  for all
  using      (bucket_id = 'gallery' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'gallery' and (storage.foldername(name))[1] = auth.uid()::text);

-- Sertifikāti: īpašnieks var augšupielādēt un redzēt savus, citi neredz neko.
-- Admin pārbauda caur service_role, kas RLS apiet.
create policy "Users read own certificates" on storage.objects
  for select using (
    bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users upload own certificates" on storage.objects
  for insert with check (
    bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own certificates" on storage.objects
  for delete using (
    bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =============================================================
-- ATCELŠANA (ja jāpalaiž no jauna tīrā lapā)
-- =============================================================
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop table if exists public.reviews, public.coach_profiles,
--                      public.profiles, public.categories cascade;
-- drop view  if exists public.coach_ratings;
-- drop type  if exists user_role, price_tier, cert_level;
-- drop function if exists public.handle_new_user, public.set_coach_slug,
--                         public.slugify, public.touch_updated_at,
--                         public.protect_verified_flag,
--                         public.increment_profile_views cascade;
