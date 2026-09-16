-- =============================================================
-- Vecās kolonnas noņemšana
--
-- for_tourists bija ķeksītis "piedāvāju meistarklases / pieredzes". To
-- aizstāja experience_kinds ar četrām izvēlēm. Kolonnu atstājām uz
-- izvietošanas laiku, lai vecais kods vēl varētu strādāt; tagad jaunais
-- kods ir dzīvs, un to nelasa vairs neviens.
--
-- Dati nepazūd: tie jau ir pārnesti uz experience_kinds.
-- =============================================================

alter table public.coach_profiles drop column if exists for_tourists;
