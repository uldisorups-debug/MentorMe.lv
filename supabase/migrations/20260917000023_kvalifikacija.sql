-- =============================================================
-- Kvalifikācija — filtrs, kas der visām nozarēm
--
-- Lietotāja jautājums: "Man kā klientam būtu vērtīgi, ja varētu filtrēt
-- pēc kritērija 'sertificēts', ar nodomu, ka vēlētos atrast tiešām
-- profesionāli."
--
-- Filtrs jau bija, bet divkārt nederīgs. Pirmkārt, tas parādījās tikai
-- tad, kad izvēlēta nozare "Koučings" — keramiķim, psihologam vai
-- matemātikas skolotājam tāda filtra nebija vispār. Otrkārt, tā izvēles
-- bija ICF ACC / PCC / MCC / MetaCoach, kas ārpus koučinga neko nenozīmē.
--
-- Dati to apstiprina: no septiņiem profiliem neviens ICF līmeni nebija
-- izvēlējies. Abi, kam sertifikāti ir, tos aprakstīja brīvā tekstā —
-- CISSP un ISO auditors vienam, koučinga skola un Geštalta institūts
-- otram. Ne viens, ne otrs ICF sarakstā neietilpst.
--
-- Tāpēc statuss, kas der ikvienam, un konkrētais — brīvā tekstā, kur tas
-- jau tāpat bija.
-- =============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'qualification_level') then
    create type public.qualification_level as enum
      ('certified', 'none', 'studying');
  end if;
end $$;

-- null nozīmē "nav norādīts" — tā ir atbilde, ne tukšums
alter table public.coach_profiles
  add column if not exists qualification public.qualification_level;

/*
 * Pārnesam tikai apstiprinošos gadījumus.
 *
 * certification = 'none' ir kolonnas noklusējums, ne cilvēka teiktais:
 * to nes arī katrs, kurš lauku nav aizticis. Ierakstīt viņiem
 * "sertifikāta nav" nozīmētu likt vārdus mutē. Tie paliek pie "nav
 * norādīts", līdz pasaka paši.
 */
update public.coach_profiles
   set qualification = 'certified'
 where certification in ('acc', 'pcc', 'mcc', 'metacoach', 'other')
   and qualification is null;

/*
 * Veco certification kolonnu neaiztiekam. Kods to vairs nelasa, bet abi
 * ieraksti tur ir īsti, un dzēst tos kopā ar pārējo izmaiņu nozīmētu
 * divas atšķirīgas darbības vienā solī. To var izdarīt atsevišķi vēlāk.
 */
