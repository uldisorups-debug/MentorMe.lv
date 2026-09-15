-- =============================================================
-- Supabase drošības padomdevēja ieteikumi
--
-- Divas kļūdas, 38 brīdinājumi, viens info. Lielākā daļa ir reāla:
-- iekšējās funkcijas, kuras nevienam nevajadzētu izsaukt no ārpuses,
-- un funkcijas bez fiksēta search_path.
-- =============================================================


-- =============================================================
-- 1. FIKSĒTS search_path PIECĀM FUNKCIJĀM
--
-- Bez tā funkcija meklē tabulas pēc izsaucēja ceļa. Kāds, kurš var
-- izveidot savu shēmu, tur var nolikt viltus tabulu ar to pašu
-- nosaukumu, un funkcija klusi sāk strādāt ar to.
--
-- Pārrakstīt ķermeņus nevajag — visas piecas jau lieto pilnus
-- nosaukumus (public.coach_profiles, public.slugify) vai tikai
-- iebūvētās funkcijas, kas dzīvo pg_catalog.
-- =============================================================

alter function public.slugify(text)            set search_path = '';
alter function public.touch_updated_at()       set search_path = '';
alter function public.set_coach_slug()         set search_path = '';
alter function public.set_post_slug()          set search_path = '';
alter function public.referrer_source(text, text) set search_path = '';


-- =============================================================
-- 2. TRIGERU FUNKCIJAS NEDRĪKST IZSAUKT NO ĀRPUSES
--
-- Šīs ir trigeru funkcijas un iekšējie palīgi. Tās izsauc pati
-- datubāze, ne cilvēks. Bet PostgREST katru public shēmas funkciju
-- pataisa par /rest/v1/rpc/... galapunktu, tāpēc tās bija izsaucamas
-- arī no ielas.
--
-- Trigeris nostrādā neatkarīgi no tā, vai izsaucējam ir EXECUTE
-- tiesības, tāpēc atņemšana neko nesalauž.
-- =============================================================

revoke execute on function public.handle_new_user()            from anon, authenticated;
revoke execute on function public.set_coach_slug()             from anon, authenticated;
revoke execute on function public.set_post_slug()              from anon, authenticated;
revoke execute on function public.touch_updated_at()           from anon, authenticated;
revoke execute on function public.stamp_published_at()         from anon, authenticated;
revoke execute on function public.protect_verified_flag()      from anon, authenticated;
revoke execute on function public.protect_admin_flag()         from anon, authenticated;
revoke execute on function public.protect_review_columns()     from anon, authenticated;
revoke execute on function public.protect_post_moderation()    from anon, authenticated;
revoke execute on function public.limit_daily_publishing()     from anon, authenticated;
revoke execute on function public.validate_niches()            from anon, authenticated;
revoke execute on function public.block_used_category_delete() from anon, authenticated;

-- Iekšējie palīgi, ko izsauc citas funkcijas, ne lietotne
revoke execute on function public.visitor_fingerprint(uuid)    from anon, authenticated;
revoke execute on function public.referrer_source(text, text)  from anon, authenticated;

-- Konta dzēšanu drīkst tikai tas, kas ir ienācis; anonīmam tur nav ko darīt
revoke execute on function public.delete_own_account()         from anon;
revoke execute on function public.admin_delete_user(uuid, text, text) from anon;

-- Paliek izsaucamas ar nolūku:
--   increment_profile_views, increment_post_views, record_page_view — tās
--     sauc pati lapa, arī neielogotam apmeklētājam
--   is_admin — to izsauc RLS politikas izsaucēja vārdā; atņemot tiesības,
--     administratora piekļuve pārstātu strādāt. Ārpusē tā pasaka tikai to,
--     vai tu pats esi administrators


-- =============================================================
-- 3. REITINGS PĀRCEĻAS UZ PROFILA RINDU
--
-- coach_ratings bija SECURITY DEFINER skats, un padomdevējs to atzīmē
-- kā kļūdu. Definer tur bija tāpēc, ka atsauksmju tabula publiski vairs
-- nav lasāma — bez tā skats atdotu tukšumu.
--
-- Pareizākais risinājums ir vispār bez skata: vidējais vērtējums un
-- atsauksmju skaits glabājas profila rindā, kur tam arī vieta. Tas
-- atrisina divas lietas uzreiz — padomdevēja kļūdu un to, ka sākumlapa
-- katrā pārbūvē agregēja visu atsauksmju tabulu.
-- =============================================================

alter table public.coach_profiles
  add column if not exists avg_rating   numeric(3,2),
  add column if not exists review_count int not null default 0;

create or replace function public.refresh_coach_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.coach_id, old.coach_id);
begin
  update public.coach_profiles c
     set avg_rating   = sub.avg_rating,
         review_count = sub.review_count
    from (
      select round(avg(r.rating)::numeric, 2) as avg_rating,
             count(*)::int                    as review_count
        from public.reviews r
       where r.coach_id = target and r.is_visible
    ) sub
   where c.id = target;

  return null;
end;
$$;

revoke execute on function public.refresh_coach_rating() from anon, authenticated;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_coach_rating();

-- Esošie dati vienā piegājienā
update public.coach_profiles c
   set avg_rating   = sub.avg_rating,
       review_count = coalesce(sub.review_count, 0)
  from (
    select r.coach_id,
           round(avg(r.rating)::numeric, 2) as avg_rating,
           count(*)::int                    as review_count
      from public.reviews r
     where r.is_visible
     group by r.coach_id
  ) sub
 where c.id = sub.coach_id;

drop view if exists public.coach_ratings;
