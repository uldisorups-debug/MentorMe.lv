-- =============================================================
-- RLS politiku ātrums un trūkstošie indeksi
--
-- auth.uid() politikā tiek izrēķināts no jauna KATRAI rindai. Ietinot
-- to apakšvaicājumā, Postgres to izrēķina vienu reizi uz visu vaicājumu.
-- Nozīme nemainās ne par gramu — tas ir tas pats salīdzinājums, tikai
-- reizi, nevis tūkstoš reižu.
--
-- Pie četriem profiliem tas nav manāms. Pie tūkstoš atsauksmēm ir.
-- =============================================================


-- ---- profiles ----
drop policy if exists "Lietotājs redz savu profilu" on public.profiles;
create policy "Lietotājs redz savu profilu" on public.profiles
  for select using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);


-- ---- coach_profiles ----
drop policy if exists "Coach can manage own profile" on public.coach_profiles;
create policy "Coach can manage own profile" on public.coach_profiles
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- ---- coach_contacts ----
drop policy if exists "Koučs pārvalda savus kontaktus" on public.coach_contacts;
create policy "Koučs pārvalda savus kontaktus" on public.coach_contacts
  for all
  using (exists (select 1 from public.coach_profiles c
                  where c.id = coach_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.coach_profiles c
                       where c.id = coach_id and c.user_id = (select auth.uid())));


-- ---- posts ----
drop policy if exists "Autors pārvalda savus rakstus" on public.posts;
create policy "Autors pārvalda savus rakstus" on public.posts
  for all
  using (exists (select 1 from public.coach_profiles c
                  where c.id = posts.author_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.coach_profiles c
                       where c.id = posts.author_id and c.user_id = (select auth.uid())));


-- ---- reviews ----
drop policy if exists "Klients redz savu atsauksmi" on public.reviews;
create policy "Klients redz savu atsauksmi" on public.reviews
  for select using ((select auth.uid()) = client_id);

drop policy if exists "Coach can read own hidden reviews" on public.reviews;
create policy "Coach can read own hidden reviews" on public.reviews
  for select using (exists (select 1 from public.coach_profiles c
                             where c.id = reviews.coach_id
                               and c.user_id = (select auth.uid())));

-- Koučs nevar rakstīt atsauksmi pats sev. Pārcelt to uz citu profilu
-- neļauj protect_review_columns trigeris.
drop policy if exists "Clients can write reviews" on public.reviews;
create policy "Clients can write reviews" on public.reviews
  for insert with check (
    (select auth.uid()) = client_id
    and not exists (select 1 from public.coach_profiles c
                     where c.id = coach_id and c.user_id = (select auth.uid()))
  );

drop policy if exists "Clients can update own review" on public.reviews;
create policy "Clients can update own review" on public.reviews
  for update using ((select auth.uid()) = client_id)
  with check ((select auth.uid()) = client_id);


-- ---- review_reports ----
drop policy if exists "Anyone can report a review" on public.review_reports;
create policy "Anyone can report a review" on public.review_reports
  for insert with check (
    reporter_id is null or reporter_id = (select auth.uid())
  );


-- ---- admin_actions ----
drop policy if exists "Administratori raksta žurnālā" on public.admin_actions;
create policy "Administratori raksta žurnālā" on public.admin_actions
  for insert with check (
    (select public.is_admin()) and admin_id = (select auth.uid())
  );


-- =============================================================
-- TRŪKSTOŠIE INDEKSI SVEŠATSLĒGĀM
--
-- Bez tiem katra dzēšana vecāktabulā liek pilnībā izskatīt bērnu
-- tabulu, lai pārliecinātos, ka neviens uz to vairs nenorāda.
-- =============================================================

create index if not exists admin_actions_admin_idx
  on public.admin_actions (admin_id);
create index if not exists review_reports_reporter_idx
  on public.review_reports (reporter_id);
create index if not exists review_reports_review_idx
  on public.review_reports (review_id);
create index if not exists reviews_client_idx
  on public.reviews (client_id);


-- =============================================================
-- INDEKSI, KO NELIETO NEVIENS
--
-- Filtrēšana pēc vietas, formāta un meistarklasēm notiek pārlūkā, pār
-- jau ielādētu sarakstu. Šie trīs indeksi maksā rakstīšanas laiku un
-- neatgriež neko — tāpat kā tie seši, ko izņēmām agrāk.
--
-- Kad filtrēšana pāries uz servera pusi, tie jāatjauno.
-- =============================================================

drop index if exists public.coach_profiles_region_idx;
drop index if exists public.coach_profiles_format_idx;
drop index if exists public.coach_profiles_tourists_idx;
