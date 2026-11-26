-- =============================================================
-- Tēmu un profilu sakārtošana (2026-11-26)
--
-- 1. Ieteiktā tēma pēc apstiprināšanas netika pievienota ieteicējam,
--    ja viņam jau bija 4 tēmas. Cilvēks, kura joma sarakstā nebija,
--    bija spiests izvēlēties 4 "pagaidu" tēmas, un tās palika:
--    itāļu valodas skolotāja (Michela) rādījās pie mūzikas, sporta un
--    psihologiem, pirtnieks (Kristaps Sola) pie sporta. Tagad
--    apstiprinātā tēma vienmēr kļūst par pirmo, un, ja vietas nav,
--    izkrīt pēdējā.
-- 2. Joga un elpošana pārceltas no "Sports un ķermenis" uz "Garīgā
--    izaugsme un pašizziņa": jogas un elpas pasniedzēji rādījās starp
--    sporta treneriem.
-- 3. "Dizaineris" bija nozarē "Skaistums un stils" — pārcelts uz
--    "Māksla un radošums".
-- 4. Ieteikto tēmu nosaukumi sakārtoti (angļu valodā, mazais burts,
--    drukas kļūdas), dublikāti noņemti.
-- 5. Profiliem, kuru tēmas acīmredzami neatbilst aprakstam, tēmas
--    salabotas pēc paša cilvēka apraksta.
-- =============================================================

-- 1. Apstiprināšana
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

  -- Ieteiktā tēma ir cilvēka galvenā joma: pirmā sarakstā. "Cita
  -- prasme" (pagaidu izvēle) pazūd; ja vietas joprojām nav, izkrīt
  -- pēdējā.
  update public.coach_profiles
     set niches = (array[topic_slug] || array_remove(niches, 'cits-prasme'))[1:4]
   where user_id = suggester
     and not (topic_slug = any(niches));

  return topic_slug;
end; $$;

revoke all on function public.approve_topic_suggestion(uuid, text, text, text) from public;
grant execute on function public.approve_topic_suggestion(uuid, text, text, text) to authenticated;

-- 2.–3. Nozares
update public.categories set sphere_slug = 'garigums', sort_order = 9 where slug = 'joga';
update public.categories set sphere_slug = 'garigums', sort_order = 10 where slug = 'elposana';
update public.categories set sphere_slug = 'maksla', sort_order = 10 where slug = 'dizaineris';

-- 4. Nosaukumi
update public.categories set name_lv = 'Korejiešu valoda', name_en = 'Korean', name_ru = 'Корейский язык' where slug = 'korean';
update public.categories set name_lv = 'Itāļu valoda', name_en = 'Italian', name_ru = 'Итальянский язык' where slug = 'italian-language';
update public.categories set name_lv = 'Sociālo tīklu mārketings un reklāmas', name_en = 'Social media marketing & ads', name_ru = 'Маркетинг в соцсетях и реклама' where slug = 'markeitngs-socialo-tiklu-marketings-maksas-reklamas';
update public.categories set name_lv = 'Digitālā satura veidošana biznesam', name_en = 'Digital content for business', name_ru = 'Цифровой контент для бизнеса' where slug = 'digitala-satura-veidosana-biznesam';
update public.categories set name_lv = 'Skaistumkopšana', name_en = 'Beauty care', name_ru = 'Уход за красотой' where slug = 'skaistumkopsana';
update public.categories set name_lv = 'Pirts rituāli', name_en = 'Sauna rituals', name_ru = 'Банные ритуалы' where slug = 'pirts-ritu-li';
update public.categories set name_lv = 'Projektu un procesu vadība', name_en = 'Project & process management', name_ru = 'Управление проектами и процессами' where slug = 'projektu-un-procesu-vadiba';
update public.categories set name_en = 'Human Design', name_ru = 'Дизайн человека' where slug = 'cilveka-dizains';
update public.categories set name_en = 'Technology consultant', name_ru = 'Консультант по технологиям' where slug = 'tehnologijas-konsultants';
update public.categories set name_en = 'Automation solutions', name_ru = 'Решения для автоматизации' where slug = 'automatizacijas-risinajumi';
update public.categories set name_en = 'Designer', name_ru = 'Дизайнер' where slug = 'dizaineris';

-- 5. Profili (pēc paša apraksta; galvenā tēma pirmā)
update public.coach_profiles set niches = array['italian-language'] where slug = 'learnitalian-conamore';
update public.coach_profiles set niches = array['korean', 'val-sarunvaloda'] where slug = 'kyuhwan';
update public.coach_profiles set niches = array['pirts-ritu-li', 'mental', 'attiecibas', 'dziednieciba'] where slug = 'kristaps-solas';
update public.coach_profiles set niches = array['numerologija', 'karjera', 'parmainas'] where slug = 'kitija';
update public.coach_profiles set niches = array['tehnologijas-konsultants', 'automatizacijas-risinajumi', 'projektu-un-procesu-vadiba'] where slug = 'edgarsluks';
update public.coach_profiles set niches = array['kosmetologija', 'grims', 'skaistumkopsana', 'bizness'] where slug = 'estetik-care-estetik-care';
update public.coach_profiles set niches = array['marketings', 'markeitngs-socialo-tiklu-marketings-maksas-reklamas', 'digitala-satura-veidosana-biznesam', 'bizness'] where slug = 'evija-astica';
update public.coach_profiles set niches = array['m365', 'digitalie-riki'] where slug = 'laila';
update public.coach_profiles set niches = array['fizioterapija-arstnieciba', 'sports', 'elposana'] where slug = 'jurgisstrelis';
update public.coach_profiles set niches = array['garigs', 'emocionala-inteligence', 'radosa'] where slug = 'lasi-pildi-iedvesmojies';
update public.coach_profiles set niches = array['mi', 'automatizacijas-risinajumi', 'marketings'] where slug = 'linards-berzins';
update public.coach_profiles set niches = array['barddzinis', 'frizieri', 'marketings'] where slug = 'davey';

-- Dublikāti bez profiliem
delete from public.categories
 where slug in ('viriesu-frizieris-barber', 'reinkarnaciologs-regresalogs')
   and not exists (
     select 1 from public.coach_profiles c where categories.slug = any(c.niches)
   );
