-- =============================================================
-- Viens publicēts raksts dienā un vāka bildes izņemšana
-- =============================================================

-- =============================================================
-- 1. VIENS RAKSTS DIENĀ
--
-- Ierobežojums ir uz publicēšanu, ne uz rakstīšanu: melnrakstus var
-- taisīt cik grib, bet publiskajā blogā viens autors dienā parādās
-- vienu reizi. Tas nav sods — tas neļauj vienam cilvēkam aizņemt visu
-- pirmo lapu ar desmit rakstiem pēc kārtas.
--
-- Pārbaude datubāzē, ne tikai priekšpusē: priekšpusi var apiet.
-- =============================================================

create or replace function public.limit_daily_publishing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_count int;
begin
  -- Interesē tikai brīdis, kad raksts kļūst publicēts
  if new.status <> 'published' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'published' then
    return new;
  end if;

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
end;
$$;

create trigger posts_limit_daily
  before insert or update on public.posts
  for each row execute function public.limit_daily_publishing();


-- =============================================================
-- 2. VĀKA BILDE ĀRĀ
--
-- Kolonnu dzēšam, nevis atstājam neizmantotu: neizmantota kolonna
-- tipos ir aicinājums to nejauši atkal pieslēgt.
-- =============================================================

alter table public.posts drop column if exists cover_image_url;
