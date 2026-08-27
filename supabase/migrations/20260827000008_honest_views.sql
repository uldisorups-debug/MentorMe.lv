-- =============================================================
-- Godīgi skatījumi
--
-- Līdz šim increment_profile_views bija publiska funkcija bez
-- ierobežojuma: viens cikls pārlūka konsolē, un skaitlis ir tūkstotis.
-- Kamēr tas bija tikai skaitlis blakus profilam, tas bija mazsvarīgi.
-- Tiklīdz tas nosaka secību sarakstā, to kļūst vērts viltot.
--
-- Risinājums: viens apmeklētājs skaitās reizi dienā katram profilam.
-- IP netiek glabāts — tikai neatgriezenisks jaucējkods, kurā iekšā ir
-- arī datums, tāpēc rīt tas pats cilvēks skaitās no jauna.
-- =============================================================

create extension if not exists pgcrypto with schema extensions;

create table public.profile_view_log (
  fingerprint text primary key,
  viewed_on   date not null default current_date
);

create index profile_view_log_day_idx on public.profile_view_log (viewed_on);

alter table public.profile_view_log enable row level security;
-- Politiku nav ar nolūku: šo tabulu nelasa neviens, arī administrators.
-- Funkcija zemāk ir security definer un RLS apiet.

create or replace function public.increment_profile_views(coach_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  coach_id uuid;
  visitor  text;
  finger   text;
begin
  select c.id into coach_id
    from public.coach_profiles c
   where c.slug = coach_slug and c.is_published;

  if coach_id is null then
    return;
  end if;

  -- Aiz Vercel un Cloudflare īstā adrese ir x-forwarded-for pirmā vērtība
  visitor := coalesce(
    nullif(
      split_part(
        current_setting('request.headers', true)::json ->> 'x-forwarded-for',
        ',', 1
      ),
      ''
    ),
    'nezinams'
  );

  -- Datums jaucējkodā nozīmē, ka rīt tas pats apmeklētājs skaitās vēlreiz.
  -- Bez datuma skaitītājs apstātos uz mūžu.
  finger := encode(
    extensions.digest(visitor || coach_id::text || current_date::text, 'sha256'),
    'hex'
  );

  insert into public.profile_view_log (fingerprint)
  values (finger)
  on conflict (fingerprint) do nothing;

  -- FOUND ir patiess tikai tad, ja rinda tiešām tika ievietota
  if found then
    update public.coach_profiles
       set profile_views = profile_views + 1
     where id = coach_id;
  end if;

  -- Retu reizi izmetam vecos ierakstus. Tie kļūst nederīgi jau nākamajā
  -- dienā, tāpēc glabāt tos ilgāk nav ne jēgas, ne pamata.
  if random() < 0.01 then
    delete from public.profile_view_log
     where viewed_on < current_date - 2;
  end if;
end;
$$;

grant execute on function public.increment_profile_views(text) to anon, authenticated;


-- =============================================================
-- Tas pats rakstiem
-- =============================================================

create or replace function public.increment_post_views(post_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  post_id uuid;
  visitor text;
  finger  text;
begin
  select p.id into post_id
    from public.posts p
   where p.slug = post_slug and p.status = 'published';

  if post_id is null then
    return;
  end if;

  visitor := coalesce(
    nullif(
      split_part(
        current_setting('request.headers', true)::json ->> 'x-forwarded-for',
        ',', 1
      ),
      ''
    ),
    'nezinams'
  );

  finger := encode(
    extensions.digest(visitor || post_id::text || current_date::text, 'sha256'),
    'hex'
  );

  insert into public.profile_view_log (fingerprint)
  values (finger)
  on conflict (fingerprint) do nothing;

  if found then
    update public.posts set view_count = view_count + 1 where id = post_id;
  end if;
end;
$$;

grant execute on function public.increment_post_views(text) to anon, authenticated;


-- =============================================================
-- Sākam no tīras lapas
--
-- Esošais skaitlis radās testējot un ir bezjēdzīgs. Ja tas noteiks
-- secību sarakstā, labāk sākt no nulles nekā no izdomāta skaitļa.
-- =============================================================

update public.coach_profiles set profile_views = 0;
