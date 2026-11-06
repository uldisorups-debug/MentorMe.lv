-- Jaunas lapas saknē: /baneri, kā arī tēmu, nozaru un vietu sadaļas.
-- Neviens profils šīs adreses neaizņem (pārbaudīts 2026-11-06).

create or replace function public.slug_is_reserved(candidate text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(coalesce(candidate, '')) = any (array[
    -- Valodas
    'lv', 'en', 'ru',

    -- Lapas ceļi, arī vecie, kas vēl tiek pāradresēti
    'profils', 'coach', 'blog', 'admin', 'auth', 'dashboard',
    'kontakti', 'privatums', 'sikdatnes', 'lietosanas-noteikumi',
    'ka-tas-darbojas', 'par-mums', 'api',
    'baneri', 'tema', 'nozare', 'vieta',

    -- Faili un metadati lapas saknē
    'robots', 'robots-txt', 'sitemap', 'sitemap-xml',
    'favicon', 'favicon-ico', 'icon', 'apple-icon',
    'opengraph-image', 'manifest', 'next', '_next',

    -- Šo vēl nav, bet kādreiz var būt. Lētāk tos vārdus aizņemt tagad.
    'cenas', 'meklet', 'kursi', 'mentori', 'kouci', 'meistari',
    'pieteikties', 'registreties', 'iestatijumi', 'par'
  ]);
$$;
