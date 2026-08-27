// -*- "Kā tas darbojas" teksts trijās valodās.
//
// Garā prozā messages/*.json nav vietas — tur to nevar ne lasīt, ne
// rediģēt. Tāpat kā "Par mums", šī sadaļa dzīvo atsevišķi.

export type HowStep = { title: string; body: string }

export type HowContent = {
  eyebrow: string
  headline: string
  lead: string
  seekerTitle: string
  seekerSteps: [string, string][]
  seekerNote: string
  ownerTitle: string
  ownerSteps: [string, string][]
  ownerNote: string
  waitTitle: string
  waitBody: string[]
  mentorTitle: string
  mentorBody: string
  freeTitle: string
  freeBody: [string, string][]
  ctaFind: string
  ctaAdd: string
}

export const HOW_IT_WORKS: Record<string, HowContent> = {
  "lv": {
    "eyebrow": "Kā tas darbojas",
    "headline": "Viens atrod. Otrs nopelna. Abiem bez maksas.",
    "lead": "Šī lapa dara vienu lietu: saved kopā cilvēku, kurš kaut ko grib iemācīties, ar cilvēku, kuram tās zināšanas pieder. Viss pārējais notiek starp jums.",
    "seekerTitle": "Ja tu meklē zināšanas",
    "seekerSteps": [
      [
        "Pasaki, ko meklē",
        "Izvēlies nozari, vietu un vai gribi mācīties klātienē vai caur ekrānu. Saraksts sašaurinās no simtiem līdz dažiem."
      ],
      [
        "Apskaties, kas viņš par cilvēku",
        "Ne tikai ko prot, bet arī ko lasa, skatās un klausās. Ar dažiem cilvēkiem sanāk, ar citiem nē — to labāk saprast pirms, ne pēc."
      ],
      [
        "Uzraksti viņam tieši",
        "WhatsApp, e-pastā vai kur viņš pats norādījis. Bez formām, bez gaidīšanas, bez mums pa vidu."
      ]
    ],
    "seekerNote": "Meklēt un lasīt var bez konta. Konts vajadzīgs tikai tad, ja gribi atstāt atsauksmi.",
    "ownerTitle": "Ja tev pieder zināšanas",
    "ownerSteps": [
      [
        "Izveido profilu",
        "Ko proti, kur esi, cik maksā. Piecpadsmit minūtes, un tas ir izdarīts vienreiz."
      ],
      [
        "Atstāj kontaktu, ko lieto ikdienā",
        "WhatsApp, e-pastu, Telegram — to, ko tu tāpat atver katru dienu."
      ],
      [
        "Turpini dzīvot savu dzīvi",
        "Cilvēki tevi atradīs un uzrakstīs tur. Tev nav jāatgriežas šeit un jāpārbauda, vai kāds nav rakstījis."
      ]
    ],
    "ownerNote": "Mēs neņemam komisiju no tā, par ko jūs vienojaties. Nekad.",
    "waitTitle": "Reģistrējies vienreiz — atradīs arī pēc gada",
    "waitBody": [
      "Daudz kas ir sezonāls. Maijā vecāki meklē privātskolotāju pirms devītās klases eksāmena. Jūnijā to nemeklē neviens. Septembrī atkal.",
      "Tāpēc nav jēgas katru nedēļu nākt šeit un pārbaudīt. Uzliec profilu, atstāj kontaktu un aizmirsti. Kad kādam būs vajadzīgs tieši tas, ko tu proti, viņš tevi atradīs un uzrakstīs uz to e-pastu, ko tu lasi jebkurā gadījumā.",
      "Vienpadsmitklasnieks, kurš māca matemātiku jaunākajiem, var uzlikt profilu vienu reizi un saņemt skolēnus katru pavasari."
    ],
    "mentorTitle": "Un tas, kas bija no paša sākuma",
    "mentorBody": "Atrod cilvēku, kurš ir bijis tur, kur tu gribi nokļūt. Ne tikai to, kurš par to lasījis grāmatā.",
    "freeTitle": "Cik tas maksā",
    "freeBody": [
      [
        "Meklēt un sazināties",
        "Bezmaksas"
      ],
      [
        "Izveidot profilu un publicēt rakstus",
        "Bezmaksas"
      ],
      [
        "Mūsu komisija no tavas cenas",
        "Nav"
      ]
    ],
    "ctaFind": "Meklēt zināšanas",
    "ctaAdd": "Pievienot savu profilu"
  },
  "en": {
    "eyebrow": "How it works",
    "headline": "One finds. The other earns. Free for both.",
    "lead": "This site does one thing: it brings together a person who wants to learn something and a person who has that knowledge. Everything else happens between the two of you.",
    "seekerTitle": "If you're looking for knowledge",
    "seekerSteps": [
      [
        "Say what you're after",
        "Choose the field, the place, and whether you want to learn in person or through a screen. The list narrows from hundreds to a few."
      ],
      [
        "See what kind of person they are",
        "Not only what they know, but what they read, watch and listen to. Some people click and some don't — better to find that out before, not after."
      ],
      [
        "Write to them directly",
        "WhatsApp, email, or wherever they said. No forms, no waiting, nobody in between."
      ]
    ],
    "seekerNote": "Searching and reading needs no account. You only need one to leave a review.",
    "ownerTitle": "If you have knowledge",
    "ownerSteps": [
      [
        "Create a profile",
        "What you know, where you are, what it costs. Fifteen minutes, done once."
      ],
      [
        "Leave a contact you use every day",
        "WhatsApp, email, Telegram — whatever you already open daily."
      ],
      [
        "Go on with your life",
        "People will find you and write there. You don't have to come back here to check whether anyone did."
      ]
    ],
    "ownerNote": "We take no commission on whatever you agree between you. Ever.",
    "waitTitle": "Register once — they'll find you a year later too",
    "waitBody": [
      "Much of this is seasonal. In May parents look for a tutor before the ninth-grade exam. In June nobody looks. In September it starts again.",
      "So there's no point coming back every week to check. Put up a profile, leave a contact, and forget about it. When someone needs exactly what you know, they'll find you and write to the inbox you read anyway.",
      "A seventeen-year-old who tutors younger pupils in maths can set up a profile once and get students every spring."
    ],
    "mentorTitle": "And the thing that was here from the start",
    "mentorBody": "Find someone who has been where you want to get to. Not just someone who read about it in a book.",
    "freeTitle": "What it costs",
    "freeBody": [
      [
        "Searching and getting in touch",
        "Free"
      ],
      [
        "Creating a profile and publishing articles",
        "Free"
      ],
      [
        "Our commission on your price",
        "None"
      ]
    ],
    "ctaFind": "Find knowledge",
    "ctaAdd": "Add your profile"
  },
  "ru": {
    "eyebrow": "Как это работает",
    "headline": "Один находит. Другой зарабатывает. Обоим бесплатно.",
    "lead": "Этот сайт делает одно: сводит человека, который хочет чему-то научиться, с человеком, у которого эти знания есть. Всё остальное происходит между вами.",
    "seekerTitle": "Если вы ищете знания",
    "seekerSteps": [
      [
        "Скажите, что ищете",
        "Выберите сферу, место и то, хотите ли учиться очно или через экран. Список сузится с сотен до нескольких."
      ],
      [
        "Посмотрите, что он за человек",
        "Не только что умеет, но и что читает, смотрит и слушает. С кем-то совпадаешь, с кем-то нет — лучше понять это до, а не после."
      ],
      [
        "Напишите ему напрямую",
        "В WhatsApp, на почту или туда, где он сам указал. Без форм, без ожидания, без нас посередине."
      ]
    ],
    "seekerNote": "Искать и читать можно без аккаунта. Он нужен только для отзыва.",
    "ownerTitle": "Если у вас есть знания",
    "ownerSteps": [
      [
        "Создайте профиль",
        "Что умеете, где находитесь, сколько стоит. Пятнадцать минут, и это сделано один раз."
      ],
      [
        "Оставьте контакт, которым пользуетесь каждый день",
        "WhatsApp, почту, Telegram — то, что вы и так открываете ежедневно."
      ],
      [
        "Живите дальше своей жизнью",
        "Люди найдут вас и напишут туда. Вам не нужно возвращаться сюда и проверять, не написал ли кто-то."
      ]
    ],
    "ownerNote": "Мы не берём комиссию с того, о чём вы договоритесь. Никогда.",
    "waitTitle": "Зарегистрируйтесь один раз — найдут и через год",
    "waitBody": [
      "Многое здесь сезонное. В мае родители ищут репетитора перед экзаменом за девятый класс. В июне не ищет никто. В сентябре снова.",
      "Поэтому нет смысла заходить сюда каждую неделю и проверять. Поставьте профиль, оставьте контакт и забудьте. Когда кому-то понадобится именно то, что вы умеете, он найдёт вас и напишет на ту почту, которую вы читаете в любом случае.",
      "Одиннадцатиклассник, который занимается математикой с младшими, может создать профиль один раз и получать учеников каждую весну."
    ],
    "mentorTitle": "И то, что было здесь с самого начала",
    "mentorBody": "Найдите человека, который уже был там, куда вы хотите попасть. Не того, кто просто прочитал об этом в книге.",
    "freeTitle": "Сколько это стоит",
    "freeBody": [
      [
        "Искать и связываться",
        "Бесплатно"
      ],
      [
        "Создать профиль и публиковать статьи",
        "Бесплатно"
      ],
      [
        "Наша комиссия с вашей цены",
        "Нет"
      ]
    ],
    "ctaFind": "Искать знания",
    "ctaAdd": "Добавить профиль"
  }
}
