/**
 * Unikāls teksts svarīgākajām tēmu, nozaru un vietu lapām.
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
}

export function topicGuide(
  kind: string,
  slug: string,
  locale: string
): TopicGuide | null {
  if (locale !== 'lv') return null
  return TOPIC_GUIDES[`${kind}/${slug}`] ?? null
}
