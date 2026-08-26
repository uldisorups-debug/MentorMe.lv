-- =============================================================
-- Atsauksmju ziņošana ("Report" poga uz katras atsauksmes)
--
-- Palaist tāpat kā pirmo: Supabase Dashboard -> SQL Editor -> Run
-- =============================================================

create table public.review_reports (
  id         uuid primary key default uuid_generate_v4(),
  review_id  uuid not null references public.reviews(id) on delete cascade,
  -- Ziņot drīkst arī nereģistrēts lietotājs, tāpēc null ir atļauts
  reporter_id uuid references public.profiles(id) on delete set null,
  reason      text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index review_reports_open_idx on public.review_reports (created_at desc)
  where not handled;

alter table public.review_reports enable row level security;

-- Ziņot var jebkurš — arī anonīms apmeklētājs, kurš pamanījis spamu.
-- reporter_id drīkst būt tikai savs vai tukšs, lai nevar apmelot citu.
create policy "Anyone can report a review" on public.review_reports
  for insert with check (
    reporter_id is null or reporter_id = auth.uid()
  );

-- Ziņojumus lasa tikai admins caur service_role, kas RLS apiet.
-- Tāpēc SELECT politikas šeit nav nevienas ar nolūku.
