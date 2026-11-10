/**
 * Unikāls teksts tēmu, nozaru un vietu lapām.
 *
 * Bez tā visas ~70 tēmu lapas atšķīrās tikai ar vienu vārdu virsrakstā
 * un trim kartītēm. Search Console (2026. gada novembris): "biznesa
 * koučings" 76. vietā, "pārdošanas kursi" 90. vietā. Google tādu lapu
 * redz kā saraksta šablonu, nevis atbildi uz jautājumu.
 *
 * Teksts ir tikai latviski: pēc šiem vārdiem meklē latviski, un tulkots
 * šablons angļu un krievu lapām neko nedotu. Atslēga ir "veids/slug".
 */

export type TopicGuide = {
  title: string
  body: string[]
  faq: [string, string][]
  /** Saistītie raksti: [slug, virsraksts] */
  posts?: [string, string][]
}

const KOUCS_RAKSTS: [string, string] = [
  'koucs-kas-tas-ir-un-ka-izveleties-koucu',
  'Kas ir koučs un kā izvēlēties kouču Latvijā',
]
const CENAS_KOUCS: [string, string] = [
  'cik-maksa-koucs-mentors-latvija',
  'Cik maksā koučs un mentors Latvijā',
]
const CENAS_STUNDAS: [string, string] = [
  'cik-maksa-privatstundas-riga-latvija',
  'Cik maksā privātstundas Rīgā un Latvijā',
]

