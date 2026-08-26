-- =============================================================
-- Sfēras, grupas, reģioni un mācīšanas formāts
--
-- Lapa vairs nav tikai kouču direktorija. Koučings paliek — bet kā
-- viena sfēra starp četrpadsmit, ar saviem sertifikātiem.
-- =============================================================

-- =============================================================
-- 1. SFĒRAS
-- =============================================================

create table public.spheres (
  slug       text primary key,
  name_lv    text not null,
  name_en    text not null,
  name_ru    text not null,
  icon       text,
  sort_order int not null default 0
);

alter table public.spheres enable row level security;
create policy "Sfēras ir publiskas" on public.spheres for select using (true);

insert into public.spheres (slug, name_lv, name_en, name_ru, icon, sort_order) values
  ('koucings',   'Koučings un mentorings', 'Coaching & Mentoring',   'Коучинг и менторство', '🧭',  1),
  ('skola',      'Skola un eksāmeni',      'School & Exams',          'Школа и экзамены',     '📚',  2),
  ('valodas',    'Valodas',                'Languages',               'Языки',                '🗣️',  3),
  ('muzika',     'Mūzika un skaņa',        'Music & Sound',           'Музыка и звук',        '🎵',  4),
  ('amati',      'Amatniecība un rokdarbi','Crafts & Handwork',       'Ремёсла и рукоделие',  '🪵',  5),
  ('ediens',     'Ēdiens un gatavošana',   'Food & Cooking',          'Еда и кулинария',      '🍲',  6),
  ('tradicijas', 'Tautas tradīcijas',      'Folk Traditions',         'Народные традиции',    '💃',  7),
  ('daba',       'Daba un lauku dzīve',    'Nature & Country Life',   'Природа и село',       '🌾',  8),
  ('buve',       'Būvniecība un remonts',  'Building & Repair',       'Стройка и ремонт',     '🔨',  9),
  ('sports',     'Sports un ķermenis',     'Sports & Body',           'Спорт и тело',         '🏋️', 10),
  ('maksla',     'Māksla un radošums',     'Art & Creativity',        'Искусство и творчество','🎨', 11),
  ('tehnologijas','Tehnoloģijas',          'Technology',              'Технологии',           '💻', 12),
  ('nauda',      'Bizness un nauda',       'Business & Money',        'Бизнес и деньги',      '💼', 13),
  ('pieredze',   'Dzīve un pieredze',      'Life & Experience',       'Жизнь и опыт',         '🌍', 14);


-- =============================================================
-- 2. GRUPAS
--
-- Esošie slug'i (bizness, mental, attiecibas, dzive u.c.) saglabāti,
-- jo tie jau ir ierakstīti profilos. Tiem tikai pievienota sfēra.
-- =============================================================

alter table public.categories
  add column if not exists sphere_slug text references public.spheres(slug);

-- Esošos divpadsmit ieliekam pa sfērām
update public.categories set sphere_slug = 'koucings' where slug in
  ('mental','attiecibas','garigs','vecaki','lidz','cietums');
update public.categories set sphere_slug = 'nauda' where slug in
  ('bizness','finanses','karjera');
update public.categories set sphere_slug = 'sports'   where slug = 'sports';
update public.categories set sphere_slug = 'maksla'   where slug = 'radosa';
update public.categories set sphere_slug = 'pieredze' where slug = 'dzive';

