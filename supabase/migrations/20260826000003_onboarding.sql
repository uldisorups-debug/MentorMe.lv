-- =============================================================
-- Lomas izvēles atzīmēšana
--
-- profiles.role noklusējums ir 'client', tāpēc pēc tā vien nevar
-- pateikt, vai cilvēks lomu tiešām izvēlējās, vai tikai reģistrējās.
-- Šis lauks to atrisina: null = vēl nav izvēlējies.
-- =============================================================

alter table public.profiles
  add column if not exists onboarded_at timestamptz;
