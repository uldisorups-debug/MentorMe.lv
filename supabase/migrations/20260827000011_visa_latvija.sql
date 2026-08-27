-- Reģions "Visa Latvija".
--
-- Daļa meistaru nav piesieti vienai vietai: viņi brauc pie klienta,
-- māca visur vai strādā gan tā, gan tā. Līdz šim viņiem bija jāizvēlas
-- viens novads, kas ir nepatiesi, vai jāatstāj tukšs, un tad viņus
-- neatrada neviens, kas meklē pēc vietas.
--
-- sort_order 0 — saraksta augšā, pirms konkrētajiem novadiem.
insert into public.regions (slug, name_lv, name_en, name_ru, sort_order)
values ('visa-latvija', 'Visa Latvija', 'All of Latvia', 'Вся Латвия', 0)
on conflict (slug) do nothing;
