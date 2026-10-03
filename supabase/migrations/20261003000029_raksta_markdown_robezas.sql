-- =============================================================
-- Raksta teksta robežas, kuras marked spēj apstrādāt
--
-- marked (markdown parsētājs) dziļi ligzdotus citātus un sarakstus
-- apstrādā rekursīvi: ap 2000 ">" pēc kārtas pārplūdina steku, un
-- raksta lapa krīt ar RangeError. Formatēšanas zīmes bez pāra tas
-- meklē līdz rindkopas beigām katru no jauna — 8000 × "_a " apstrāde
-- ilga 7 sekundes. /blog/[slug] ģenerē būvējot, tāpēc viens šāds raksts
-- varēja apturēt visu `next build`.
--
-- Tās pašas pārbaudes ir src/lib/post-validation.ts (contentLimitError),
-- tur arī paskaidrots, kāpēc tieši šie skaitļi. Tiem jāsakrīt: autors
-- atteikumu redz jau redaktorā, šeit apstājas tikai tas, kurš redaktoru
-- apiet un raksta tieši caur API. Garuma robeža (40 000) jau ir
-- post_content_len.
--
-- Trigeris, nevis CHECK: CHECK Postgres pārbauda pie katras rindas
-- izmaiņas, arī increment_post_views, kas skaita katru skatījumu. Šis
-- strādā tikai tad, kad mainās pats teksts.
-- =============================================================

create or replace function public.post_content_limit_error(content text)
returns text
language sql
immutable
set search_path = ''
as $$
  with normalized as (
    -- marked jaunu rindu uzskata gan \r\n, gan vientuļu \r
    select regexp_replace(content, E'\r\n?', E'\n', 'g') as body
  )
  select case
    -- Rindas sākumā atstarpes, ">" un saraksta zīmes kopā ne vairāk par 100
    when body ~ E'(^|\n)([ \t>]|[*+-][ \t]|[0-9]{1,9}[.)][ \t]){101}' then
      'Pārāk dziļa atkāpe: rindas sākumā atstarpes, citātu zīmes (>) un saraksta zīmes kopā drīkst būt ne vairāk kā 100.'
    when body ~ E'[ \t]{201}' then
      'Tekstā ir vairāk nekā 200 atstarpes pēc kārtas.'
    -- Formatēšanas zīmes × rindkopas garums, saskaitīts pa rindkopām.
    -- Rindkopas dala tukša rinda un saraksta punkts — tikai tur, kur
    -- jaunu bloku noteikti sāk arī marked.
    when (
      select coalesce(sum(
               (char_length(paragraph) - char_length(translate(paragraph, '*_~[', '')))::bigint
               * char_length(paragraph)
             ), 0)
        from regexp_split_to_table(body, E'\n[ \t]*\n|\n(?= {0,3}[*+-] +[^ \t\n])') as paragraph
    ) > 8000000 then
      'Garās rindkopās ir pārāk daudz formatēšanas zīmju (* _ ~ [). Sadali tekstu īsākās rindkopās ar tukšu rindu starp tām.'
  end
  from normalized
$$;

create or replace function public.check_post_content()
returns trigger
language plpgsql
-- Lai varētu izsaukt post_content_limit_error, kas no ārpuses nav pieejama
security definer
set search_path = ''
as $$
declare problem text;
begin
  problem := public.post_content_limit_error(new.content);
  if problem is not null then
    raise exception '%', problem using errcode = '23514';
  end if;
  return new;
end; $$;

create trigger posts_content_limits
  before insert or update of content on public.posts
  for each row execute function public.check_post_content();

-- Iekšējie palīgi — PostgREST tos citādi pataisītu par /rest/v1/rpc/...
-- galapunktiem, un pārbaudi varētu darbināt ar jebkura garuma tekstu
revoke execute on function public.post_content_limit_error(text) from public, anon, authenticated;
revoke execute on function public.check_post_content()           from public, anon, authenticated;


-- =============================================================
-- Esošie raksti
--
-- Trigeris vecos rakstus nepārbauda. Ja kāds jau pārkāpj robežas,
-- migrācija neapstājas: renderMarkdown tādu rakstu parāda kā vienkāršu
-- tekstu, un autors to izlabos, nākamreiz saglabājot. Paziņojums
-- pasaka, kuri tie ir.
-- =============================================================

do $$
declare post record;
begin
  for post in
    select slug, public.post_content_limit_error(content) as problem
      from public.posts
     where public.post_content_limit_error(content) is not null
  loop
    raise notice 'Raksts "%" pārsniedz robežas: %', post.slug, post.problem;
  end loop;
end $$;
