-- =============================================================
-- 1. Skaistums un stils kā sava nozare
--
-- Frizieris, kurš pārdod meistarklases, ienāca, neatrada sev vietu un
-- aizgāja — nozaru sarakstā nebija nekā, kas viņu nosauktu. Frizieri,
-- grimētāji, manikīra un skropstu meistari māca citus tieši tāpat kā
-- keramiķi vai pavāri, un meistarklases ir viņu galvenais formāts.
-- =============================================================

insert into public.spheres (slug, name_lv, name_en, name_ru, icon, sort_order)
values ('skaistums', 'Skaistums un stils', 'Beauty & Style',
        'Красота и стиль', '✂️', 6)
on conflict (slug) do nothing;

insert into public.categories (slug, sphere_slug, name_lv, name_en, name_ru, sort_order) values
  ('frizieri',     'skaistums', 'Friziera māksla',         'Hairdressing',          'Парикмахерское искусство', 1),
  ('barddzinis',   'skaistums', 'Bārddzinis',              'Barbering',             'Барбер',                   2),
  ('grims',        'skaistums', 'Grims',                   'Make-up',               'Макияж',                   3),
  ('manikirs',     'skaistums', 'Manikīrs un pedikīrs',    'Nails',                 'Маникюр и педикюр',        4),
  ('skropstas',    'skaistums', 'Skropstas un uzacis',     'Lashes & Brows',        'Ресницы и брови',          5),
  ('kosmetologija','skaistums', 'Kosmetoloģija',           'Cosmetology',           'Косметология',             6),
  ('stils',        'skaistums', 'Stils un tēls',           'Style & Image',         'Стиль и имидж',            7)
on conflict (slug) do nothing;


-- =============================================================
-- 2. Nozaru secība — koučings vairs nav pirmais
--
-- Secība nosaka, ko cilvēks ierauga vispirms: nozaru izvēlnē un
-- sākumlapas "Zināšanu rādītājā". Ar koučingu pirmajā vietā lapa
-- no pirmā skatiena izskatījās pēc koučiem domātas — tieši tas
-- iespaids, ar kuru frizieris aizgāja. Tagad sākumā ir tas, ko meklē
-- visvairāk cilvēku (skola, valodas, mūzika, rokdarbi), un koučings
-- ar biznesu ir tuvāk beigām. Neviena nozare netiek noņemta, un
-- profilos ierakstītais nemainās.
-- =============================================================

update public.spheres as s
   set sort_order = v.sort_order
  from (values
    ('skola',         1),
    ('valodas',       2),
    ('muzika',        3),
    ('amati',         4),
    ('ediens',        5),
    ('skaistums',     6),
    ('sports',        7),
    ('maksla',        8),
    ('tradicijas',    9),
    ('daba',         10),
    ('buve',         11),
    ('tehnologijas', 12),
    ('psihologija',  13),
    ('koucings',     14),
    ('nauda',        15),
    ('pieredze',     16)
  ) as v(slug, sort_order)
 where s.slug = v.slug;
