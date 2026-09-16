-- =============================================================
-- Loma seko publicēšanai, lai kurš to arī izdarītu
--
-- Līdz šim profiles.role = 'coach' uzlika redaktora kods, kad cilvēks
-- pats nospieda publicēt. Tas nozīmē, ka publicēšana pa citu ceļu —
-- piemēram, administrators no paneļa — lomu neuzliek, un cilvēks paliek
-- 'client'. Praksē viņš tad galvenes izvēlnē neredz "Mani raksti",
-- kaut viņa profils ir dzīvs.
--
-- Vienu noteikumu divās vietās uzturēt nevar. Tāpēc to pārceļam uz
-- datubāzi, kur tam ir tikai viena vieta.
--
-- Atpakaļ uz 'client' nekad neliekam: kas reiz ir publicējis, tam var
-- būt uzrakstīti raksti, un loma tos tur pieejamus.
-- =============================================================

create or replace function public.sync_coach_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_published then
    update public.profiles
       set role = 'coach'
     where id = new.user_id
       and role is distinct from 'coach';
  end if;
  return new;
end;
$$;

drop trigger if exists coach_profiles_sync_role on public.coach_profiles;
create trigger coach_profiles_sync_role
  after insert or update of is_published on public.coach_profiles
  for each row execute function public.sync_coach_role();


-- Tie, kas jau ir publicēti, bet lomu nedabūja
update public.profiles p
   set role = 'coach'
 where p.role is distinct from 'coach'
   and exists (
     select 1 from public.coach_profiles c
      where c.user_id = p.id and c.is_published
   );
