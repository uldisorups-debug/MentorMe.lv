-- =============================================================
-- Atsauksmes: anonimitāte un dzēšanas noteikums
--
-- Atsauksmi joprojām var atstāt tikai ar kontu — tā nevar aizskriet
-- garām un nomest izdomātu vērtējumu. Bet autors var izvēlēties
-- nerādīt savu vārdu, lai atsauksme būtu godīga, nevis pieklājīga.
-- =============================================================

alter table public.reviews
  add column if not exists is_anonymous boolean not null default false;

-- Autors savu atsauksmi dzēst nevar. Tas neļauj koučam panākt, ka
-- neērta atsauksme pazūd pēc spiediena uz cilvēku. Dzēš administrators
-- caur service_role, kas RLS apiet.
drop policy if exists "Clients can delete own review" on public.reviews;

-- Labot savu atsauksmi drīkst — kļūdas gadās, un liegt to būtu skarbi.
-- coach_id un client_id mainīt nevar; to sargā esošā with check daļa.
