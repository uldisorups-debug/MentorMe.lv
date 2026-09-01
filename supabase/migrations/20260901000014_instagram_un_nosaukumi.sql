-- =============================================================
-- Instagram kā saziņas kanāls un daži nosaukumi, ko pamanīja tests
-- =============================================================


-- =============================================================
-- 1. INSTAGRAM
--
-- Latvijā amatnieki, pasniedzēji un meistari savu darbu rāda tieši
-- tur. Līdz šim to varēja ielikt tikai "cita kanāla" ailē, kur tas
-- pazuda starp brīvu tekstu — bez ikonas un bez pārbaudes.
-- =============================================================

alter table public.coach_contacts
  add column if not exists instagram text;


-- =============================================================
-- 2. NOSAUKUMI, PĒC KURIEM CILVĒKI MEKLĒ
--
-- "Klavieres" ir instruments; meklē "klavierspēle". "Supervīzija"
-- viena pati ir par plašu — vārds nozīmē pārāk daudz dažādu lietu.
-- Slug netiek aiztikts: to glabā profilos, un maiņa izsistu tēmas
-- no jau aizpildītiem profiliem.
-- =============================================================

update public.categories
   set name_lv = 'Klavierspēle'
 where slug = 'klavieres';

update public.categories
   set name_lv = 'Supervīzija speciālistiem',
       name_en = 'Supervision for professionals',
       name_ru = 'Супервизия для специалистов'
 where slug = 'supervizija';

update public.categories
   set name_lv = 'Senioru aprūpe',
       name_en = 'Senior care',
       name_ru = 'Уход за пожилыми'
 where slug = 'vecums';
