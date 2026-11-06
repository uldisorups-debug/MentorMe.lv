/**
 * Baneri, ko mentori un partneri var ievietot savā lapā.
 *
 * Katra ievietošana ir saite uz mentorme.lv no citas vietnes — tieši
 * tas, kas Google stāsta, ka vietnei uzticas. Kods ir tīrs HTML ar
 * iekļautiem stiliem, bez skriptiem: to var ielīmēt jebkurā CMS.
 */

const SITE = 'https://mentorme.lv'
const TITLE = 'MentorMe.lv — mentori, kouči un privātskolotāji Latvijā'
const ALT = 'MentorMe.lv — mentori, kouči un privātskolotāji'

export type Banner = {
  id: string
  src: string
  width: number
  height: number
  code: string
}

function badge(id: string, file: string): Banner {
  const src = `/baneri/${file}`
  return {
    id,
    src,
    width: 190,
    height: 60,
    code: `<div style="display:inline-block;padding:10px"><a href="${SITE}/" target="_blank" rel="noopener" title="${TITLE}" style="display:block;text-decoration:none;text-align:center;margin:0;font-size:11px;color:#777;font-family:sans-serif"><img width="190" height="60" alt="${ALT}" src="${SITE}${src}" loading="lazy" style="display:block;margin:0 auto 3px;border:0"/>Atrodi savu mentoru</a></div>`,
  }
}

export const BANNERS: Banner[] = [
  badge('badge-dark', 'mentorme-190x60-tumss.webp'),
  badge('badge-light', 'mentorme-190x60-gaiss.webp'),
  {
    id: 'skyscraper',
    src: '/baneri/mentorme-160x600.webp',
    width: 160,
    height: 600,
    code: `<a href="${SITE}/" target="_blank" rel="noopener" title="${TITLE}" style="display:inline-block"><img width="160" height="600" alt="${ALT}" src="${SITE}/baneri/mentorme-160x600.webp" loading="lazy" style="display:block;border:0"/></a>`,
  },
]

type Copy = {
  title: string
  lead: string
  names: Record<string, string>
  copy: string
  copied: string
  note: string
}

export const BANNERS_PAGE: Record<string, Copy> = {
  lv: {
    title: 'Baneri',
    lead: 'Esi MentorMe mentors, koučs vai skolotājs, vai vienkārši gribi mūs ieteikt? Ielīmē kodu savā mājaslapā, blogā vai e-pasta parakstā — banerī ir saite uz MentorMe.lv.',
    names: {
      'badge-dark': 'Poga 190×60 — tumša',
      'badge-light': 'Poga 190×60 — gaiša',
      skyscraper: 'Sānu baneris 160×600',
    },
    copy: 'Kopēt kodu',
    copied: 'Nokopēts',
    note: 'Lūdzam baneri nemainīt un saiti atstāt uz mentorme.lv. Vajag citu izmēru? Raksti mums no kontaktu lapas.',
  },
  en: {
    title: 'Banners',
    lead: 'Are you a MentorMe mentor, coach or teacher, or just want to recommend us? Paste the code into your website, blog or email signature — the banner links to MentorMe.lv.',
    names: {
      'badge-dark': 'Button 190×60 — dark',
      'badge-light': 'Button 190×60 — light',
      skyscraper: 'Side banner 160×600',
    },
    copy: 'Copy code',
    copied: 'Copied',
    note: 'Please keep the banner unchanged and the link pointing to mentorme.lv. Need another size? Write to us via the contact page.',
  },
  ru: {
    title: 'Баннеры',
    lead: 'Вы ментор, коуч или преподаватель на MentorMe или просто хотите нас порекомендовать? Вставьте код на свой сайт, в блог или подпись письма — баннер ведёт на MentorMe.lv.',
    names: {
      'badge-dark': 'Кнопка 190×60 — тёмная',
      'badge-light': 'Кнопка 190×60 — светлая',
      skyscraper: 'Боковой баннер 160×600',
    },
    copy: 'Копировать код',
    copied: 'Скопировано',
    note: 'Пожалуйста, не изменяйте баннер и оставьте ссылку на mentorme.lv. Нужен другой размер? Напишите нам через страницу контактов.',
  },
}
