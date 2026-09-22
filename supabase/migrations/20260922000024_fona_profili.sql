-- =============================================================
-- Fona profili
--
-- Trīs profili sarakstā nav īsti piedāvājumi — tie ir mūsu pašu, likti
-- iekšā, lai tukša vietne neizskatītos pamesta. Meklētājam tie aizņem
-- vietu augšā, kur vajadzētu būt cilvēkiem, kas tiešām gaida klientus.
--
-- Karogs, nevis dzēšana: profili paliek pieejami pa tiešo saiti un
-- sarakstā, tikai beigās. Un, kad kāds no tiem kļūs par īstu piedāvājumu,
-- to atgriež atpakaļ ar vienu ķeksīti.
-- =============================================================

alter table public.coach_profiles
  add column if not exists is_background boolean not null default false;

comment on column public.coach_profiles.is_background is
  'Mūsu pašu fona profils — sarakstā vienmēr pēdējais, arī kārtojot.';

update public.coach_profiles
   set is_background = true
 where slug in ('uldis-orups', 'anda-van-der-miscenko', 'inga-vitola-vitolina');
