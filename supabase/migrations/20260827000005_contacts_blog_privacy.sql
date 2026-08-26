-- =============================================================
-- Kouča kontakti, blogs, piekrišana un konta dzēšana
-- =============================================================

-- =============================================================
-- 1. KOUČA KONTAKTI
--
-- Atsevišķa tabula, nevis kolonnas coach_profiles, tieši tāpēc, ka
-- tai vajag citu piekļuvi: neielogotam to nedrīkst atdot vispār.
-- Paslēpt priekšpusē ar CSS nepietiktu — boti lasa lapas avotu.
-- =============================================================

create table public.coach_contacts (
  coach_id uuid primary key
    references public.coach_profiles(id) on delete cascade,

  email          text,
  whatsapp       text,   -- starptautiskā formā, piem. +37128348301
  telegram       text,   -- lietotājvārds bez @
  messenger_url  text,
  linkedin_url   text,
  other_label    text,   -- brīvs kanāls: "Signal", "Viber", "Zvani"
  other_value    text,

  -- Piekrišana rādīt kontaktus. Datums, nevis boolean, lai vēlāk
  -- var pierādīt, kad tieši cilvēks piekrita.
  consent_at timestamptz,

  updated_at timestamptz not null default now()
);

create trigger coach_contacts_touch_updated_at
  before update on public.coach_contacts
  for each row execute function public.touch_updated_at();

alter table public.coach_contacts enable row level security;

-- Viss drošības mehānisms: anonīmam nav nevienas politikas,
-- tāpēc datubāze viņam atgriež tukšumu, nevis datus
create policy "Kontaktus redz tikai ielogotie" on public.coach_contacts
  for select to authenticated using (true);

create policy "Koučs pārvalda savus kontaktus" on public.coach_contacts
  for all
  using (exists (select 1 from public.coach_profiles c
                 where c.id = coach_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.coach_profiles c
                      where c.id = coach_id and c.user_id = auth.uid()));


-- =============================================================
-- 2. BLOGS
-- =============================================================

create type post_status as enum ('draft', 'published');

create table public.posts (
  id        uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.coach_profiles(id) on delete cascade,

  title   text not null check (length(trim(title)) between 5 and 140),
  slug    text not null unique,
  excerpt text check (length(excerpt) <= 300),  -- meta description
  content text not null,                         -- markdown
  cover_image_url text,

  status       post_status not null default 'draft',
  published_at timestamptz,
  view_count   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index posts_public_idx on public.posts (published_at desc)
  where status = 'published';
create index posts_author_idx on public.posts (author_id);
create index posts_search_idx on public.posts
  using gin (to_tsvector('simple',
    coalesce(title,'') || ' ' || coalesce(excerpt,'')));

create or replace function public.set_post_slug()
returns trigger language plpgsql as $$
declare base_slug text; final_slug text; n int := 0;
begin
  if new.slug is not null and new.slug <> '' then return new; end if;
  base_slug := coalesce(public.slugify(new.title), 'raksts');
  final_slug := base_slug;
  while exists (select 1 from public.posts
                where slug = final_slug and id is distinct from new.id) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;
  new.slug := final_slug;
  return new;
end; $$;

create trigger posts_set_slug before insert on public.posts
  for each row execute function public.set_post_slug();

create trigger posts_touch_updated_at before update on public.posts
  for each row execute function public.touch_updated_at();

create or replace function public.stamp_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end; $$;

create trigger posts_stamp_published before insert or update on public.posts
  for each row execute function public.stamp_published_at();

alter table public.posts enable row level security;

create policy "Publicētie raksti ir publiski" on public.posts
  for select using (status = 'published');

create policy "Autors pārvalda savus rakstus" on public.posts
  for all
  using (exists (select 1 from public.coach_profiles c
                 where c.id = posts.author_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.coach_profiles c
                      where c.id = posts.author_id and c.user_id = auth.uid()));

create or replace function public.increment_post_views(post_slug text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.posts set view_count = view_count + 1
   where slug = post_slug and status = 'published';
end; $$;

grant execute on function public.increment_post_views(text) to anon, authenticated;


-- =============================================================
-- 3. KONTA DZĒŠANA (VDAR tiesības uz dzēšanu)
--
-- Klients pats auth.users rindu izdzēst nevar, tāpēc caur funkciju.
-- Dzēšot auth.users, kaskāde aiznes profiles -> coach_profiles ->
-- kontaktus, rakstus un atsauksmes. Storage faili kaskādē neiet,
-- tāpēc tos noņemam atsevišķi.
-- =============================================================

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Dzēšanai nepieciešama aktīva sesija';
  end if;

  -- Faili guļ mapē <user_id>/..., tāpēc atlase pēc pirmā mapes līmeņa
  delete from storage.objects
   where bucket_id in ('avatars', 'gallery', 'certificates')
     and (storage.foldername(name))[1] = uid::text;

  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
