-- =============================================================
-- Vietnes kods: administrators ielīmē <head> un <body> kodu
-- (Microsoft Clarity, Meta Pixel, Google verifikācija u.c.),
-- tāpat kā Mozello "Papildu kods". Bez izvietošanas un bez
-- programmētāja.
--
-- Viena rinda (id = 1). Lasīt drīkst visi — kods tāpat nonāk
-- katras lapas HTML. Rakstīt drīkst tikai administrators.
-- =============================================================

create table if not exists public.site_code (
  id            smallint primary key default 1 check (id = 1),
  head_html     text not null default '' check (length(head_html) <= 20000),
  body_html     text not null default '' check (length(body_html) <= 20000),
  -- Analītika liek sīkdatnes: bez piekrišanas to ielādēt nedrīkst (VDAR)
  needs_consent boolean not null default true,
  updated_at    timestamptz not null default now(),
  -- Bez ārējās atslēgas uz auth.users: tās izveide gaida slēdzeni uz
  -- auth tabulas, un produkcijā migrācija tāpēc nebeidzās
  updated_by    uuid
);

insert into public.site_code (id) values (1) on conflict (id) do nothing;

alter table public.site_code enable row level security;

drop policy if exists "Vietnes kodu lasa visi" on public.site_code;
create policy "Vietnes kodu lasa visi" on public.site_code
  for select using (true);

drop policy if exists "Vietnes kodu maina administrators" on public.site_code;
create policy "Vietnes kodu maina administrators" on public.site_code
  for update using (public.is_admin()) with check (public.is_admin());

revoke insert, update, delete, truncate, references, trigger
  on public.site_code from anon, authenticated;
grant select on public.site_code to anon, authenticated;
grant update (head_html, body_html, needs_consent, updated_at, updated_by)
  on public.site_code to authenticated;