export const TOPIC_GUIDES: Record<string, TopicGuide> = {
  'nozare/koucings': {
    title: 'Kā izvēlēties kouču vai mentoru',
    body: [
      'Koučs ar jautājumiem palīdz tev pašam nonākt līdz lēmumam un pie tā turēties. Mentors dalās ar savu pieredzi un pasaka, ko viņš darītu tavā vietā. Ja zini, kurp gribi nonākt, bet nezini kā, meklē mentoru. Ja nezini, ko īsti gribi, sāc ar kouču.',
      'Šajā lapā ir biznesa, vadītāju un dzīves kouči, kā arī mentori ar pieredzi savā nozarē. Katrā profilā redzama cena, pilsēta, sertifikācija un tas, vai sesijas notiek klātienē vai attālināti. Lielākā daļa piedāvā īsu iepazīšanās sarunu, pirms vienojaties par sadarbību.',
    ],
    faq: [
      ['Cik maksā koučinga sesija Latvijā?', 'MentorMe.lv profilos koučinga sesija maksā no 15 līdz 180 eiro, visbiežāk ap 50 eiro. Cena atkarīga no kouča sertifikācijas, specializācijas un sesijas garuma.'],
      ['Vai koučam jābūt sertificētam?', 'Likums to neprasa. ICF vai līdzīga sertifikācija parāda, ka koučs ir mācījies un nostrādājis noteiktu stundu skaitu. Sarakstā sertificētos koučus var atlasīt ar filtru.'],
      ['Cik sesiju vajag?', 'Konkrētam mērķim parasti pietiek ar sešām līdz divpadsmit sesijām, vienu reizi divās nedēļās.'],
    ],
    posts: [KOUCS_RAKSTS, CENAS_KOUCS, ['ka-atrast-mentoru', 'Kā atrast mentoru: 7 soļi']],
  },
  'tema/kouc-bizness': {
    title: 'Kad uzņēmējam noder biznesa koučs',
    body: [
      'Biznesa koučings ir regulāras sarunas ar cilvēku, kurš palīdz uzņēmuma īpašniekam vai vadītājam ieraudzīt, kur uzņēmums zaudē laiku un naudu, un nolemt, ko mainīt. Koučs nevada uzņēmumu tavā vietā. Viņš uzdod jautājumus, kurus pats sev neuzdod, un nākamajā reizē pajautā, kas ir izdarīts.',
      'Pie biznesa kouča visbiežāk nāk trīs situācijās: uzņēmums aug ātrāk, nekā īpašnieks paspēj, peļņa stāv uz vietas, vai vadītājs dara visu pats un netiek līdz stratēģijai. Ja vajag konkrētu padomu no cilvēka, kurš tavu nozari pazīst, meklē biznesa mentoru.',
    ],
    faq: [
      ['Cik maksā biznesa koučs?', 'MentorMe.lv profilos biznesa koučinga sesija visbiežāk maksā no 50 līdz 180 eiro. Programmām uzņēmumiem cenu nosaka individuāli.'],
      ['Ar ko biznesa koučs atšķiras no konsultanta?', 'Konsultants izpēta situāciju un iedod gatavu risinājumu. Koučs palīdz tev pašam to atrast un ieviest, tāpēc rezultāts paliek arī pēc sadarbības beigām.'],
      ['Vai biznesa koučings notiek attālināti?', 'Jā, lielākā daļa kouču strādā gan klātienē, gan tiešsaistē. Formāts ir redzams katrā profilā.'],
    ],
    posts: [CENAS_KOUCS, ['ka-sakt-biznesu-latvija-biznesa-mentors', '7 jautājumi biznesa mentoram'], KOUCS_RAKSTS],
  },
  'tema/kouc-vadiba': {
    title: 'Vadītāju koučings: kam tas domāts',
    body: [
      'Vadītāju koučings ir domāts cilvēkiem, kuri vada komandu un kuru lēmumi ietekmē citus: uzņēmumu vadītājiem, nodaļu vadītājiem un tiem, kas tikko kļuvuši par vadītājiem. Sarunās strādā ar deleģēšanu, sarežģītām sarunām ar darbiniekiem, prioritātēm un paša vadītāja slodzi.',
      'Bieži to apmaksā darba devējs, un tad sadarbības sākumā vienojas par mērķiem trīs pusēm: vadītājs, viņa vadītājs un koučs. Sesiju saturs paliek konfidenciāls.',
    ],
    faq: [
      ['Cik ilgi notiek vadītāju koučings?', 'Parasti no trim līdz sešiem mēnešiem, ar sesiju reizi divās vai trijās nedēļās.'],
      ['Vai jaunam vadītājam vajag kouču?', 'Pirmais gads vadītāja amatā ir brīdis, kad koučs dod visvairāk: jāiemācās vadīt bijušos kolēģus un pārstāt darīt visu pašam.'],
      ['Kā izvēlēties vadītāju kouču?', 'Skaties, vai koučam ir pieredze ar vadītājiem tavā līmenī, un sarunā iepazīšanās sarunu. Pēc 20 minūtēm parasti ir skaidrs, vai ar šo cilvēku sanāk.'],
    ],
    posts: [KOUCS_RAKSTS, CENAS_KOUCS],
  },
  'tema/kouc-dzive': {
    title: 'Ko dara dzīves koučs',
    body: [
      'Dzīves koučs palīdz tikt skaidrībā par to, ko gribi mainīt, un spert pirmos soļus: darba maiņa, attiecības ar sevi, ieradumi, līdzsvars starp darbu un pārējo dzīvi. Koučs strādā ar tagadni un nākotni. Viņš neārstē un neanalizē pagātni.',
      'Ja ir ilgstoša trauksme, nomāktība vai izdegšana, vispirms vajag psihologu vai ārstu. Koučs noder tad, kad spēks ir, bet trūkst virziena vai disciplīnas.',
    ],
    faq: [
      ['Ar ko dzīves koučs atšķiras no psihologa?', 'Psihologs strādā ar emocionālām grūtībām un to cēloņiem. Koučs strādā ar mērķiem un to, kā pie tiem nonākt.'],
      ['Cik maksā dzīves koučs?', 'MentorMe.lv profilos sesija maksā no 15 eiro, visbiežāk ap 50 eiro. Daļa kouču, kas vēl krāj prakses stundas, strādā bez maksas.'],
      ['Vai var strādāt ar kouču attālināti?', 'Jā. Dzīves koučings tiešsaistē darbojas tikpat labi kā klātienē, un tā var izvēlēties kouču no jebkuras Latvijas vietas.'],
    ],
    posts: [['izdegsana-darba-kouc-vai-psihologs', 'Kad palīdzēs koučs un kad vajag psihologu'], CENAS_KOUCS],
  },
  'nozare/nauda': {
    title: 'Biznesa mentori, konsultanti un kursi',
    body: [
      'Šajā lapā ir cilvēki, kas māca un konsultē par uzņēmuma vadību, pārdošanu, mārketingu, finansēm, grāmatvedību un karjeru. Daļa strādā kā mentori un dalās ar savu uzņēmēja pieredzi. Citi vada kursus un apmācības komandām.',
      'Ja tikai sāc, meklē mentoru, kurš pats ir izveidojis uzņēmumu tavā nozarē. Ja uzņēmums jau strādā un vajag sakārtot vienu jomu, piemēram, pārdošanu vai finanšu uzskaiti, meklē šauru speciālistu.',
    ],
    faq: [
      ['Cik maksā biznesa mentors?', 'MentorMe.lv profilos konsultācija maksā no 29 eiro, visbiežāk ap 90 līdz 100 eiro. Daži mentori pirmo sarunu piedāvā bez maksas.'],
      ['Kur atrast mentoru biznesa sākšanai?', 'Atlasi tēmu "Sava uzņēmuma sākšana" un uzraksti tieši cilvēkam, kura pieredze ir vistuvākā tavai idejai.'],
      ['Vai ir apmācības uzņēmuma komandai?', 'Jā. Vairāki pasniedzēji vada pārdošanas, vadības un mārketinga apmācības uzņēmumos. Par saturu un cenu vienojies tieši ar pasniedzēju.'],
    ],
    posts: [['ka-sakt-biznesu-latvija-biznesa-mentors', 'Kā sākt biznesu Latvijā: 7 jautājumi mentoram'], CENAS_KOUCS],
  },
  'tema/bizness': {
    title: 'Biznesa vadības mentori un apmācības',
    body: [
      'Biznesa un vadības tēmā ir uzņēmēji, vadītāji un konsultanti, kas palīdz sakārtot uzņēmuma procesus, komandu un stratēģiju. Pie viņiem nāk gan īpašnieki, kuri grib augt, gan vadītāji, kuriem vajag skatu no malas.',
      'Pirms raksti, formulē vienu jautājumu, ko gribi atrisināt. "Kā palielināt apgrozījumu" ir par plašu. "Kāpēc klienti nepērk otro reizi" ir jautājums, uz kuru mentors var atbildēt vienā sarunā.',
    ],
    faq: [
      ['Kā izvēlēties biznesa mentoru?', 'Izvēlies cilvēku, kurš pats ir izdarījis to, ko tu gribi izdarīt, un nesen. Pieredze, kas vecāka par desmit gadiem, strauji mainīgās nozarēs var vairs nederēt.'],
      ['Cik bieži jātiekas ar mentoru?', 'Parasti pietiek ar vienu sarunu mēnesī. Starp sarunām tu dari, un nākamajā reizē pārrunājat, kas sanāca.'],
      ['Vai mentors var palīdzēt ar biznesa plānu?', 'Jā. Mentors neuzrakstīs to tavā vietā, bet pateiks, kuri pieņēmumi tavā plānā nav reāli.'],
    ],
    posts: [['ka-sakt-biznesu-latvija-biznesa-mentors', '7 jautājumi biznesa mentoram'], ['ka-atrast-mentoru', 'Kā atrast mentoru: 7 soļi']],
  },
  'nozare/skola': {
    title: 'Privātskolotāji skolas priekšmetos un eksāmeniem',
    body: [
      'Privātskolotājs palīdz tad, kad klasē temats paskrien garām vai tuvojas eksāmens. Individuālā nodarbībā skolotājs redz, kurā vietā skolēns pazūd, un izskaidro tieši to, nevis visu tēmu no sākuma.',
      'Eksāmenam vislabāk sākt gatavoties vairākus mēnešus iepriekš, ar vienu vai divām nodarbībām nedēļā. Lai aizlāpītu vienu tēmu, bieži pietiek ar divām līdz četrām reizēm. Katrā profilā redzama cena un tas, vai skolotājs māca klātienē vai attālināti.',
    ],
    faq: [
      ['Cik maksā privātstunda?', 'MentorMe.lv profilos privātstunda visbiežāk maksā no 15 līdz 50 eiro. Cena atkarīga no priekšmeta, klases un skolotāja pieredzes.'],
      ['Vai privātskolotājs var mācīt attālināti?', 'Jā. Matemātiku, valodas un citus teorētiskos priekšmetus daudzi māca tiešsaistē ar kopīgu ekrānu.'],
      ['Kā izvēlēties privātskolotāju?', 'Pajautā, kā skolotājs pārbauda, ko skolēns jau prot, un sarunā vienu izmēģinājuma nodarbību, pirms maksā par vairākām.'],
    ],
    posts: [CENAS_STUNDAS, ['privatskolotajs-matematika-centralizetais-eksamens', 'Privātskolotājs matemātikā pirms eksāmena'], ['ka-klut-par-privatskolotaju-pirmie-skoleni', 'Kā kļūt par privātskolotāju']],
  },
  'nozare/tehnologijas': {
    title: 'Mentori un pasniedzēji tehnoloģijās',
    body: [
      'Šeit ir programmētāji, mājaslapu izstrādātāji, mākslīgā intelekta un digitālo rīku pratēji, kas māca individuāli vai vada kursus. Daļa palīdz iesācējiem saprast pamatus, citi strādā ar uzņēmumiem, kas grib ieviest jaunus rīkus.',
      'Programmēšanu visātrāk iemācās, būvējot savu projektu kopā ar cilvēku, kurš to dara ikdienā. Mentors parāda, kur kods ir lieki sarežģīts, un pasaka, ko mācīties nākamo.',
    ],
    faq: [
      ['Cik maksā programmēšanas privātstunda?', 'MentorMe.lv profilos nodarbība tehnoloģiju jomā maksā no 25 eiro, visbiežāk ap 40 eiro.'],
      ['Vai var iemācīties programmēt bez priekšzināšanām?', 'Jā. Ar vienu vai divām nodarbībām nedēļā un regulāru patstāvīgu darbu pirmo vienkāršo projektu var uzbūvēt dažu mēnešu laikā.'],
      ['Kur atrast kādu, kas iemāca lietot mākslīgo intelektu darbā?', 'Atlasi tēmu "Mākslīgais intelekts". Vairāki pasniedzēji vada gan individuālas nodarbības, gan apmācības komandām.'],
    ],
    posts: [CENAS_STUNDAS],
  },
  'tema/mi': {
    title: 'Mākslīgā intelekta apmācības un mentori',
    body: [
      'Mākslīgā intelekta rīki darbā ietaupa stundas, ja zina, kā tiem jautāt un kur tiem nevar uzticēties. Šajā lapā ir cilvēki, kas to māca praktiski: kā rakstīt uzdevumus, kā automatizēt atkārtotus darbus un kā ieviest rīkus komandā.',
      'Individuālā nodarbībā strādājat ar taviem uzdevumiem un taviem dokumentiem, nevis vispārīgiem piemēriem. Uzņēmumiem pasniedzēji vada apmācības visai komandai.',
    ],
    faq: [
      ['Vai mākslīgā intelekta apmācībām vajag tehniskas zināšanas?', 'Nē. Lielākā daļa nodarbību ir domātas cilvēkiem, kas strādā ar tekstu, skaitļiem un klientiem, nevis programmētājiem.'],
      ['Cik ilgā laikā var iemācīties lietot MI darbā?', 'Pamatus var apgūt divās līdz trijās nodarbībās. Tālāk prasme aug, lietojot rīkus katru dienu.'],
      ['Vai ir apmācības uzņēmumiem?', 'Jā. Par saturu, ilgumu un cenu vienojies tieši ar pasniedzēju.'],
    ],
  },
  'vieta/riga': {
    title: 'Mentori, kouči un privātskolotāji Rīgā',
    body: [
      'Rīgā ir lielākā izvēle: biznesa un dzīves kouči, mentori, privātskolotāji, valodu pasniedzēji un amata meistari. Daudzi strādā gan klātienē Rīgā, gan attālināti, tāpēc formātu var mainīt atkarībā no nedēļas.',
      'Ja klātiene nav obligāta, paskaties arī uz cilvēkiem no citām Latvijas vietām. Attālinātas nodarbības bieži ir lētākas, un izvēle kļūst vairākas reizes lielāka.',
    ],
    faq: [
      ['Cik maksā privātstunda Rīgā?', 'MentorMe.lv profilos privātstunda visbiežāk maksā no 15 līdz 50 eiro. Rīgā cenas parasti ir augstākas nekā reģionos.'],
      ['Kur Rīgā atrast biznesa kouču?', 'Šajā lapā atlasi tēmu "Biznesa koučings". Katrā profilā redzama cena un tas, vai koučs tiekas klātienē.'],
      ['Vai var tikties klātienē?', 'Jā. Profilā ir norādīts, vai cilvēks strādā klātienē, attālināti vai abējādi. Par vietu vienojaties savā starpā.'],
    ],
    posts: [CENAS_STUNDAS, CENAS_KOUCS],
  },
  'tema/marketings': {
    title: 'Mārketinga mentori un apmācības',
    body: [
      'Mārketinga tēmā ir cilvēki, kas ikdienā veido reklāmas, saturu un pārdošanas piltuves un māca to citiem. Pie viņiem nāk mazo uzņēmumu īpašnieki, kuri mārketingu dara paši, un mārketinga speciālisti, kuri grib augt.',
      'Visvairāk dod nodarbība, kurā strādājat ar tavu uzņēmumu: tavu mājaslapu, tavām reklāmām un taviem skaitļiem. Pirms raksti, sagatavo, cik šobrīd tērē un cik klientu tas atnes. Ar to mentors var sākt uzreiz.',
    ],
    faq: [
      ['Ar ko sākt mārketingu mazam uzņēmumam?', 'Ar vienu kanālu, kurā jau ir tavi klienti, un vienu skaidru piedāvājumu. Mentors palīdz izvēlēties kanālu un nesadalīt budžetu pa pieciem uzreiz.'],
      ['Vai mārketingu var iemācīties pats?', 'Pamatus jā. Mentors saīsina ceļu, jo parāda, kuras kļūdas tavā nozarē maksā visdārgāk.'],
      ['Vai ir mārketinga apmācības komandai?', 'Jā. Vairāki pasniedzēji vada apmācības uzņēmumos. Par saturu un cenu vienojies tieši ar pasniedzēju.'],
    ],
    posts: [CENAS_KOUCS],
  },
  'tema/pardosana': {
    title: 'Pārdošanas apmācības un kursi',
    body: [
      'Pārdošanu nevar iemācīties no grāmatas. To iemācās sarunās ar klientiem un ar cilvēku, kurš pēc tam pasaka, kur saruna nogāja greizi. Šajā lapā ir pārdošanas treneri un vadītāji, kas māca individuāli un vada apmācības komandām.',
      'Uzņēmumiem apmācības parasti veido pēc reālām situācijām: aukstie zvani, sarunas par cenu, iebildumi, darījuma noslēgšana. Individuāli strādā ar vienu cilvēku un viņa klientiem.',
    ],
    faq: [
      ['Cik ilgas ir pārdošanas apmācības?', 'No vienas dienas semināra līdz vairāku mēnešu programmai ar regulārām nodarbībām. Paliekošu rezultātu dod programma, kurā starp nodarbībām jāpielieto iemācītais.'],
      ['Vai pārdošanas apmācības var pielāgot nozarei?', 'Jā. Pirms apmācībām pasniedzējs noskaidro, ko pārdodat un kam, un piemērus ņem no jūsu ikdienas.'],
      ['Kā izvēlēties pārdošanas treneri?', 'Pajautā, ko viņš pats ir pārdevis un kādā nozarē. Labs treneris pārdošanu ir darījis, ne tikai mācījis.'],
    ],
  },
  'tema/finanses': {
    title: 'Finanšu konsultanti un mentori',
    body: [
      'Finanšu tēmā ir cilvēki, kas palīdz saprast uzņēmuma naudas plūsmu, budžetu un cenu veidošanu, kā arī sakārtot personīgās finanses. Uzņēmējam tas visbiežāk nozīmē atbildi uz jautājumu, kāpēc apgrozījums aug, bet kontā naudas nav.',
      'Uz pirmo sarunu paņem līdzi pēdējo mēnešu ieņēmumus un izdevumus. Bez skaitļiem saruna paliek vispārīga. Ieguldījumu ieteikumus Latvijā drīkst sniegt tikai licencēti konsultanti, tāpēc noskaidro, ar ko tieši cilvēks strādā.',
    ],
    faq: [
      ['Ko dara finanšu mentors uzņēmumam?', 'Palīdz izveidot budžetu, saprast peļņu pa produktiem un plānot naudas plūsmu, lai nodokļu un algu dienā nav pārsteigumu.'],
      ['Vai finanšu konsultants ir tas pats, kas grāmatvedis?', 'Nē. Grāmatvedis uzskaita to, kas jau noticis. Finanšu konsultants palīdz plānot, kas notiks.'],
      ['Cik maksā finanšu konsultācija?', 'MentorMe.lv profilos biznesa un finanšu konsultācija maksā no 29 eiro, visbiežāk ap 90 līdz 100 eiro.'],
    ],
    posts: [CENAS_KOUCS],
  },
  'tema/gramatvediba': {
    title: 'Grāmatvedības konsultācijas un apmācības',
    body: [
      'Grāmatvedības konsultācija noder, kad sāc saimniecisko darbību vai uzņēmumu un gribi saprast, kādi nodokļi būs jāmaksā un kādi dokumenti jākārto. Viena saruna sākumā pasargā no kļūdām, kuras vēlāk labot ir dārgi.',
      'Šeit ir grāmatveži, kas ne tikai kārto uzskaiti, bet arī izskaidro to saprotamā valodā un iemāca lietot uzskaites programmas pašam.',
    ],
    faq: [
      ['Vai mazam uzņēmumam vajag grāmatvedi?', 'Uzskaite ir jākārto jebkurā gadījumā. Vienkāršākajos gadījumos to var darīt pats, ja kāds sākumā parāda, kā.'],
      ['Ko pajautāt grāmatvedim pirms uzņēmuma dibināšanas?', 'Kāda uzņēmējdarbības forma un nodokļu režīms der tavam plānotajam apgrozījumam un vai būs jāreģistrējas PVN.'],
      ['Vai grāmatvedību var iemācīties individuāli?', 'Jā. Individuālās nodarbībās var apgūt gan pamatus, gan konkrētu uzskaites programmu.'],
    ],
    posts: [['ka-sakt-biznesu-latvija-biznesa-mentors', 'Kā sākt biznesu Latvijā: 7 jautājumi mentoram']],
  },
  'tema/karjera': {
    title: 'Karjeras konsultanti un mentori',
    body: [
      'Karjeras mentors palīdz trīs brīžos: kad meklē pirmo darbu, kad gribi mainīt nozari un kad esi iestrēdzis vienā amatā. Viņš paskatās uz tavu CV un pieredzi ar darba devēja acīm un pasaka, kas tajā trūkst.',
      'Konkrētas nozares mentors ir vērtīgāks par vispārīgu padomu: viņš zina, ko tajā nozarē tiešām prasa un kurp pieteikties. Karjeras koučs noder, ja vēl nezini, ko gribi darīt.',
    ],
    faq: [
      ['Kā mainīt profesiju?', 'Sāc ar sarunu ar cilvēku, kurš jau strādā nozarē, uz kuru gribi pāriet. Viņš pateiks, kuras tavas prasmes der un ko vēl jāapgūst.'],
      ['Vai karjeras konsultants palīdz ar CV un darba interviju?', 'Jā. Daudzi piedāvā CV pārskatīšanu un izmēģinājuma interviju ar atgriezenisko saiti.'],
      ['Cik sarunu vajag?', 'CV un intervijai pietiek ar vienu vai divām. Profesijas maiņai rēķinies ar vairākām sarunām dažu mēnešu laikā.'],
    ],
    posts: [['ka-atrast-mentoru', 'Kā atrast mentoru: 7 soļi']],
  },
  'tema/uznemuma-sakums': {
    title: 'Mentori sava uzņēmuma sākšanai',
    body: [
      'Sākot uzņēmumu, visdārgākās ir kļūdas pirmajos mēnešos: nepareiza cena, produkts, ko neviens nepērk, vai līgums, kas neaizsargā. Mentors, kurš pats ir sācis uzņēmumu, šīs vietas redz uzreiz.',
      'Uz sarunu nāc ar ideju vienā teikumā un atbildi uz jautājumu, kas un kāpēc par to maksās. Ja atbildes vēl nav, tieši par to arī būs pirmā saruna.',
    ],
    faq: [
      ['Ar ko sākt, ja ir biznesa ideja?', 'Ar sarunām ar iespējamiem klientiem un vienu mentoru, kurš pazīst nozari. Uzņēmumu reģistrēt var vēlāk, kad ir pirmie pircēji.'],
      ['Vai mentors palīdz ar biznesa plānu?', 'Viņš neuzrakstīs to tavā vietā, bet pateiks, kuri pieņēmumi nav reāli un ko pārbaudīt vispirms.'],
      ['Vai ir bezmaksas mentori iesācējiem?', 'Jā. Daļa mentoru pirmo sarunu vai visu sadarbību piedāvā bez maksas. Sarakstā tos var atlasīt ar budžeta filtru.'],
    ],
    posts: [['ka-sakt-biznesu-latvija-biznesa-mentors', 'Kā sākt biznesu Latvijā: 7 jautājumi mentoram'], CENAS_KOUCS],
  },
  'tema/web': {
    title: 'Mājaslapu izstrādes mentori un pasniedzēji',
    body: [
      'Šeit ir izstrādātāji, kas iemāca uzbūvēt mājaslapu pašam: no vienkāršas vizītkartes lapas līdz interneta veikalam. Daļa māca programmēt, citi parāda, kā strādāt ar gataviem rīkiem bez koda.',
      'Ātrākais ceļš ir būvēt savu īsto lapu nodarbību laikā. Pēc dažām reizēm lapa ir gatava, un tu proti to arī uzturēt.',
    ],
    faq: [
      ['Vai mājaslapu var izveidot bez programmēšanas?', 'Jā. Vienkāršai lapai vai nelielam veikalam pietiek ar gatavu platformu. Pasniedzējs palīdz izvēlēties rīku un iekārtot to pareizi.'],
      ['Cik ilgi jāmācās, lai izveidotu savu lapu?', 'Vienkāršu lapu ar pasniedzēja palīdzību var uzbūvēt dažās nodarbībās.'],
      ['Cik maksā nodarbība?', 'MentorMe.lv profilos nodarbība tehnoloģiju jomā maksā no 25 eiro, visbiežāk ap 40 eiro.'],
    ],
    posts: [CENAS_STUNDAS],
  },
  'tema/programmesana': {
    title: 'Programmēšanas privātstundas un mentori',
    body: [
      'Programmēšanas mentors ir cilvēks, kurš kodu raksta ikdienā un palīdz tev tikt pāri vietām, kur pats iestrēgsti. Iesācējam viņš sakārto, ko mācīties un kādā secībā. Pieredzējušam pārskata kodu un parāda, kā to raksta komandā.',
      'Skolēniem privātstundas palīdz ar informātiku un sagatavo olimpiādēm. Pieaugušie visbiežāk nāk ar mērķi mainīt profesiju vai automatizēt savu darbu.',
    ],
    faq: [
      ['Ar kuru programmēšanas valodu sākt?', 'Atkarīgs no mērķa. Mājaslapām sāk ar HTML, CSS un JavaScript, datu apstrādei un automatizācijai ar Python. Mentors palīdz izvēlēties pēc tā, ko gribi uzbūvēt.'],
      ['Vai programmēt var iemācīties attālināti?', 'Jā. Ar kopīgu ekrānu tas darbojas tikpat labi kā klātienē.'],
      ['Cik maksā programmēšanas privātstunda?', 'MentorMe.lv profilos no 25 eiro, visbiežāk ap 40 eiro par nodarbību.'],
    ],
    posts: [CENAS_STUNDAS],
  },
  'tema/digitalie-riki': {
    title: 'Digitālo rīku apmācības darbam',
    body: [
      'Excel, Microsoft 365, Google rīki, projektu vadības un automatizācijas programmas: lielākā daļa cilvēku izmanto nelielu daļu no tā, ko šie rīki prot. Pasniedzējs parāda tieši to daļu, kas ietaupa laiku tavā darbā.',
      'Uzņēmumiem apmācības veido pēc komandas ikdienas uzdevumiem. Individuāli var atnākt ar savu tabulu vai procesu un sakārtot to nodarbības laikā.',
    ],
    faq: [
      ['Vai var iemācīties Excel individuāli?', 'Jā. Individuālā nodarbībā strādā ar tavām tabulām un tavā līmenī, tāpēc sanāk ātrāk nekā grupā.'],
      ['Vai ir apmācības uzņēmuma darbiniekiem?', 'Jā. Par saturu, ilgumu un cenu vienojies tieši ar pasniedzēju.'],
      ['Ar ko sākt, ja komanda strādā neefektīvi?', 'Ar vienu procesu, kas aizņem visvairāk laika. Pasniedzējs palīdz izvēlēties rīku un iemāca to lietot.'],
    ],
    posts: [['microsoft-lists-vai-excel', 'Excel vai MS Lists kopīgam sarakstam']],
  },
  'tema/mental': {
    title: 'Atbalsts mentālajai veselībai',
    body: [
      'Šajā tēmā ir kouči, psihologi un citi speciālisti, kas palīdz ar stresu, izdegšanu, pašvērtējumu un ieradumiem. Katrā profilā ir redzama izglītība un sertifikācija, un pēc tās var saprast, ar ko cilvēks drīkst strādāt.',
      'Koučs strādā ar mērķiem un ikdienas ieradumiem. Ar ilgstošu trauksmi, nomāktību vai miega traucējumiem jāvēršas pie psihologa, psihoterapeita vai ārsta. Ja situācija ir akūta, zvani 113 vai krīzes tālrunim 116123.',
    ],
    faq: [
      ['Kad iet pie kouča un kad pie psihologa?', 'Pie kouča, ja spēka pietiek, bet trūkst virziena. Pie psihologa, ja grūtības traucē ikdienu: miegu, darbu, attiecības.'],
      ['Vai konsultācijas notiek attālināti?', 'Jā, lielākā daļa speciālistu strādā arī tiešsaistē. Formāts ir redzams profilā.'],
      ['Kā izvēlēties speciālistu?', 'Paskaties izglītību un sertifikāciju profilā un sarunā iepazīšanās sarunu. Svarīgi, lai ar šo cilvēku jūties droši.'],
    ],
    posts: [['izdegsana-darba-kouc-vai-psihologs', 'Kad palīdzēs koučs un kad vajag psihologu'], ['disciplina-mentala-gariga-fiziska-veseliba', 'Disciplīna un veselība']],
  },
  'tema/garigs': {
    title: 'Garīgās izaugsmes pavadītāji',
    body: [
      'Garīgā izaugsme katram nozīmē ko citu: meditāciju, pašizziņu, vērtību sakārtošanu vai klusuma retrītu. Šeit ir cilvēki, kas šo ceļu ir gājuši paši un pavada citus individuāli, grupās un retrītos.',
      'Pirms izvēlies, izlasi, kā cilvēks pats apraksta savu pieeju, un sarunā īsu iepazīšanos. Šajā jomā svarīgāk par sertifikātu ir tas, vai viņa valoda un vērtības tev ir tuvas.',
    ],
    faq: [
      ['Ar ko sākt garīgo praksi?', 'Ar vienu vienkāršu ieradumu, piemēram, desmit minūtēm klusuma dienā, un cilvēku, kurš palīdz to noturēt.'],
      ['Kas notiek retrītā?', 'Vairākas dienas ārpus ikdienas ar vadītām praksēm, klusumu un sarunām. Programma un noteikumi katram retrītam ir savi.'],
      ['Vai var strādāt attālināti?', 'Jā, individuālas sarunas bieži notiek tiešsaistē. Retrīti un grupu prakses parasti ir klātienē.'],
    ],
    posts: [['retriti-un-mastermind-grupas', 'Retrīti un mastermind grupas']],
  },
  'tema/parmainas': {
    title: 'Atbalsts dzīves pārmaiņās',
    body: [
      'Darba zaudēšana, šķiršanās, pārcelšanās, bērna ienākšana ģimenē vai aiziešana pensijā: pārmaiņās visvairāk palīdz cilvēks, kurš ko līdzīgu ir piedzīvojis vai profesionāli pavada citus. Šeit ir gan kouči, gan cilvēki ar savu dzīves pieredzi.',
      'Saruna nepieņems lēmumu tavā vietā. Tā palīdz ieraudzīt izvēles, kuras vienatnē neredzi, un nepalikt ar tām vienam.',
    ],
    faq: [
      ['Kā saprast, vai man vajag kouču?', 'Ja vienu un to pašu jautājumu galvā griez jau mēnešiem un netiec uz priekšu, saruna ar kouču parasti izkustina.'],
      ['Vai var runāt ar cilvēku, kurš pats to piedzīvojis?', 'Jā. Tēmā ir arī cilvēki, kas dalās tieši ar savu pieredzi, nevis ar metodi.'],
      ['Cik sarunu vajag?', 'Dažiem pietiek ar vienu, lai ieraudzītu nākamo soli. Lielākām pārmaiņām parasti tiekas vairākus mēnešus.'],
    ],
    posts: [['pieredzes-prakse-macities-no-pieredzes', 'Kāpēc no pieredzes iemācās ātrāk']],
  },
  'tema/dzive': {
    title: 'Mācīties no cita cilvēka dzīves pieredzes',
    body: [
      'Ne visas zināšanas ir diplomā. Cilvēks, kurš uzcēlis māju, izaudzinājis piecus bērnus, emigrējis un atgriezies vai trīsdesmit gadus vadījis saimniecību, zina lietas, ko nekur citur neuzzināsi.',
      'Šeit šādi cilvēki piedāvā sarunu, padomu vai pieredzes dienu. Uzraksti konkrētu jautājumu, un saņemsi atbildi no cilvēka, kurš to ir darījis pats.',
    ],
    faq: [
      ['Ko nozīmē pieredzes diena?', 'Tu pavadi dienu kopā ar cilvēku viņa darbā vai saimniecībā un redzi, kā tas notiek īstenībā.'],
      ['Vai par to jāmaksā?', 'Katrs cenu nosaka pats. Daļa cilvēku ar pieredzi dalās bez maksas.'],
      ['Vai arī es varu dalīties ar savu pieredzi?', 'Jā. Profils ir bez maksas, un nekāda izglītība vai sertifikāts nav vajadzīgs.'],
    ],
    posts: [['pieredzes-prakse-macities-no-pieredzes', 'Pieredzes prakse: kāpēc no pieredzes iemācās ātrāk']],
  },
  'tema/radosa': {
    title: 'Radošuma nodarbības un mentori',
    body: [
      'Radošumu var trenēt tāpat kā muskuli. Šajā tēmā ir mākslinieki, dizaineri un radošo profesiju cilvēki, kas vada nodarbības, meistarklases un individuālas sarunas gan iesācējiem, gan profesionāļiem.',
      'Iesācējam nodarbība dod drosmi sākt un pirmās prasmes. Profesionālim mentors dod skatu no malas uz portfolio un padomu, kā ar savu darbu pelnīt.',
    ],
    faq: [
      ['Vai vajag talantu, lai sāktu?', 'Nē. Zīmēšanu, rakstīšanu un citas radošās prasmes var iemācīties ar regulāru praksi un labu skolotāju.'],
      ['Kas ir meistarklase?', 'Viena nodarbība, kurā meistara vadībā izveido konkrētu darbu no sākuma līdz galam.'],
      ['Vai ir nodarbības pieaugušajiem?', 'Jā, lielākā daļa nodarbību šajā tēmā ir domātas pieaugušajiem.'],
    ],
    posts: [['kursi-un-meistarklases-latvija', 'Kursi un meistarklases Latvijā: kā izvēlēties']],
  },
  'nozare/psihologija': {
    title: 'Psihologi un terapeiti',
    body: [
      'Šajā lapā ir psihologi, terapeiti un konsultanti, kas strādā ar emocionālām grūtībām, attiecībām, stresu un izdegšanu. Katrā profilā ir redzama izglītība un sertifikācija.',
      'Pirmajā konsultācijā parasti pārrunā, kas tevi atvedis un ko gribi mainīt. Pēc tās abi saprot, vai un kā strādāt tālāk. Akūtā situācijā zvani 113 vai krīzes tālrunim 116123.',
    ],
    faq: [
      ['Cik maksā psihologa konsultācija?', 'MentorMe.lv profilos konsultācija maksā no 40 līdz 120 eiro.'],
      ['Vai psihologa konsultācija var notikt attālināti?', 'Jā, daudzi speciālisti strādā arī tiešsaistē. Formāts ir redzams profilā.'],
      ['Ar ko psihologs atšķiras no kouča?', 'Psihologs strādā ar emocionālām grūtībām un to cēloņiem. Koučs strādā ar mērķiem un to sasniegšanu.'],
    ],
    posts: [['izdegsana-darba-kouc-vai-psihologs', 'Kad palīdzēs koučs un kad vajag psihologu']],
  },
  'nozare/pieredze': {
    title: 'Dzīves un pieredzes zināšanas',
    body: [
      'Šī nozare ir cilvēkiem, kuru zināšanas nāk no dzīves, nevis no skolas: pārmaiņas, ģimene, pārcelšanās, saimniecība, ceļošana. Viņi piedāvā sarunas, padomu un pieredzes dienas.',
      'Ja meklē atbildi uz jautājumu, ko nevar atrast grāmatā, uzraksti cilvēkam, kurš to ir piedzīvojis. Par cenu un formu vienojaties savā starpā.',
    ],
    faq: [
      ['Kas var dalīties ar pieredzi?', 'Ikviens. Profilam nevajag izglītību vai sertifikātu, vajag pieredzi, ko vari godīgi aprakstīt.'],
      ['Kā notiek pieredzes saruna?', 'Tu uzraksti cilvēkam tieši, un vienojaties par laiku. Saruna var notikt klātienē vai tiešsaistē.'],
      ['Vai tas ir bez maksas?', 'Katrs cenu nosaka pats. Daļa piedāvā sarunu bez maksas.'],
    ],
    posts: [['pieredzes-prakse-macities-no-pieredzes', 'Pieredzes prakse: kāpēc no pieredzes iemācās ātrāk']],
  },
  'nozare/maksla': {
    title: 'Mākslas un radošās nodarbības',
    body: [
      'Šeit ir mākslinieki, dizaineri, fotogrāfi un citi radošo profesiju cilvēki, kas māca individuāli, vada kursus un meistarklases. Nodarbības ir gan bērniem, gan pieaugušajiem, gan iesācējiem, gan tiem, kas gatavojas iestājeksāmeniem.',
      'Praktiskas prasmes, piemēram, gleznošanu vai keramiku, vislabāk mācīties klātienē. Dizainu, fotogrāfijas apstrādi un portfolio veidošanu daudzi māca arī attālināti.',
    ],
    faq: [
      ['Cik maksā mākslas nodarbība?', 'MentorMe.lv profilos nodarbība maksā no 20 eiro, visbiežāk ap 50 eiro. Meistarklasēm un kursiem cena ir par visu programmu.'],
      ['Vai var mācīties bez priekšzināšanām?', 'Jā. Lielākā daļa pasniedzēju strādā arī ar pilnīgiem iesācējiem.'],
      ['Vai ir sagatavošana mākslas skolas iestājeksāmeniem?', 'Pajautā pasniedzējam tieši. Vairāki palīdz sagatavot portfolio un iestājdarbus.'],
    ],
    posts: [['kursi-un-meistarklases-latvija', 'Kursi un meistarklases Latvijā: kā izvēlēties'], CENAS_STUNDAS],
  },
  'vieta/visa-latvija': {
    title: 'Mentori un skolotāji visā Latvijā',
    body: [
      'Šajā lapā ir cilvēki, kas strādā attālināti vai brauc pie klientiem pa visu Latviju. Tev nav jādzīvo Rīgā, lai mācītos pie laba kouča, mentora vai privātskolotāja.',
      'Attālināti labi darbojas sarunas, valodas, matemātika, programmēšana un konsultācijas. Amatus, mūziku un visu, kur vajag rokas, labāk mācīties klātienē, un tad meklē pēc sava reģiona.',
    ],
    faq: [
      ['Vai attālināta nodarbība ir tikpat laba kā klātienē?', 'Sarunām un teorētiskiem priekšmetiem jā, ja abiem ir kamera un kopīgs ekrāns.'],
      ['Vai attālināti ir lētāk?', 'Bieži jā, jo neviens netērē laiku ceļā.'],
      ['Kā atrast kādu savā pilsētā?', 'Izmanto vietas filtru sākumlapā vai atver sava reģiona lapu.'],
    ],
    posts: [CENAS_STUNDAS, CENAS_KOUCS],
  },
}

export function topicGuide(
  kind: string,
  slug: string,
  locale: string
): TopicGuide | null {
  if (locale !== 'lv') return null
  return TOPIC_GUIDES[`${kind}/${slug}`] ?? null
}
