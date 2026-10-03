-- =============================================================
-- Raksta teksta robežas
--
-- Redaktors tās pārbauda pats (src/lib/post-validation.ts), bet raksti
-- tiek saglabāti tieši no pārlūka caur Supabase API, un priekšpusi var
-- apiet. Tāpēc tie paši noteikumi arī te.
--
-- 1. Ne vairāk par 30 000 rakstzīmēm. Garākais esošais raksts ir ap
--    11 000.
-- 2. Ne vairāk par 400 zīmēm *, _ vai ~ vienā rindkopā. Bloga
--    markdown apstrādātājs (marked) tās rindkopā salīdzina pa pāriem,
--    un bez pāriem darbs aug kvadrātiski: viena rindkopa ar 8000 "_a "
--    raksta lapas ģenerēšanu aizkavē par septiņām sekundēm, un, tā kā
--    raksti tiek ģenerēti būvējot, arī visas vietnes build. Esošajos
--    rakstos maksimums ir 60. Saraksta punktu zīmes rindas sākumā
--    neskaitām.
-- =============================================================

alter table public.posts
  add constraint posts_content_length check (length(content) <= 30000);

create or replace function public.validate_post_content()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  block text;
  marks int;
begin
  for block in
    select regexp_split_to_table(new.content, E'\\r?\\n[ \\t]*\\r?\\n')
  loop
    block := regexp_replace(block, '^[ \t]*[*+-][ \t]', '', 'gn');
    marks := length(block) - length(regexp_replace(block, '[_*~]', '', 'g'));
    if marks > 400 then
      raise exception 'Vienā rindkopā ir vairāk nekā 400 zīmes *, _ vai ~. Sadali tekstu rindkopās ar tukšu rindu.'
        using errcode = 'P0006';
    end if;
  end loop;
  return new;
end;
$$;

create trigger posts_validate_content
  before insert or update of content on public.posts
  for each row execute function public.validate_post_content();
