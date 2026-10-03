-- =============================================================
-- Administratoram nav "viens raksts dienā" ierobežojuma
--
-- Ierobežojums sargā bloga pirmo lapu no viena autora, kas to aizpilda
-- ar desmit rakstiem pēc kārtas. Vietnes paša redakcijas raksti ir cits
-- gadījums: tos publicē sērijās (piemēram, vairāki raksti par saistītām
-- tēmām, kas atsaucas cits uz citu), un pusei sērijas gaidot rindā,
-- saites starp rakstiem ved uz vēl nepublicētām lapām.
-- =============================================================

create or replace function public.limit_daily_publishing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare today_count int;
begin
  if new.status <> 'published' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'published' then return new; end if;
  if public.is_admin() then return new; end if;

  select count(*) into today_count
    from public.posts p
   where p.author_id = new.author_id
     and p.status = 'published'
     and p.published_at >= current_date
     and p.id <> new.id;

  if today_count >= 1 then
    raise exception 'Viens raksts dienā. Nākamo varēsi publicēt rīt.'
      using errcode = 'P0002';
  end if;

  return new;
end; $$;
