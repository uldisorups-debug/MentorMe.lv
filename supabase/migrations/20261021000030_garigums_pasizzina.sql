-- =============================================================
-- Jauna nozare: "Garīgā izaugsme un pašizziņa" ar piecām tēmām.
--
-- Līdz šim bija tikai viena tēma "Garīgā izaugsme" koučinga nozarē.
-- Reinkarnacioloģijas, regresoloģijas, meditācijas, dziedniecības un
-- numeroloģijas meistariem nebija, kur sevi ielikt, un cilvēks, kurš
-- meklē tieši to, tos neatrada. Esošā tēma "garigs" paliek, kur ir —
-- profilos ierakstītais nemainās.
-- =============================================================

insert into public.spheres (slug, icon, name_lv, name_en, name_ru, sort_order) values
  ('garigums', '🕯️', 'Garīgā izaugsme un pašizziņa', 'Spiritual Growth & Self-Discovery', 'Духовный рост и самопознание', 17)
on conflict (slug) do nothing;

insert into public.categories (slug, sphere_slug, name_lv, name_en, name_ru, sort_order) values
  ('reinkarnaciologija', 'garigums', 'Reinkarnacioloģija',                     'Reincarnationology',                          'Реинкарнациология',                         1),
  ('regresologija',      'garigums', 'Regresoloģija',                          'Regression therapy',                          'Регрессология',                             2),
  ('meditacija',         'garigums', 'Meditācija un apzinātības prakses',      'Meditation & Mindfulness',                    'Медитация и практики осознанности',         3),
  ('dziednieciba',       'garigums', 'Dziedniecība un enerģētiskās prakses',   'Healing & Energy Practices',                  'Целительство и энергетические практики',    4),
  ('numerologija',       'garigums', 'Numeroloģija un simboliskās pašizziņas sistēmas', 'Numerology & Symbolic Self-Discovery', 'Нумерология и символические системы самопознания', 5)
on conflict (slug) do nothing;
