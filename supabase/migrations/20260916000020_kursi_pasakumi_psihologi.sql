-- =============================================================
-- 1. Kursi un pasākumi — no ķeksīša uz četrām izvēlēm
--
-- Līdz šim bija viens ķeksītis "piedāvāju meistarklases / pieredzes".
-- Tajā vienā vārdā bija sabāztas četras dažādas lietas, un neviena no
-- tām nebija atrodama.
--
-- Dalījums ir pēc tā, cik daudz laika cilvēkam jāatvēl — tas ir vienīgais,
-- kas šīs četras lietas tiešām atšķir:
--
--   experience  Pieredze     — dažas stundas, viesis izdzīvo, nevis mācās
--   masterclass Meistarklase — pusdiena, viena prasme rokās
--   course      Kurss        — vairākas nodarbības pēc kārtas, viena grupa
--   retreat     Retrīts      — vairākas dienas ar nakšņošanu
--
-- Masīvs, ne viena vērtība: keramiķis reāli rīko gan kursu, gan
-- meistarklasi. Ar vienu izvēli viņam būtu jāizlemj, kuru no saviem
-- pakalpojumiem noslēpt.
--
-- Privātstundu sarakstā nav ar nolūku — tās ir visa lapa. Ja tāda izvēle
-- būtu, to atzīmētu visi, un filtrs kļūtu bezjēdzīgs.
--
-- for_tourists paliek vietā. Kamēr Vercel nav pabeidzis izvietošanu,
-- dzīvā lapa vēl prasa veco kolonnu; nodzēst to tajā pašā minūtē nozīmētu
-- salauztu sākumlapu uz pāris minūtēm. To noņem atsevišķi pēc tam.
-- =============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'experience_kind') then
    create type public.experience_kind as enum
      ('experience', 'masterclass', 'course', 'retreat');
  end if;
end $$;

alter table public.coach_profiles
  add column if not exists experience_kinds public.experience_kind[]
    not null default '{}';

alter table public.coach_profiles
  drop constraint if exists coach_experience_max;
alter table public.coach_profiles
  add constraint coach_experience_max
    check (cardinality(experience_kinds) <= 4);

/*
 * Vecais ķeksītis saucās "meistarklases / pieredzes" — abas vienā. Kuru
 * no tām cilvēks domāja, uzminēt nevar, tāpēc ieliekam abas; viņš to
 * vienā klikšķī salabos.
 */
update public.coach_profiles
   set experience_kinds = array['masterclass', 'experience']::public.experience_kind[]
 where for_tourists
   and cardinality(experience_kinds) = 0;


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
