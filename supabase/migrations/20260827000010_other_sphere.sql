-- =============================================================
-- Nozare "Cits"
--
-- Neviena klasifikācija nenosedz visu. Bez šīs sadaļas cilvēks, kura
-- prasme neietilpst nevienā no četrpadsmit, vienkārši aiziet prom.
-- Sort_order 99, lai tā vienmēr paliek saraksta beigās.
-- =============================================================

insert into public.spheres (slug, name_lv, name_en, name_ru, icon, sort_order)
values ('cits', 'Cits', 'Other', 'Другое', '✳️', 99)
on conflict (slug) do nothing;

insert into public.categories (slug, sphere_slug, name_lv, name_en, name_ru, sort_order)
values ('cits-prasme', 'cits', 'Cita prasme', 'Other skill', 'Другой навык', 1)
on conflict (slug) do nothing;
