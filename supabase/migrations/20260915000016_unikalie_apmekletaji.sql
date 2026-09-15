-- =============================================================
-- Unikālie apmeklētāji
--
-- page_views skaita lapu atvērumus: cilvēks, kas apskata sākumlapu,
-- vienu profilu un blogu, tur ir trīs. Uz jautājumu "cik cilvēku šodien
-- bija" tas neatbild.
--
-- Tāpēc otrs pirkstu nospiedums — bez lapas ceļa, tikai apmeklētājs un
-- diena. Tas pats cilvēks visā vietnē dienā skaitās vienreiz.
--
-- Glabājam tikai skaitli. Pirkstu nospiedumi pēc divām dienām tiek
-- izdzēsti, skaitlis paliek — vēsture bez cilvēkiem.
-- =============================================================

create table if not exists public.daily_visitors (
  viewed_on date primary key default current_date,
  visitors  int  not null default 0
);

alter table public.daily_visitors enable row level security;

create policy "Apmeklētāju skaitu redz administrators" on public.daily_visitors
  for select using (public.is_admin());


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
  clean_path := split_part(split_part(coalesce(page_path, ''), '?', 1), '#', 1);
  if clean_path !~ '^/[A-Za-z0-9/_-]*$' or length(clean_path) > 200 then
    return;
  end if;
  clean_path := rtrim(clean_path, '/');
  if clean_path = '' then clean_path := '/'; end if;

  headers := nullif(current_setting('request.headers', true), '')::json;
  if headers is null then return; end if;

  visitor := coalesce(
    nullif(split_part(headers ->> 'x-forwarded-for', ',', 1), ''),
    nullif(headers ->> 'x-real-ip', ''),
    nullif(headers ->> 'cf-connecting-ip', '')
  );
  if visitor is null then return; end if;

  /*
   * Vispirms cilvēks, tad lapa.
   *
   * Šis nedrīkst būt aiz zemāk esošās pārbaudes: ja apmeklētājs šo lapu
   * šodien jau ir skatījis, tā izietu ar return, un viņš kā cilvēks
   * nekad netiktu saskaitīts.
   *
   * Vārds 'vietne' jaucējkodā atdala to no lapu nospiedumiem — citādi
   * cilvēks, kura ceļš sanāktu tukšs, sadurtos pats ar sevi.
   */
  finger := encode(
    extensions.digest(visitor || 'vietne' || current_date::text, 'sha256'),
    'hex'
  );

  insert into public.profile_view_log (fingerprint)
  values (finger)
  on conflict (fingerprint) do nothing;

  if found then
    insert into public.daily_visitors (viewed_on, visitors)
    values (current_date, 1)
    on conflict (viewed_on)
    do update set visitors = public.daily_visitors.visitors + 1;
  end if;

  -- Tagad konkrētā lapa
  finger := encode(
    extensions.digest(visitor || clean_path || current_date::text, 'sha256'),
    'hex'
  );

  insert into public.profile_view_log (fingerprint)
  values (finger)
  on conflict (fingerprint) do nothing;

  if not found then return; end if;

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

revoke execute on function public.record_page_view(text, text) from public;
grant  execute on function public.record_page_view(text, text) to anon, authenticated;