insert into public.categories (slug, sphere_slug, name_lv, name_en, name_ru, sort_order) values
  -- Koučings un mentorings
  ('kouc-bizness','koucings','Biznesa koučings','Business Coaching','Бизнес-коучинг',1),
  ('kouc-dzive','koucings','Dzīves koučings','Life Coaching','Лайф-коучинг',2),
  ('kouc-vadiba','koucings','Vadītāju koučings','Executive Coaching','Коучинг руководителей',3),
  ('supervizija','koucings','Supervīzija','Supervision','Супервизия',4),

  -- Skola un eksāmeni
  ('matematika','skola','Matemātika','Mathematics','Математика',1),
  ('fizika','skola','Fizika','Physics','Физика',2),
  ('kimija','skola','Ķīmija','Chemistry','Химия',3),
  ('biologija','skola','Bioloģija','Biology','Биология',4),
  ('vesture','skola','Vēsture','History','История',5),
  ('eksameni-9','skola','9. klases eksāmeni','9th Grade Exams','Экзамены 9 класса',6),
  ('eksameni-12','skola','Centralizētie eksāmeni','Final State Exams','Централизованные экзамены',7),
  ('macisanas-prasmes','skola','Mācīšanās prasmes','Study Skills','Навыки обучения',8),

  -- Valodas
  ('val-angļu','valodas','Angļu valoda','English','Английский',1),
  ('val-krievu','valodas','Krievu valoda','Russian','Русский',2),
  ('val-vacu','valodas','Vācu valoda','German','Немецкий',3),
  ('val-latviesu','valodas','Latviešu valoda','Latvian','Латышский',4),
  ('val-latviesu-arz','valodas','Latviešu ārzemniekiem','Latvian for Foreigners','Латышский для иностранцев',5),
  ('val-sarunvaloda','valodas','Sarunvalodas prakse','Conversation Practice','Разговорная практика',6),

  -- Mūzika un skaņa
  ('gitara','muzika','Ģitāra','Guitar','Гитара',1),
  ('klavieres','muzika','Klavieres','Piano','Фортепиано',2),
  ('bungas','muzika','Bungas','Drums','Барабаны',3),
  ('kokle','muzika','Kokle','Kokle','Кокле',4),
  ('akordeons','muzika','Akordeons','Accordion','Аккордеон',5),
  ('vijole','muzika','Vijole','Violin','Скрипка',6),
  ('vokals','muzika','Vokāls','Singing','Вокал',7),
  ('muz-teorija','muzika','Mūzikas teorija','Music Theory','Теория музыки',8),
  ('skanu-rezija','muzika','Skaņu režija','Sound Engineering','Звукорежиссура',9),
  ('instr-skanosana','muzika','Instrumentu skaņošana','Instrument Tuning','Настройка инструментов',10),

  -- Amatniecība un rokdarbi
  ('kokapstrade','amati','Kokapstrāde','Woodworking','Работа с деревом',1),
  ('keramika','amati','Keramika','Pottery','Керамика',2),
  ('ausana','amati','Aušana','Weaving','Ткачество',3),
  ('adisana','amati','Adīšana un tamborēšana','Knitting & Crochet','Вязание',4),
  ('sussana','amati','Šūšana','Sewing','Шитьё',5),
  ('adas-darbi','amati','Ādas darbi','Leatherwork','Работа с кожей',6),
  ('rotkalsana','amati','Rotkalšana','Jewellery Making','Ювелирное дело',7),
  ('pinumi','amati','Pīšana','Basketry','Плетение',8),
  ('kalejs','amati','Kalēja amats','Blacksmithing','Кузнечное дело',9),

  -- Ēdiens un gatavošana
  ('maize','ediens','Maizes cepšana','Bread Baking','Выпечка хлеба',1),
  ('konservesana','ediens','Zapte un konservēšana','Jam & Preserving','Варенье и консервация',2),
  ('kupinasana','ediens','Kūpināšana','Smoking Food','Копчение',3),
  ('galas-apstrade','ediens','Gaļas apstrāde','Meat Processing','Обработка мяса',4),
  ('konditoreja','ediens','Konditoreja','Pastry','Кондитерское дело',5),
  ('latv-virtuve','ediens','Latviešu virtuve','Latvian Cuisine','Латышская кухня',6),
  ('sklandrausis','ediens','Sklandrausis un tradicionālie','Traditional Baking','Традиционная выпечка',7),
  ('siers','ediens','Siera siešana','Cheesemaking','Сыроварение',8),
  ('alus','ediens','Mājas alus un dzērieni','Home Brewing','Домашнее пивоварение',9),

  -- Tautas tradīcijas
  ('tautas-dejas','tradicijas','Tautas dejas','Folk Dancing','Народные танцы',1),
  ('tautas-dziesmas','tradicijas','Tautas dziesmas','Folk Singing','Народные песни',2),
  ('jani','tradicijas','Jāņi un vainagi','Midsummer & Wreaths','Лиго и венки',3),
  ('gadskartas','tradicijas','Gadskārtu svinēšana','Seasonal Festivals','Годовые праздники',4),
  ('tautas-terps','tradicijas','Tautas tērps','Folk Costume','Народный костюм',5),
  ('senas-prasmes','tradicijas','Senās prasmes','Ancient Skills','Старинные умения',6),

  -- Daba un lauku dzīve
  ('darzs','daba','Dārzkopība','Gardening','Садоводство',1),
  ('biskopiba','daba','Biškopība','Beekeeping','Пчеловодство',2),
  ('senosana','daba','Sēņošana un ogošana','Foraging','Сбор грибов и ягод',3),
  ('makskeresana','daba','Makšķerēšana','Fishing','Рыбалка',4),
  ('medibas','daba','Medības','Hunting','Охота',5),
  ('mezs','daba','Meža darbi','Forestry','Лесное дело',6),
  ('lopkopiba','daba','Lopkopība','Animal Husbandry','Животноводство',7),
  ('arstniecibas-augi','daba','Ārstniecības augi','Medicinal Herbs','Лекарственные травы',8),

  -- Būvniecība un remonts
  ('flizesana','buve','Flīzēšana','Tiling','Укладка плитки',1),
  ('apdare','buve','Iekšdarbi un apdare','Interior Finishing','Отделочные работы',2),
  ('elektriba','buve','Elektrība','Electrical Work','Электрика',3),
  ('santehnika','buve','Santehnika','Plumbing','Сантехника',4),
  ('jumts','buve','Jumta darbi','Roofing','Кровельные работы',5),
  ('metinasana','buve','Metināšana','Welding','Сварка',6),
  ('remonte-pats','buve','Izremontē pats','DIY Renovation','Ремонт своими руками',7),

  -- Sports un ķermenis
  ('joga','sports','Joga','Yoga','Йога',2),
  ('cinas-makslas','sports','Cīņas mākslas','Martial Arts','Единоборства',3),
  ('peldesana','sports','Peldēšana','Swimming','Плавание',4),
  ('skriesana','sports','Skriešana','Running','Бег',5),
  ('elposana','sports','Elpošana un atjaunošanās','Breathwork & Recovery','Дыхание и восстановление',6),

  -- Māksla un radošums
  ('gleznieciba','maksla','Glezniecība','Painting','Живопись',1),
  ('zimesana','maksla','Zīmēšana','Drawing','Рисование',2),
  ('fotografija','maksla','Fotogrāfija','Photography','Фотография',3),
  ('video','maksla','Video un montāža','Video & Editing','Видео и монтаж',4),
  ('rakstniecība','maksla','Rakstniecība','Writing','Писательство',5),
  ('teatris','maksla','Teātris un runa','Theatre & Speech','Театр и речь',6),

  -- Tehnoloģijas
  ('programmesana','tehnologijas','Programmēšana','Programming','Программирование',1),
  ('web','tehnologijas','Mājaslapu izstrāde','Web Development','Веб-разработка',2),
  ('dizains','tehnologijas','Dizaina rīki','Design Tools','Инструменты дизайна',3),
  ('mi','tehnologijas','Mākslīgais intelekts','Artificial Intelligence','Искусственный интеллект',4),
  ('datorprasmes','tehnologijas','Datorprasmes senioriem','Computer Skills for Seniors','Компьютер для пожилых',5),

  -- Bizness un nauda
  ('pardosana','nauda','Pārdošana','Sales','Продажи',4),
  ('marketings','nauda','Mārketings','Marketing','Маркетинг',5),
  ('gramatvediba','nauda','Grāmatvedība','Accounting','Бухгалтерия',6),
  ('uznemuma-sakums','nauda','Sava uzņēmuma sākšana','Starting a Business','Открытие бизнеса',7),

  -- Dzīve un pieredze
  ('izdzivosana','pieredze','Izdzīvošana','Survival','Выживание',2),
  ('parmainas','pieredze','Dzīves pārmaiņas','Life Transitions','Жизненные перемены',3),
  ('vecums','pieredze','Vecumdienas un aprūpe','Ageing & Care','Старение и уход',4),
  ('imigracija','pieredze','Iedzīvošanās Latvijā','Settling in Latvia','Обустройство в Латвии',5)
