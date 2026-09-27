-- =============================================================
-- Tēmu ieteikumi: "Nevari atrast savu tēmu? Ieraksti to šeit."
--
-- Līdz šim, ja cilvēkam nederēja neviena tēma, viņam atlika tikai
-- rakstīt komentāru vai e-pastu, un tēmu kāds pievienoja ar roku
-- datubāzē. Tā notika ar Lailu Ozoliņu (Microsoft 365, Excel).
--
-- Tagad profila redaktorā ir lauks. Ieteikums nonāk admin panelī
-- (/admin/temas), un administrators ar vienu klikšķi to apstiprina:
-- tēma parādās sarakstā un uzreiz tiek pievienota arī ieteicēja
-- profilam, ja tajā vēl ir vieta.
-- =============================================================

create table if not exists public.topic_suggestions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  text         text not null check (length(trim(text)) between 2 and 80),
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  -- Kura tēma no šī radās (vai kurai tas piederēja, ja jau bija)
  category_slug text references public.categories(slug) on delete set null,
  created_at   timestamptz not null default now(),
  handled_at   timestamptz
);

create index if not exists topic_suggestions_pending
  on public.topic_suggestions (created_at desc)
  where status = 'pending';

alter table public.topic_suggestions enable row level security;

drop policy if exists "Ieteicējs raksta savu ieteikumu" on public.topic_suggestions;
create policy "Ieteicējs raksta savu ieteikumu" on public.topic_suggestions
  for insert with check (user_id = (select auth.uid()) and status = 'pending');

drop policy if exists "Ieteicējs redz savus ieteikumus" on public.topic_suggestions;
create policy "Ieteicējs redz savus ieteikumus" on public.topic_suggestions
  for select using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Administrators noraida ieteikumus" on public.topic_suggestions;
create policy "Administrators noraida ieteikumus" on public.topic_suggestions
  for update using (public.is_admin()) with check (public.is_admin());

-- Pret spamu: ne vairāk par 5 gaidošiem ieteikumiem no viena cilvēka
create or replace function public.limit_topic_suggestions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.topic_suggestions
       where user_id = new.user_id and status = 'pending') >= 5 then
    raise exception 'Par daudz gaidošu ieteikumu' using errcode = 'P0005';
  end if;
  return new;
end; $$;

drop trigger if exists topic_suggestions_limit on public.topic_suggestions;
create trigger topic_suggestions_limit
  before insert on public.topic_suggestions
  for each row execute function public.limit_topic_suggestions();


/*
 * Apstiprināšana vienā solī un vienā transakcijā:
 *  1. izveido tēmu izvēlētajā nozarē (vai izmanto esošu ar to pašu slug);
 *  2. atzīmē ieteikumu kā apstiprinātu;
 *  3. pievieno tēmu ieteicēja profilam, ja tajā ir mazāk par 4 tēmām
 *     (tik atļauj profila redaktors).
 *
 * security definer, jo kategorijās un svešā profilā raksta tikai šī
 * funkcija — pašai tabulai rakstīšanas politikas nav. Tāpēc pirmais
 * solis ir pārbaude, vai sauc administrators.
 */
create or replace function public.approve_topic_suggestion(
  suggestion_id uuid,
  topic_slug    text,
  topic_name    text,
  sphere        text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  suggester uuid;
  next_order int;
begin
  if not public.is_admin() then
    raise exception 'Tikai administrators' using errcode = '42501';
  end if;

  select user_id into suggester from public.topic_suggestions
   where id = suggestion_id and status = 'pending';
  if suggester is null then
    raise exception 'Ieteikums nav atrasts vai jau izskatīts';
  end if;

  if topic_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Nederīga adrese tēmai: %', topic_slug;
  end if;

  select coalesce(max(sort_order), 0) + 1 into next_order
    from public.categories where sphere_slug = sphere;

  insert into public.categories (slug, sphere_slug, name_lv, sort_order)
  values (topic_slug, sphere, trim(topic_name), next_order)
  on conflict (slug) do nothing;

  update public.topic_suggestions
     set status = 'approved', category_slug = topic_slug, handled_at = now()
   where id = suggestion_id;

  update public.coach_profiles
     set niches = array_append(niches, topic_slug)
   where user_id = suggester
     and not (topic_slug = any(niches))
     and cardinality(niches) < 4;

  return topic_slug;
end; $$;

revoke all on function public.approve_topic_suggestion(uuid, text, text, text) from public;
grant execute on function public.approve_topic_suggestion(uuid, text, text, text) to authenticated;
