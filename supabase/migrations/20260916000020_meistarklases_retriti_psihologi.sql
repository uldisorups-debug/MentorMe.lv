-- =============================================================
-- 1. Meistarklases un retrīti — no ķeksīša uz izvēli
--
-- Līdz šim bija viens ķeksītis "piedāvāju meistarklases". Retrīts nav
-- meistarklase: tas ir vairākas dienas, ar nakšņošanu, un cilvēks, kurš
-- to meklē, meklē tieši to. Vienā ķeksītī abus salikt nozīmē, ka neviens
-- no tiem nav atrodams.
--
-- for_tourists paliek vietā ar nolūku. Kamēr Vercel nav pabeidzis
-- izvietošanu, dzīvā lapa vēl prasa veco kolonnu; nodzēst to tajā pašā
-- minūtē nozīmētu salauztu sākumlapu uz pāris minūtēm. To noņem atsevišķi
-- pēc tam, kad jaunais kods jau strādā.
-- =============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'experience_kind') then
    create type public.experience_kind as enum ('masterclass', 'retreat');
  end if;
end $$;

alter table public.coach_profiles
  add column if not exists experience_kind public.experience_kind;

update public.coach_profiles
   set experience_kind = 'masterclass'
 where for_tourists
   and experience_kind is null;


-- =============================================================
-- 2. Psiholoģija kā sava nozare
--
-- Psihologs nav koučs. Cilvēks, kurš meklē psihologu, sarakstā
-- "Koučings un mentorings" neskatās — un tieši tur šī prasme līdz šim
-- būtu jāmeklē.
--
-- Esošās tēmas nekustinām: "Mentālā veselība" un "Attiecības" paliek
-- tur, kur tās ir, un profilos ierakstītais nemainās ne par gramu.
-- =============================================================

-- Vieta otrajā vietā, uzreiz aiz koučinga. sort_order nav unikāls,
-- tāpēc pārbīde ir droša; "Cits" ar 99 paliek saraksta beigās.
update public.spheres
   set sort_order = sort_order + 1
 where sort_order >= 2 and sort_order < 99;

insert into public.spheres (slug, name_lv, name_en, name_ru, icon, sort_order)
values ('psihologija', 'Psiholoģija un terapija', 'Psychology & Therapy',
        'Психология и терапия', '🫂', 2)
on conflict (slug) do nothing;

insert into public.categories (slug, sphere_slug, name_lv, name_en, name_ru, sort_order) values
  ('psihologs',        'psihologija', 'Psihologs',              'Psychologist',          'Психолог',                  1),
  ('psihoterapija',    'psihologija', 'Psihoterapija',          'Psychotherapy',         'Психотерапия',              2),
  ('bernu-psihologs',  'psihologija', 'Bērnu psihologs',        'Child Psychologist',    'Детский психолог',          3),
  ('gimenes-terapija', 'psihologija', 'Ģimenes terapija',       'Family Therapy',        'Семейная терапия',          4),
  ('trauksme',         'psihologija', 'Trauksme un izdegšana',  'Anxiety & Burnout',     'Тревога и выгорание',       5),
  ('krizes',           'psihologija', 'Krīzes un zaudējums',    'Crisis & Loss',         'Кризис и утрата',           6)
on conflict (slug) do nothing;
