-- =============================================================
-- Kā meistars izskatās Google rezultātos
--
-- Līdz šim virsrakstu un aprakstu ģenerēja kods no vārda un tagline.
-- Tas der, kamēr profilu ir pieci. Cilvēks, kurš grib, lai viņu atrod
-- pēc "klavierspēles stundas Rīgā", to nevar pateikt nekur.
--
-- Publiskajā profilā šie lauki neparādās. Tie ir tikai tam, ko redz
-- meklētājs rezultātu sarakstā.
-- =============================================================

alter table public.coach_profiles
  add column if not exists meta_title       text,
  add column if not exists meta_description text;

-- Google virsrakstu nogriež ap 60 zīmēm, aprakstu ap 155. Garāks nav
-- kļūda, bet tas, kas pāri, vienkārši netiek parādīts.
alter table public.coach_profiles
  add constraint meta_title_len
    check (meta_title is null or char_length(meta_title) <= 70),
  add constraint meta_description_len
    check (meta_description is null or char_length(meta_description) <= 200);
