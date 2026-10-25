// Biežākie jautājumi — lapā "Kā tas darbojas" un FAQPage strukturētajos datos.
//
// AI meklētāji (ChatGPT, Perplexity, Google AI Overviews) labprāt citē
// īsas, tiešas atbildes uz konkrētiem jautājumiem. Tāpēc katra atbilde
// ir pilns teikums, kas saprotams arī bez pārējās lapas.

export type FaqItem = { q: string; a: string }

export const FAQ: Record<string, { title: string; items: FaqItem[] }> = {
  lv: {
    title: 'Biežāk uzdotie jautājumi',
    items: [
      {
        q: 'Kas ir MentorMe.lv?',
        a: 'MentorMe.lv ir Latvijas zināšanu un prasmju tirgus laukums, kur vienuviet var atrast mentorus, koučus, privātskolotājus, trenerus un meistarus, kā arī kursus, meistarklases, pieredzes un retrītus — klātienē vai attālināti.',
      },
      {
        q: 'Cik maksā MentorMe.lv lietošana?',
        a: 'Meklēt un sazināties ir bez maksas, un arī profila izveide ir bez maksas. MentorMe.lv neņem komisiju — par cenu cilvēki vienojas tieši ar mentoru, kouču vai skolotāju.',
      },
      {
        q: 'Kā atrast mentoru vai kouču Latvijā?',
        a: 'Sākumlapā izvēlies nozari vai ieraksti meklēšanā, ko gribi iemācīties. Filtrē pēc vietas (piemēram, Rīga), formāta (klātienē vai attālināti), valodas un budžeta, atver profilu un nospied "Sazināties".',
      },
      {
        q: 'Ar ko atšķiras mentors, koučs un privātskolotājs?',
        a: 'Mentors dalās savā pieredzē un dod padomu, koučs ar jautājumiem palīdz tev pašam atrast risinājumu un sasniegt mērķi, bet privātskolotājs māca konkrētu priekšmetu vai prasmi, piemēram, matemātiku, valodu vai mūzikas instrumentu.',
      },
      {
        q: 'Vai nodarbības notiek klātienē vai tiešsaistē?',
        a: 'Katrs pats norāda, kā strādā: klātienē, attālināti vai abos veidos. Profilā redzama arī pilsēta vai reģions, piemēram, Rīga, Pierīga, Vidzeme vai visa Latvija.',
      },
      {
        q: 'Kā izveidot savu profilu un piedāvāt privātstundas vai kursus?',
        a: 'Nospied "Man pieder zināšanas", piesakies ar e-pastu vai Google kontu, aizpildi īso aprakstu, izvēlies tēmas, pievieno kontaktu un nospied "Saglabāt un publicēt". Profils uzreiz saņem savu adresi, piemēram, mentorme.lv/tavs-vards.',
      },
    ],
  },
  en: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'What is MentorMe.lv?',
        a: 'MentorMe.lv is a knowledge and skills marketplace in Latvia where you can find mentors, coaches, private tutors, trainers and craftspeople in one place, as well as courses, masterclasses, experiences and retreats — in person or online.',
      },
      {
        q: 'How much does MentorMe.lv cost?',
        a: 'Searching, contacting and creating a profile are all free. MentorMe.lv takes no commission — you agree on the price directly with the mentor, coach or tutor.',
      },
      {
        q: 'How do I find a mentor or coach in Latvia?',
        a: 'Pick a field on the home page or type what you want to learn. Filter by place (for example Riga), format (in person or online), language and budget, open a profile and press "Contact".',
      },
      {
        q: 'What is the difference between a mentor, a coach and a private tutor?',
        a: 'A mentor shares their experience and gives advice, a coach uses questions to help you find your own solution and reach a goal, and a private tutor teaches a specific subject or skill such as maths, a language or a musical instrument.',
      },
      {
        q: 'Are sessions in person or online?',
        a: 'Everyone states how they work: in person, online or both. Profiles also show the city or region, such as Riga, the Riga region, Vidzeme or all of Latvia.',
      },
      {
        q: 'How do I create a profile and offer private lessons or courses?',
        a: 'Press "I have knowledge", sign in with email or Google, fill in a short description, choose topics, add a contact and press "Save and publish". Your profile immediately gets its own address, such as mentorme.lv/your-name.',
      },
    ],
  },
  ru: {
    title: 'Часто задаваемые вопросы',
    items: [
      {
        q: 'Что такое MentorMe.lv?',
        a: 'MentorMe.lv — площадка знаний и навыков в Латвии, где в одном месте можно найти менторов, коучей, репетиторов, тренеров и мастеров, а также курсы, мастер-классы, опыт и ретриты — очно или онлайн.',
      },
      {
        q: 'Сколько стоит пользоваться MentorMe.lv?',
        a: 'Поиск, связь и создание профиля бесплатны. MentorMe.lv не берёт комиссию — о цене вы договариваетесь напрямую с ментором, коучем или репетитором.',
      },
      {
        q: 'Как найти ментора или коуча в Латвии?',
        a: 'Выберите сферу на главной странице или введите в поиске, чему хотите научиться. Отфильтруйте по месту (например, Рига), формату (очно или онлайн), языку и бюджету, откройте профиль и нажмите «Связаться».',
      },
      {
        q: 'Чем отличаются ментор, коуч и репетитор?',
        a: 'Ментор делится опытом и даёт советы, коуч с помощью вопросов помогает вам самим найти решение и достичь цели, а репетитор обучает конкретному предмету или навыку — математике, языку или игре на инструменте.',
      },
      {
        q: 'Занятия проходят очно или онлайн?',
        a: 'Каждый сам указывает формат: очно, онлайн или оба варианта. В профиле также виден город или регион — Рига, Рижский край, Видземе или вся Латвия.',
      },
      {
        q: 'Как создать профиль и предлагать частные уроки или курсы?',
        a: 'Нажмите «У меня есть знания», войдите через e-mail или Google, заполните краткое описание, выберите темы, добавьте контакт и нажмите «Сохранить и опубликовать». Профиль сразу получает свой адрес, например mentorme.lv/vashe-imya.',
      },
    ],
  },
}
