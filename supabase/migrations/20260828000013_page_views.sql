-- =============================================================
-- Savs apmeklējumu skaitītājs
--
-- Google Analytics rāda tikai tos, kas piekrituši sīkdatnēm. Cik
-- cilvēku tiešām bija, tas nepasaka nekad, un skaitlis vienmēr būs
-- mazāks par īsto.
--
-- Šis skaita visus. Sīkdatnes tas neliek un pārlūkam nepieskaras: viss
-- notiek serverī, un no apmeklētāja paliek pāri tikai neatgriezenisks
-- jaucējkods, kurš pēc divām dienām tiek izdzēsts. Tā pati pieeja, kas
-- jau strādā profilu skatījumiem.
--
-- Dati paliek šeit, Supabase. Tos var lasīt ar SQL un skatīt
-- administratora panelī — bez trešās puses un bez mēneša limita.
-- =============================================================


-- =============================================================
-- 1. TABULA
--
-- Glabājam apkopojumu, ne katru atsevišķu apmeklējumu: dienas, lapas
-- un avota trijnieks ar skaitli. Tā tabula neaug bezgalīgi, un
-- vaicājums "cik bija augustā" ir viena rinda, ne miljons.
-- =============================================================

create table if not exists public.page_views (
  path      text not null,
  viewed_on date not null default current_date,
  -- Domēns, no kura cilvēks atnāca; 'tiešs', ja saite ievadīta pašrocīgi
  source    text not null default 'tiešs',
  views     int  not null default 0,
  primary key (path, viewed_on, source)
);

create index if not exists page_views_day_idx
  on public.page_views (viewed_on desc);

alter table public.page_views enable row level security;

-- Skaitļus redz tikai administrators. Rakstīšanas politikas nav ar
-- nolūku — raksta tikai zemāk esošā funkcija, kas RLS apiet.
create policy "Statistiku redz administrators" on public.page_views
  for select using (public.is_admin());


-- =============================================================
-- 2. AVOTA SAĪSINĀŠANA
--
-- No pilnas atsauces adreses paturam tikai domēnu. Pilns ceļš ar
-- parametriem varētu saturēt meklēto vārdu vai identifikatoru, un tas
-- jau būtu vairāk, nekā mums vajag zināt.
-- =============================================================

create or replace function public.referrer_source(referrer text, own_host text)
returns text
language plpgsql
immutable
as $$
declare
  host text;
begin
  if referrer is null or referrer = '' then
    return 'tiešs';
  end if;

  host := lower(split_part(split_part(regexp_replace(referrer, '^https?://', ''), '/', 1), ':', 1));
  host := regexp_replace(host, '^www\.', '');

  if host = '' then
    return 'tiešs';
  end if;

  -- Pāreja no vienas mūsu lapas uz citu nav jauns apmeklējums no ārpuses
  if own_host is not null and host = regexp_replace(lower(own_host), '^www\.', '') then
    return 'iekšējs';
  end if;

  return left(host, 100);
end;
$$;


-- =============================================================
-- 3. IERAKSTĪŠANA
--
-- Viens apmeklētājs vienā lapā dienā skaitās vienu reizi — tāpat kā
-- profiliem. Ja apmeklētāju identificēt nevar, neskaitām nemaz: labāk
-- mazāks skaitlis nekā tāds, kas nozīmē neko.
-- =============================================================

create or replace function public.record_page_view(
  page_path text,
  referrer  text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_path text;
  headers    json;
  visitor    text;
  finger     text;
  src        text;
begin
  -- Tikai iekšējie ceļi, bez parametriem un bez enkuriem
  clean_path := split_part(split_part(coalesce(page_path, ''), '?', 1), '#', 1);
  if clean_path !~ '^/[A-Za-z0-9/_-]*$' or length(clean_path) > 200 then
    return;
  end if;
  clean_path := rtrim(clean_path, '/');
  if clean_path = '' then
    clean_path := '/';
  end if;

  headers := nullif(current_setting('request.headers', true), '')::json;
  if headers is null then
    return;
  end if;

  visitor := coalesce(
    nullif(split_part(headers ->> 'x-forwarded-for', ',', 1), ''),
    nullif(headers ->> 'x-real-ip', ''),
    nullif(headers ->> 'cf-connecting-ip', '')
  );
  if visitor is null then
    return;
  end if;

  -- Ceļš iekšā jaucējkodā: viens cilvēks dienā var skaitīties vienreiz
  -- katrā lapā atsevišķi, ne vienreiz visā vietnē
  finger := encode(
    extensions.digest(visitor || clean_path || current_date::text, 'sha256'),
    'hex'
  );

  insert into public.profile_view_log (fingerprint)
  values (finger)
  on conflict (fingerprint) do nothing;

  if not found then
    return;
  end if;

  src := public.referrer_source(referrer, headers ->> 'host');

  insert into public.page_views (path, viewed_on, source, views)
  values (clean_path, current_date, src, 1)
  on conflict (path, viewed_on, source)
  do update set views = public.page_views.views + 1;

  if random() < 0.01 then
    delete from public.profile_view_log where viewed_on < current_date - 2;
  end if;
end;
$$;

grant execute on function public.record_page_view(text, text) to anon, authenticated;
