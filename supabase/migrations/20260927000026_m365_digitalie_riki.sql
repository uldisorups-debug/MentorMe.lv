-- =============================================================
-- Tehnoloģijās divas jaunas tēmas: Microsoft 365 un digitālie rīki
--
-- Laila Ozoliņa māca Microsoft 365, Excel un Word pieaugušajiem darbā,
-- bet vienīgā piemērotā tēma bija "Datorprasmes senioriem". Viņas
-- kursi tur neiederas, un cilvēks, kurš meklē Excel kursus darbam,
-- viņu tur nemeklētu.
--
-- "Datorprasmes senioriem" paliek, tikai pārbīdās uz saraksta beigām.
-- Profilos ierakstītais nemainās.
-- =============================================================

insert into public.categories (slug, sphere_slug, name_lv, name_en, name_ru, sort_order) values
  ('m365',           'tehnologijas', 'Microsoft 365, Excel un Word', 'Microsoft 365, Excel & Word',  'Microsoft 365, Excel и Word',       5),
  ('digitalie-riki', 'tehnologijas', 'Digitālie rīki darbam',        'Digital tools for work',       'Цифровые инструменты для работы', 6)
on conflict (slug) do nothing;

update public.categories set sort_order = 7 where slug = 'datorprasmes';
