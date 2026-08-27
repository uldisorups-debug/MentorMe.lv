-- =============================================================
-- Administratori
--
-- Galvenais risks šeit ir pašpaaugstināšana: profiles tabulai jau ir
-- politika "Users can update own profile", tāpēc bez papildu aizsarga
-- jebkurš varētu sev uzlikt is_admin = true un pārņemt visu lapu.
-- To bloķē protect_admin_flag() trigeris zemāk.
-- =============================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists profiles_admin_idx on public.profiles (id)
  where is_admin;


-- =============================================================
-- 1. PALĪGFUNKCIJA
--
-- security definer ir obligāts: bez tā, izsaucot šo no politikas uz
-- profiles tabulas, sanāktu bezgalīga rekursija — politika prasa
-- funkciju, funkcija lasa tabulu, tabula prasa politiku.
-- =============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

grant execute on function public.is_admin() to authenticated;


-- =============================================================
-- 2. AIZSARGS PRET PAŠPAAUGSTINĀŠANU
-- =============================================================

create or replace function public.protect_admin_flag()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  admin_count int;
begin
  -- auth.role() ir null, kad pieprasījums nāk bez sesijas: SQL Editor
  -- vai serveris ar service_role atslēgu. Tie ir uzticami.
  if auth.role() is null or auth.role() = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_admin := false;
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    -- Piešķirt vai atņemt administratora tiesības drīkst tikai cits admins
    if not public.is_admin() then
      new.is_admin := old.is_admin;
      return new;
    end if;

    -- Sev pašam noņemt nevar — citādi var nejauši palikt ārpus savas lapas
    if auth.uid() = old.id then
      new.is_admin := old.is_admin;
      return new;
    end if;

    -- Pēdējo administratoru noņemt nevar
    if old.is_admin and not new.is_admin then
      select count(*) into admin_count from public.profiles where is_admin;
      if admin_count <= 1 then
        raise exception 'Pēdējo administratoru noņemt nevar';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_admin
  before insert or update on public.profiles
  for each row execute function public.protect_admin_flag();


-- =============================================================
-- 3. VERIFIKĀCIJA
--
-- Līdz šim is_verified varēja mainīt tikai service_role. Tagad arī
-- administrators — tā ir viņa galvenā darbība lapā.
-- =============================================================

create or replace function public.protect_verified_flag()
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
    new.is_verified := false;
  else
    new.is_verified := old.is_verified;
  end if;

  return new;
end;
$$;


-- =============================================================
-- 4. DARBĪBU ŽURNĀLS
--
-- Bez tā jautājums "kāpēc šis profils pazuda?" nav atbildams. Ieraksti
-- paliek arī tad, ja administrators vēlāk pats tiek dzēsts.
-- =============================================================

create table public.admin_actions (
  id           uuid primary key default uuid_generate_v4(),
  admin_id     uuid references public.profiles(id) on delete set null,
  admin_name   text,                 -- momentuzņēmums, ja konts vēlāk pazūd
  action       text not null,        -- delete_user, hide_review, verify_coach...
  target_table text not null,
  target_id    text,
  target_label text,                 -- cilvēkam saprotams, piem. kouča vārds
  reason       text,
  created_at   timestamptz not null default now()
);

create index admin_actions_recent_idx on public.admin_actions (created_at desc);

alter table public.admin_actions enable row level security;

create policy "Žurnālu lasa administratori" on public.admin_actions
  for select using (public.is_admin());

create policy "Administratori raksta žurnālā" on public.admin_actions
  for insert with check (public.is_admin() and admin_id = auth.uid());

-- Dzēšanas un labošanas politiku nav ar nolūku: žurnālu pārrakstīt
-- nevar neviens, arī administrators


-- =============================================================
-- 5. ADMINISTRATORA POLITIKAS
--
-- Katrai tabulai atsevišķa politika blakus esošajām. Politikas tiek
-- apvienotas ar OR, tāpēc parastie lietotāji neko nezaudē.
-- =============================================================

create policy "Administrators redz visus profilus" on public.coach_profiles
  for select using (public.is_admin());
create policy "Administrators labo profilus" on public.coach_profiles
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Administrators dzēš profilus" on public.coach_profiles
  for delete using (public.is_admin());

create policy "Administrators redz visas atsauksmes" on public.reviews
  for select using (public.is_admin());
create policy "Administrators labo atsauksmes" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Administrators dzēš atsauksmes" on public.reviews
  for delete using (public.is_admin());

create policy "Administrators redz visus rakstus" on public.posts
  for select using (public.is_admin());
create policy "Administrators labo rakstus" on public.posts
  for update using (public.is_admin()) with check (public.is_admin());
create policy "Administrators dzēš rakstus" on public.posts
  for delete using (public.is_admin());

create policy "Administrators redz ziņojumus" on public.review_reports
  for select using (public.is_admin());
create policy "Administrators apstrādā ziņojumus" on public.review_reports
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Administrators labo profilu lomas" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Kontaktus administrators redz kā jebkurš ielogots lietotājs —
-- atsevišķa politika nav vajadzīga


-- =============================================================
-- 6. LIETOTĀJA DZĒŠANA
--
-- Klients auth.users rindu dzēst nevar, tāpēc caur funkciju. Vispirms
-- ieraksts žurnālā, tad faili, tad konts — lai pēdas paliek arī tad, ja
-- kaut kas pa vidu nokrīt.
-- =============================================================

create or replace function public.admin_delete_user(
  target_id uuid,
  target_label text default null,
  reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  my_name text;
begin
  if not public.is_admin() then
    raise exception 'Šo darbību drīkst veikt tikai administrators';
  end if;

  if target_id = me then
    raise exception 'Sevi caur šo dzēst nevar — lieto konta iestatījumus';
  end if;

  -- Citu administratoru dzēst nevar, kamēr viņam nav noņemtas tiesības
  if (select p.is_admin from public.profiles p where p.id = target_id) then
    raise exception 'Vispirms noņem administratora tiesības';
  end if;

  select p.display_name into my_name from public.profiles p where p.id = me;

  insert into public.admin_actions
    (admin_id, admin_name, action, target_table, target_id, target_label, reason)
  values
    (me, my_name, 'delete_user', 'auth.users', target_id::text, target_label, reason);

  delete from storage.objects
   where bucket_id in ('avatars', 'gallery', 'certificates')
     and (storage.foldername(name))[1] = target_id::text;

  delete from auth.users where id = target_id;
end;
$$;

grant execute on function public.admin_delete_user(uuid, text, text) to authenticated;


-- =============================================================
-- 7. PIRMAIS ADMINISTRATORS
--
-- Trigeris neļauj nevienam pašam sev uzlikt tiesības, tāpēc pirmo
-- reizi tās jāpiešķir šeit, SQL Editorā. Tas darbojas, jo pieprasījums
-- nāk bez lietotāja sesijas.
--
-- Nomaini e-pastu uz savu un palaid abas rindas:
-- =============================================================

-- update public.profiles set is_admin = true
--  where id = (select u.id from auth.users u where u.email = 'tavs@epasts.lv');
