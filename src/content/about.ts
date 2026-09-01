// -*- Manifesta teksts trijās valodās.
//
// Garu prozu messages/*.json failos glabāt nevar — tur to nevar ne lasīt,
// ne rediģēt. Tāpēc šī lapa ir vienīgā, kuras teksts dzīvo atsevišķi.

export type AboutStory = { title: string; body: string; emphasis: string | null }

export type AboutContent = {
  eyebrow: string
  headline: string
  intro: string[]
  pull: string
  forWhom: string
  stories: AboutStory[]
  howTitle: string
  how: string[]
  closing: string
  ctaAdd: string
  ctaFind: string
}

export const ABOUT: Record<string, AboutContent> = {
  "lv": {
    "eyebrow": "Mūsu mērķis",
    "headline": "Zināšanas nemirst pašas. Tās mirst tad, kad tām nav, kam pāriet.",
    "intro": [
      "Katru gadu Latvijā kļūst par vienu koklētāju mazāk. Ne tāpēc, ka kokle būtu kļuvusi nevajadzīga — bet tāpēc, ka cilvēks, kurš prot uz tās spēlēt, dzīvo otrā Latvijas galā, un neviens nekad nav uzzinājis, ka pie viņa varēja atbraukt mācīties.",
      "Talsu novadā kāda sieviete zina ievārījuma recepti, kuru neviens cits neprot pagatavot tāpat. Kad lauku māju pārdos, recepte aizies līdzi. Ne tāpēc, ka viņa to slēptu. Tāpēc, ka neviens neatnāca un nepajautāja.",
      "Tā pazūd prasmes. Ne skaļi, ne uzreiz — vienkārši kādā brīdī vairs nav neviena, kas tās prot."
    ],
    "pull": "Šī vietne pastāv tāpēc, ka katram cilvēkam ir zināšanas, par kurām kāds cits ir gatavs maksāt, bet abi parasti nekad viens otru nesatiek.",
    "forWhom": "Kam tas domāts",
    "stories": [
      {
        "title": "Jānim, kurš nosēdēja astoņpadsmit gadus",
        "body": "Par divdesmit eiro viņš izstāstīs, kā izdzīvot pirmajās dienās: ko darīt, ko nedarīt, kam neticēt. Cilvēkam, kuram termiņš priekšā, tā ir informācija, kuras nav nekur citur.",
        "emphasis": "Nezinot pamatlietas, viņš zaudēs krietni vairāk par divdesmit eiro."
      },
      {
        "title": "Tantei, kura grib iemācīt vārīt zapti",
        "body": "Viņa to dara piecdesmit gadus. Viņai nav mājaslapas, nav Instagram konta un nav ne mazākās vēlmes to visu taisīt. Viņai vajag vienu lapu, kur pierakstīties, un jaunas meitenes, kas atbrauks.",
        "emphasis": null
      },
      {
        "title": "Bērnam, kurš meklē privātskolotāju",
        "body": "Matemātikā pirms devītās klases eksāmena. Angļu valodā. Fizikā. Vai vienkārši tāpēc, ka grib iemācīties spēlēt bungas, un skolā tādas nav.",
        "emphasis": null
      },
      {
        "title": "Cilvēkam, kurš grib pats izremontēt istabu",
        "body": "Nevis nolīgt celtnieku, bet pajautāt celtniekam, kā to izdarīt pašam. Divas stundas ar cilvēku, kurš zina, ietaupa nedēļu kļūdu.",
        "emphasis": null
      },
      {
        "title": "Šefpavāram no Itālijas",
        "body": "Kurš dzirdējis, ka Kurzemē kāda sieviete kūpina gaļu tā, kā to darīja pirms simt gadiem, un grib to iemācīties no viņas pašas — nevis no video.",
        "emphasis": null
      },
      {
        "title": "Tūristam, kurš negrib suvenīru",
        "body": "Bet grib vienu dienu, kurā iemācās ķert butes. Nopīt Jāņu vainagu. Nodejot sudmaliņas. Aizbraukt mājās ar to, ko neviens nevar nopirkt lidostā.",
        "emphasis": null
      },
      {
        "title": "Arī koučiem un mentoriem",
        "body": "Sertificētiem un nesertificētiem. Tiem ar ICF MCC un divi tūkstoši piecsimt stundām, un tiem, kas tikai vāc pirmās prakses stundas. Tā ir viena nozare starp četrpadsmit — ne vairāk, bet arī ne mazāk svarīga par pārējām.",
        "emphasis": null
      }
    ],
    "howTitle": "Kā mēs to darām",
    "how": [
      "Viena lapa, kur var atrast cilvēku pēc tā, ko viņš prot, kur viņš dzīvo un vai viņš māca klātienē vai attālināti. Jo dažas lietas var iemācīties caur ekrānu, un dažas nevar — kokli, mālu un maizes krāsni nevar.",
      "Bez maksas abām pusēm. Mēs neņemam komisiju no tā, par ko jūs vienojaties. Mēs neuzglabājam jūsu saraksti. Mēs tikai palīdzam satikties.",
      "Nav svarīgi, vai tev ir diploms. Ir svarīgi, vai tu proti kaut ko, ko kāds cits grib iemācīties."
    ],
    "closing": "Ja tev pieder zināšanas — kāds tevi meklē. Viņš vienkārši vēl nezina, kur tu esi.",
    "ctaAdd": "Pievienot savu profilu",
    "ctaFind": "Meklēt to, kas zina"
  },
  "en": {
    "eyebrow": "Our purpose",
    "headline": "Knowledge doesn't die on its own. It dies when there's no one left to pass it to.",
    "intro": [
      "Every year Latvia has one kokle player fewer. Not because the instrument stopped mattering — but because the person who can play it lives at the other end of the country, and nobody ever found out you could come and learn from them.",
      "In the Talsi region a woman knows a jam recipe nobody else can make quite the same way. When the farmhouse is sold, the recipe goes with it. Not because she kept it secret. Because nobody came and asked.",
      "That's how skills disappear. Not loudly, not all at once — one day there is simply nobody left who knows how."
    ],
    "pull": "This site exists because every person knows something someone else would pay to learn. And the two almost never meet.",
    "forWhom": "Who it's for",
    "stories": [
      {
        "title": "Jānis, who served eighteen years",
        "body": "For twenty euros he'll tell you how to survive the first days: what to do, what not to do, who not to trust. For someone facing a sentence, that's information available nowhere else.",
        "emphasis": "Not knowing the basics will cost him far more than twenty euros."
      },
      {
        "title": "The aunt who wants to teach jam-making",
        "body": "She's been doing it for fifty years. She has no website, no Instagram account and not the slightest wish to build either. She needs one page where people can sign up, and young women who'll actually show up.",
        "emphasis": null
      },
      {
        "title": "The child looking for a tutor",
        "body": "Maths before the ninth-grade exam. English. Physics. Or simply because they want to learn the drums, and the school doesn't teach them.",
        "emphasis": null
      },
      {
        "title": "The person who wants to renovate a room themselves",
        "body": "Not to hire a builder, but to ask a builder how to do it alone. Two hours with someone who knows saves a week of mistakes.",
        "emphasis": null
      },
      {
        "title": "The chef from Italy",
        "body": "Who heard that a woman in Kurzeme smokes meat the way it was done a hundred years ago, and wants to learn it from her — not from a video.",
        "emphasis": null
      },
      {
        "title": "The traveller who doesn't want a souvenir",
        "body": "But wants one day learning to catch flounder and smoke them. To weave a midsummer wreath. To dance the Sudmaliņas. To go home with something no airport sells.",
        "emphasis": null
      },
      {
        "title": "And coaches and mentors too",
        "body": "Certified and not. Those with an ICF MCC and two and a half thousand hours, and those collecting their first practice hours. It's one field among fourteen — no more important than the others, and no less.",
        "emphasis": null
      }
    ],
    "howTitle": "How we do it",
    "how": [
      "One page where you can find a person by what they know, where they live and whether they teach in person or online. Because some things can be learned through a screen, and some cannot — the kokle, clay and a smokehouse cannot.",
      "Free for both sides. We take no commission on whatever you agree between you. We don't store your conversations. We only help you meet.",
      "It doesn't matter whether you have a diploma. What matters is whether you have knowledge someone else wants."
    ],
    "closing": "If you have knowledge — someone is looking for you. They just don't know where you are yet.",
    "ctaAdd": "Add your profile",
    "ctaFind": "Find someone who knows"
  },
  "ru": {
    "eyebrow": "Наша цель",
    "headline": "Знания не умирают сами. Они умирают, когда им некому перейти.",
    "intro": [
      "Каждый год в Латвии становится на одного игрока на кокле меньше. Не потому, что инструмент стал не нужен — а потому, что человек, который умеет на нём играть, живёт на другом конце страны, и никто так и не узнал, что к нему можно было приехать учиться.",
      "В Талсинском крае женщина знает рецепт варенья, который больше никто не повторит так же. Когда хутор продадут, рецепт уйдёт вместе с ним. Не потому, что она его скрывала. Потому что никто не пришёл и не спросил.",
      "Так исчезают умения. Не громко и не сразу — просто в какой-то момент не остаётся никого, кто их знает."
    ],
    "pull": "Этот сайт существует потому, что у каждого человека есть знания, за которые кто-то другой готов заплатить. И эти двое почти никогда не встречаются.",
    "forWhom": "Для кого это",
    "stories": [
      {
        "title": "Янису, который отсидел восемнадцать лет",
        "body": "За двадцать евро он расскажет, как выжить в первые дни: что делать, чего не делать, кому не верить. Тому, кому срок ещё предстоит, этой информации не найти больше нигде.",
        "emphasis": "Не зная основ, он потеряет куда больше двадцати евро."
      },
      {
        "title": "Женщине, которая хочет научить варить варенье",
        "body": "Она делает это пятьдесят лет. У неё нет сайта, нет Instagram и нет ни малейшего желания всё это заводить. Ей нужна одна страница, где можно записаться, и молодые девушки, которые приедут.",
        "emphasis": null
      },
      {
        "title": "Ребёнку, который ищет репетитора",
        "body": "По математике перед экзаменом за девятый класс. По английскому. По физике. Или просто потому, что хочет научиться играть на барабанах, а в школе этому не учат.",
        "emphasis": null
      },
      {
        "title": "Человеку, который хочет сам отремонтировать комнату",
        "body": "Не нанять строителя, а спросить у строителя, как сделать самому. Два часа с тем, кто знает, экономят неделю ошибок.",
        "emphasis": null
      },
      {
        "title": "Шеф-повару из Италии",
        "body": "Который услышал, что в Курземе женщина коптит мясо так, как это делали сто лет назад, и хочет научиться у неё самой — а не по видео.",
        "emphasis": null
      },
      {
        "title": "Туристу, которому не нужен сувенир",
        "body": "А нужен один день, когда он научится ловить камбалу и коптить её. Сплести венок на Лиго. Станцевать судмалиню. Уехать домой с тем, чего не купить в аэропорту.",
        "emphasis": null
      },
      {
        "title": "И коучам с менторами тоже",
        "body": "Сертифицированным и нет. Тем, у кого ICF MCC и две с половиной тысячи часов, и тем, кто только набирает первые часы практики. Это одна сфера из четырнадцати — не важнее остальных, но и не менее важна.",
        "emphasis": null
      }
    ],
    "howTitle": "Как мы это делаем",
    "how": [
      "Одна страница, где человека можно найти по тому, что он умеет, где он живёт и учит ли он очно или онлайн. Потому что чему-то можно научиться через экран, а чему-то нельзя — кокле, глине и коптильне нельзя.",
      "Бесплатно для обеих сторон. Мы не берём комиссию с того, о чём вы договоритесь. Мы не храним вашу переписку. Мы только помогаем встретиться.",
      "Неважно, есть ли у вас диплом. Важно, умеете ли вы то, чему кто-то хочет научиться."
    ],
    "closing": "Если у вас есть знания — кто-то вас ищет. Он просто пока не знает, где вы.",
    "ctaAdd": "Добавить профиль",
    "ctaFind": "Найти того, кто знает"
  }
}
