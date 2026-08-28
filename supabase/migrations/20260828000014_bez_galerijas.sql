-- =============================================================
-- Galerija un sertifikāta fails ārā
--
-- Krātuve bezmaksas plānā ir viens gigabaits. Ar galeriju un
-- sertifikātu viens cilvēks varēja aizņemt 20 MB, un tūkstotis
-- cilvēku tur neietilptu ne tuvu. Ar vienu avatāru ietilpst.
--
-- Sertifikātu tagad apraksta vārdiem. Administrators to pārbauda
-- sarakstoties, ne skatoties failā — un tas tāpat bija vienīgais,
-- ko tas fails ļāva izdarīt.
--
-- Kolonnas gallery_urls un cert_proof_url šeit netiek dzēstas.
-- Tajās ir dati, un dzēšana ir neatgriezeniska. Kods tās vairs
-- nelasa; iztīrīt tās var vēlāk, kad būs skaidrs, ka nekas netrūkst.
-- =============================================================

alter table public.coach_profiles
  add column if not exists cert_note text;

alter table public.coach_profiles
  drop constraint if exists coach_cert_note_len;

alter table public.coach_profiles
  add constraint coach_cert_note_len
  check (cert_note is null or char_length(cert_note) <= 400);