on conflict (slug) do nothing;

-- Bez sfēras nedrīkst palikt neviena grupa
alter table public.categories
  alter column sphere_slug set not null;

create index categories_sphere_idx on public.categories (sphere_slug, sort_order);


-- =============================================================
-- 3. REĢIONI
-- =============================================================

create table public.regions (
  slug       text primary key,
  name_lv    text not null,
  name_en    text not null,
  name_ru    text not null,
  sort_order int not null default 0
);

alter table public.regions enable row level security;
create policy "Reģioni ir publiski" on public.regions for select using (true);

insert into public.regions (slug, name_lv, name_en, name_ru, sort_order) values
  ('riga',       'Rīga',        'Riga',        'Рига',        1),
  ('pieriga',    'Pierīga',     'Riga Region', 'Рижский край',2),
  ('jurmala',    'Jūrmala',     'Jurmala',     'Юрмала',      3),
  ('liepaja',    'Liepāja',     'Liepaja',     'Лиепая',      4),
  ('ventspils',  'Ventspils',   'Ventspils',   'Вентспилс',   5),
  ('jelgava',    'Jelgava',     'Jelgava',     'Елгава',      6),
  ('daugavpils', 'Daugavpils',  'Daugavpils',  'Даугавпилс',  7),
  ('rezekne',    'Rēzekne',     'Rezekne',     'Резекне',     8),
  ('kurzeme',    'Kurzeme',     'Kurzeme',     'Курземе',     9),
  ('vidzeme',    'Vidzeme',     'Vidzeme',     'Видземе',    10),
  ('zemgale',    'Zemgale',     'Zemgale',     'Земгале',    11),
  ('latgale',    'Latgale',     'Latgale',     'Латгале',    12);


-- =============================================================
-- 4. FORMĀTS UN VIETA
--
-- Daļu var mācīt caur Zoom, daļu tikai klātienē. Meklētājam tas ir
-- svarīgākais filtrs pēc jomas: kokli attālināti neiemācīsies.
-- =============================================================

create type teaching_format as enum ('remote', 'in_person', 'hybrid');

alter table public.coach_profiles
  add column if not exists teaching_format teaching_format not null default 'remote',
  add column if not exists region_slug text references public.regions(slug),
  add column if not exists city text,
  add column if not exists for_tourists boolean not null default false;

create index coach_profiles_region_idx on public.coach_profiles (region_slug)
  where is_published;
create index coach_profiles_format_idx on public.coach_profiles (teaching_format)
  where is_published;
create index coach_profiles_tourists_idx on public.coach_profiles (for_tourists)
  where is_published and for_tourists;
