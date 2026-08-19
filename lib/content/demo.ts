/**
 * Витрина до подключения CRM.
 *
 * Пока школа не завела Supabase, все запросы к контенту возвращают пустоту,
 * и сайт выглядит как каркас без содержимого. Этот модуль подставляет
 * демонстрационный набор — чтобы страницу можно было показать, обсудить
 * и принять, ещё не заполнив ни одной карточки в админке.
 *
 * Два правила, которых мы держимся:
 *
 * 1. Демо включается ТОЛЬКО когда Supabase не сконфигурирован. Как только
 *    в окружении появляются ключи, сайт показывает данные школы и ничего
 *    кроме них — подмешать выдумку в боевой контент невозможно by design.
 *
 * 2. Всё, что можно взять из открытого профиля школы (@danek.uvk), взято
 *    оттуда дословно: телефон, языки с первого класса, трёхразовое питание,
 *    цель IELTS 6.5, подготовка к ОРТ с седьмого класса, медали
 *    республиканской олимпиады. Выдуманы только имена педагогов и тексты
 *    новостей — то, что школа заменит первым делом. Адрес, почта и цены
 *    намеренно оставлены пустыми: по выдуманному адресу кто-то поедет,
 *    а по выдуманной цене — рассчитает бюджет.
 */
import type { Locale } from "@/lib/i18n/config";
import type { I18nText } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import { pickI18n } from "./i18n-value";
import { STOCK_IMAGES, STOCK_PORTRAITS, type ImageSource } from "./stock-images";

/**
 * Показывать ли демонстрационный контент.
 *
 * Явное `NEXT_PUBLIC_DEMO_CONTENT=off` глушит демо даже без Supabase —
 * это нужно, чтобы снять скриншоты честных пустых состояний.
 */
export const isDemoContent =
  !isSupabaseConfigured && process.env.NEXT_PUBLIC_DEMO_CONTENT !== "off";

const t = (ky: string, ru: string, en: string): I18nText => ({ ky, ru, en });

/* ---------------------------------------------------------------- Контакты */

/** Подтверждённые контакты из профиля школы. */
export const DEMO_CONTACT_FACTS = {
  phone: "+996770277123",
  instagram: "https://www.instagram.com/danek.uvk/",
  whatsapp: "https://chat.whatsapp.com/Ll0HdV0ng7I1bq7PDW0h78",
} as const;

export const DEMO_WORK_HOURS = t(
  "Дүйшөмбү–жума 8:00–17:00, ишемби 9:00–13:00",
  "Понедельник–пятница 8:00–17:00, суббота 9:00–13:00",
  "Monday–Friday 8:00–17:00, Saturday 9:00–13:00",
);

export const DEMO_ADDRESS = t("Бишкек шаары", "город Бишкек", "Bishkek");

/**
 * Цифры на обложке.
 *
 * Это не «1500 учеников» из шаблона, а четыре факта из профиля школы —
 * их можно проверить, и именно они отличают ДАНЕК от соседней гимназии.
 */
export const DEMO_STATS: { value: string; label: I18nText }[] = [
  { value: "1–10", label: t("классы", "классы", "grades") },
  {
    value: "2",
    label: t(
      "чет тили 1-класстан",
      "иностранных языка с 1 класса",
      "foreign languages from grade 1",
    ),
  },
  { value: "3", label: t("маал тамактануу", "разовое питание", "meals a day") },
  { value: "6.5+", label: t("IELTS максаты", "цель по IELTS", "IELTS target") },
];

/* ---------------------------------------------------------------- Педагоги */

type DemoTeacher = {
  slug: string;
  fullName: string;
  position: I18nText;
  bio: I18nText;
  subjects: I18nText[];
  yearsTeaching: number;
};

/**
 * Демонстрационные карточки педагогов.
 *
 * Имена и биографии вымышлены — это первое, что школа заменит своими людьми
 * через раздел «Педагоги» в CRM. Предметы и должности взяты из реальной
 * программы: английский и арабский с первого класса, усиленная математика,
 * финансовая грамотность, этика.
 */
const DEMO_TEACHERS: DemoTeacher[] = [
  {
    slug: "director",
    fullName: "Талантбек Сапитов",
    position: t("Мектеп директору", "Директор школы", "School Director"),
    bio: t(
      "Мектепти башкаруу жана мугалимдерди тандоо — окуучу менен кантип сүйлөшөрүн көрүп туруп.",
      "Отвечает за развитие комплекса и отбор педагогов — прежде всего по тому, как человек говорит с ребёнком.",
      "Leads the school and hires teachers — starting with how they speak to a child.",
    ),
    subjects: [],
    yearsTeaching: 18,
  },
  {
    slug: "english-lead",
    fullName: "Айгерим Осмонова",
    position: t(
      "Англис тили боюнча жетекчи",
      "Руководитель направления «Английский язык»",
      "Head of English",
    ),
    bio: t(
      "IELTS 6.5+ даярдыгы: Speaking, Writing, Reading жана Mock Test'тер.",
      "Ведёт подготовку к IELTS от 6.5 балла: Speaking, Writing, Reading и Mock Tests.",
      "Runs IELTS preparation from band 6.5: speaking, writing, reading and mock tests.",
    ),
    subjects: [t("Англис тили", "Английский язык", "English")],
    yearsTeaching: 12,
  },
  {
    slug: "math-lead",
    fullName: "Нурлан Абдырахманов",
    position: t(
      "Математика боюнча жетекчи",
      "Руководитель направления «Математика»",
      "Head of Mathematics",
    ),
    bio: t(
      "Республикалык олимпиадага даярдайт, 7-класстан ОРТ курсун жүргүзөт.",
      "Готовит к республиканским олимпиадам и ведёт курс ОРТ с седьмого класса.",
      "Prepares students for national olympiads and teaches the ORT course from grade 7.",
    ),
    subjects: [t("Математика", "Математика", "Mathematics")],
    yearsTeaching: 15,
  },
  {
    slug: "primary-lead",
    fullName: "Жылдыз Токтосунова",
    position: t(
      "Башталгыч класстардын мугалими",
      "Учитель начальных классов",
      "Primary School Teacher",
    ),
    bio: t(
      "1–4-класстар. Окуу, эсеп жана биринчи англис сөздөрү — оюн жана аңгеме аркылуу.",
      "1–4 классы. Чтение, счёт и первые английские слова — через разговор и движение, а не через прописи.",
      "Grades 1–4. Reading, counting and first English words through talk and movement.",
    ),
    subjects: [t("Башталгыч класстар", "Начальные классы", "Primary")],
    yearsTeaching: 9,
  },
  {
    slug: "arabic",
    fullName: "Азамат Кадыров",
    position: t("Араб тилинин мугалими", "Учитель арабского языка", "Arabic Teacher"),
    bio: t(
      "Араб тили 1-класстан баштап — окуу, жазуу жана сүйлөшүү.",
      "Арабский язык с первого класса: чтение, письмо и разговорная практика.",
      "Arabic from grade 1: reading, writing and conversation.",
    ),
    subjects: [t("Араб тили", "Арабский язык", "Arabic")],
    yearsTeaching: 7,
  },
  {
    slug: "ethics",
    fullName: "Гүлнара Асанова",
    position: t("Этика (адеп-ахлак) мугалими", "Учитель этики (адеп-ахлак)", "Ethics Teacher"),
    bio: t(
      "Адеп-ахлак сабагы: сый-урмат, жоопкерчилик жана чечим кабыл алуу.",
      "Уроки адеп-ахлак: уважение, ответственность и умение принимать решения.",
      "Adep-akhlak lessons: respect, responsibility and decision-making.",
    ),
    subjects: [t("Этика", "Этика", "Ethics")],
    yearsTeaching: 11,
  },
  {
    slug: "finance-literacy",
    fullName: "Бактыгүл Иманова",
    position: t(
      "Каржы сабаттуулугунун мугалими",
      "Учитель финансовой грамотности",
      "Financial Literacy Teacher",
    ),
    bio: t(
      "Бюджет, топтоо жана баа коюу — мектеп бүткөнгө чейин керек болгон көндүмдөр.",
      "Бюджет, накопления и цена решения — навыки, которые нужны раньше, чем аттестат.",
      "Budgeting, saving and the cost of a decision — skills needed before graduation.",
    ),
    subjects: [t("Каржы сабаттуулугу", "Финансовая грамотность", "Financial literacy")],
    yearsTeaching: 6,
  },
  {
    slug: "science",
    fullName: "Эрлан Мамытов",
    position: t("Табигый илимдер мугалими", "Учитель естественных наук", "Science Teacher"),
    bio: t(
      "Физика жана химия — тажрыйба аркылуу, доскадан көчүрүү менен эмес.",
      "Физика и химия — через опыт на столе, а не переписывание с доски.",
      "Physics and chemistry through hands-on experiments, not board copying.",
    ),
    subjects: [t("Физика", "Физика", "Physics"), t("Химия", "Химия", "Chemistry")],
    yearsTeaching: 10,
  },
  {
    slug: "kyrgyz",
    fullName: "Асель Бейшеналиева",
    position: t("Кыргыз тили мугалими", "Учитель кыргызского языка", "Kyrgyz Language Teacher"),
    bio: t(
      "Кыргыз тили жана адабияты — эне тилде эркин жазуу жана сүйлөө.",
      "Кыргызский язык и литература: свободно писать и говорить на родном языке.",
      "Kyrgyz language and literature: writing and speaking freely in the mother tongue.",
    ),
    subjects: [t("Кыргыз тили", "Кыргызский язык", "Kyrgyz")],
    yearsTeaching: 13,
  },
  {
    slug: "pe",
    fullName: "Данияр Сыдыков",
    position: t("Дене тарбия мугалими", "Учитель физкультуры", "PE Teacher"),
    bio: t(
      "Футбол, баскетбол жана мектеп турнирлери — жаңы аянтчада.",
      "Футбол, баскетбол и школьные турниры — на своём поле с покрытием.",
      "Football, basketball and school tournaments on the school's own pitch.",
    ),
    subjects: [t("Дене тарбия", "Физкультура", "Physical education")],
    yearsTeaching: 8,
  },
];

export type DemoTeacherCard = {
  id: string;
  slug: string;
  fullName: string;
  position: string;
  bio: string;
  photoUrl: ImageSource | null;
  subjects: string[];
  yearsTeaching: number | null;
};

export function demoTeachers(locale: Locale, limit?: number): DemoTeacherCard[] {
  const list = DEMO_TEACHERS.map((teacher, index) => ({
    id: `demo-teacher-${teacher.slug}`,
    slug: teacher.slug,
    fullName: teacher.fullName,
    position: pickI18n(teacher.position, locale),
    bio: pickI18n(teacher.bio, locale),
    // Портреты идут по кругу: список педагогов длиннее набора фотографий.
    photoUrl: STOCK_PORTRAITS[index % STOCK_PORTRAITS.length] ?? null,
    subjects: teacher.subjects.map((s) => pickI18n(s, locale)).filter(Boolean),
    yearsTeaching: teacher.yearsTeaching,
  }));

  return limit ? list.slice(0, limit) : list;
}

/* ----------------------------------------------------------------- Новости */

type DemoNews = {
  slug: string;
  title: I18nText;
  excerpt: I18nText;
  body: I18nText;
  cover: ImageSource;
  /** Смещение от «сегодня» в днях — чтобы лента не протухала со временем. */
  daysAgo: number;
};

const DEMO_NEWS: DemoNews[] = [
  {
    slug: "respublikanskaya-olimpiada",
    title: t(
      "Республикалык олимпиадада — алтын, күмүш жана коло",
      "Республиканская олимпиада: золото, серебро и бронза",
      "National olympiad: gold, silver and bronze",
    ),
    excerpt: t(
      "Математика боюнча республикалык олимпиадада окуучуларыбыз үч медаль алып келишти.",
      "Наши ученики привезли три медали с республиканской олимпиады по математике.",
      "Our students brought home three medals from the national mathematics olympiad.",
    ),
    body: t(
      "Математика боюнча республикалык олимпиада аяктады. ДАНЕК окуучулары алтын, күмүш жана коло медалдарга ээ болушту.\n\nОлимпиадага даярдык кадимки сабактын үстүнө курулат: 5-класстан баштап кошумча математика тобу иштейт, ал эми жетишкендер өзүнчө мугалим менен машыгат. Медаль — ошол системанын жыйынтыгы, кокустук эмес.",
      "Завершилась республиканская олимпиада по математике. Ученики ДАНЕК взяли золото, серебро и бронзу.\n\nПодготовка к олимпиаде надстроена над обычным уроком: с пятого класса работает дополнительная математическая группа, а те, кто выходит на призовые места, занимаются с преподавателем отдельно. Медаль — результат этой системы, а не случайность.",
      "The national mathematics olympiad has ended, and DANEK students took gold, silver and bronze.\n\nOlympiad preparation is built on top of the regular lesson: an extra maths group runs from grade 5, and students reaching the podium work with a teacher one on one.",
    ),
    cover: STOCK_IMAGES.programsSubjectsMath,
    daysAgo: 12,
  },
  {
    slug: "priem-uchenikov",
    title: t(
      "1-класстан 10-класска чейин кабыл алуу ачык",
      "Открыт приём учеников с 1 по 10 класс",
      "Admissions open for grades 1 to 10",
    ),
    excerpt: t(
      "Жаңы окуу жылына жазылуу башталды. Орун чектелүү — топтор толгон сайын жабылат.",
      "Началась запись на новый учебный год. Мест ограниченное количество — набор в классе закрывается по мере заполнения.",
      "Enrolment for the new school year is open. Places are limited and close as each class fills up.",
    ),
    body: t(
      "Жаңы окуу жылына 1-класстан 10-класска чейин кабыл алуу башталды.\n\nАта-энелер үчүн тартип жөнөкөй: сайттан арыз калтырасыз, биз жумуш күнү ичинде чалабыз жана жолугушууга убакыт белгилейбиз. Жолугушууда мектепти көрсөтөбүз, мугалимдер менен тааныштырабыз жана бардык суроого жооп беребиз. Андан кийин бала болочок классында бир нече сынак күн өткөрөт — баа коюлбайт, басым жасалбайт.",
      "Открыт приём в 1–10 классы на новый учебный год.\n\nПорядок для родителя простой: вы оставляете заявку на сайте, мы перезваниваем в течение рабочего дня и договариваемся о встрече. На встрече показываем школу, знакомим с учителями и отвечаем на всё, что важно. Затем ребёнок проводит несколько пробных дней в будущем классе — без оценок и без давления.",
      "Admissions to grades 1–10 are open for the new school year.\n\nThe process is simple: leave a request on the site, we call back within one working day and arrange a visit. Then your child spends a few trial days in their future class — no grades, no pressure.",
    ),
    cover: STOCK_IMAGES.homeHeroKids,
    daysAgo: 21,
  },
  {
    slug: "skidki-na-godovoe-obuchenie",
    title: t(
      "Жылдык төлөмгө арзандатуу",
      "Скидки при оплате за год",
      "Discounts for annual payment",
    ),
    excerpt: t(
      "Окуу жылын толук төлөгөндө арзандатуу колдонулат. Так шарттарды кабылдамадан сураңыз.",
      "При оплате обучения сразу за год действует скидка. Точные условия — в приёмной школы.",
      "Paying the full year up front comes with a discount. Ask the admissions office for the exact terms.",
    ),
    body: t(
      "Окуу акысын жылга толук төлөгөн үй-бүлөлөр үчүн арзандатуу каралган. Ошондой эле бир үй-бүлөдөн бир нече бала окуса, өзүнчө шарт бар.\n\nСандар окуу жылына жараша өзгөрөт, ошондуктан аларды сайтта эмес, кабылдамадан тактаганыңызды суранабыз — чалыңыз же WhatsApp'ка жазыңыз.",
      "Для семей, которые вносят оплату сразу за учебный год, действует скидка. Отдельные условия предусмотрены, если в школе учатся несколько детей из одной семьи.\n\nЦифры меняются от года к году, поэтому мы не публикуем их на сайте: позвоните или напишите в WhatsApp — назовём актуальные суммы и посчитаем именно ваш случай.",
      "Families who pay for the full academic year up front receive a discount, and there are separate terms for siblings.\n\nAmounts change year to year, so we do not publish them here — call or message us on WhatsApp and we will quote your case.",
    ),
    cover: STOCK_IMAGES.lifeWriting,
    daysAgo: 30,
  },
  {
    slug: "vypusknoy",
    title: t("Бүтүрүүчүлөрдү узаттык", "Выпускной", "Graduation day"),
    excerpt: t(
      "Мектепти бүтүргөн окуучуларды узаттык — лента, гүл жана алдыда турган жол.",
      "Проводили выпускников: ленты, цветы и дорога, которая начинается дальше.",
      "We said goodbye to our graduates: ribbons, flowers and the road ahead.",
    ),
    body: t(
      "Бүтүрүүчүлөр кечеси өттү. Ар бир окуучу үчүн бул мектептин акыркы күнү, ал эми биз үчүн — жумуштун жыйынтыгы көрүнгөн күн.\n\nБүтүрүүчүлөрүбүздүн бир бөлүгү чет өлкөнүн университеттерине документ тапшырды, дагы бир бөлүгү ОРТ жыйынтыгы менен республиканын жогорку окуу жайларына кирди.",
      "Прошёл выпускной. Для учеников это последний школьный день, для нас — день, когда видно результат работы.\n\nЧасть выпускников подала документы в зарубежные университеты, часть поступила в вузы республики по результатам ОРТ. С документами и грантами помогали здесь же, в школе.",
      "Graduation day has passed. For students it is the last school day; for us it is the day the work becomes visible.\n\nSome graduates applied to universities abroad, others entered national universities on their ORT results.",
    ),
    cover: STOCK_IMAGES.lifeGraduation,
    daysAgo: 45,
  },
  {
    slug: "seminar-dlya-roditeley",
    title: t("Ата-энелер үчүн семинар", "Семинар для родителей", "Seminar for parents"),
    excerpt: t(
      "Өспүрүм менен кантип сүйлөшүү керек жана үй тапшырма боюнча талашты кантип токтотуу керек.",
      "Как говорить с подростком и как перестать воевать из-за домашнего задания.",
      "How to talk with a teenager and stop fighting over homework.",
    ),
    body: t(
      "Мектепте ата-энелер үчүн семинар өттү. Тема — үй тапшырма боюнча күнүмдүк талаш жана аны кантип токтотуу.\n\nСеминарлар үзгүлтүксүз өткөрүлөт жана бекер. Кийинки жолугушуунун күнү жарыяланганда, ал жеке кабинетте жана Instagram'да көрүнөт.",
      "В школе прошёл семинар для родителей. Тема — ежедневная война из-за домашнего задания и как из неё выйти.\n\nСеминары проходят регулярно и бесплатны для родителей учеников. Дату следующей встречи публикуем в личном кабинете и в Instagram школы.",
      "The school held a seminar for parents on the daily homework battle and how to end it.\n\nSeminars run regularly and are free for parents. The next date appears in the parent portal and on the school's Instagram.",
    ),
    cover: STOCK_IMAGES.parentsSeminar,
    daysAgo: 58,
  },
  {
    slug: "shkolnyy-turnir",
    title: t(
      "Мектеп ичиндеги футбол турнири",
      "Школьный турнир по футболу",
      "School football tournament",
    ),
    excerpt: t(
      "Жаңы аянтчада класстар аралык турнир өттү — 5-класстан 9-класска чейин.",
      "На новом поле прошёл турнир между классами — с пятого по девятый.",
      "The new pitch hosted an inter-class tournament for grades 5 through 9.",
    ),
    body: t(
      "Мектептин жаңы футбол аянтчасында класстар аралык турнир өттү. Беш класс катышты, финал акыркы мүнөттө чечилди.\n\nСпорт бөлүмдөрү — футбол, баскетбол жана жеңил атлетика — сабактан кийин иштейт жана окуу акысына кирет.",
      "На новом футбольном поле школы прошёл турнир между классами. Участвовали пять команд, финал решился на последней минуте.\n\nСпортивные секции — футбол, баскетбол и лёгкая атлетика — работают после уроков и входят в стоимость обучения.",
      "The school's new football pitch hosted an inter-class tournament. Five teams played and the final was decided in the last minute.\n\nSports clubs — football, basketball and athletics — run after lessons and are included in tuition.",
    ),
    cover: STOCK_IMAGES.lifeFootball,
    daysAgo: 70,
  },
];

export type DemoNewsCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: ImageSource | null;
  publishedAt: string;
};

export type DemoNewsArticle = DemoNewsCard & { body: string };

/**
 * Дата считается от переданного «сейчас», а не от Date.now() внутри модуля:
 * так один и тот же рендер страницы даёт одинаковые даты во всех карточках.
 */
function publishedAt(daysAgo: number, now: number): string {
  return new Date(now - daysAgo * 86_400_000).toISOString();
}

export function demoNews(locale: Locale, limit?: number): DemoNewsCard[] {
  const now = Date.now();

  const list = DEMO_NEWS.map((item) => ({
    id: `demo-news-${item.slug}`,
    slug: item.slug,
    title: pickI18n(item.title, locale),
    excerpt: pickI18n(item.excerpt, locale),
    coverUrl: item.cover,
    publishedAt: publishedAt(item.daysAgo, now),
  }));

  return limit ? list.slice(0, limit) : list;
}

export function demoNewsArticle(slug: string, locale: Locale): DemoNewsArticle | null {
  const item = DEMO_NEWS.find((news) => news.slug === slug);
  if (!item) return null;

  return {
    id: `demo-news-${item.slug}`,
    slug: item.slug,
    title: pickI18n(item.title, locale),
    excerpt: pickI18n(item.excerpt, locale),
    coverUrl: item.cover,
    publishedAt: publishedAt(item.daysAgo, Date.now()),
    body: pickI18n(item.body, locale),
  };
}

export function demoNewsSlugs(): string[] {
  return DEMO_NEWS.map((item) => item.slug);
}

/* ----------------------------------------------------------------- Галерея */

type DemoAlbum = {
  slug: string;
  title: I18nText;
  description: I18nText;
  daysAgo: number;
  photos: { image: ImageSource; alt: I18nText }[];
};

const DEMO_GALLERY: DemoAlbum[] = [
  {
    slug: "shkolnye-budni",
    title: t("Мектеп күндөрү", "Школьные будни", "Everyday school life"),
    description: t(
      "Кадимки сабактар: окуу, жазуу жана биргелешип иштөө.",
      "Обычные уроки: чтение, письмо и работа в группах.",
      "Ordinary lessons: reading, writing and group work.",
    ),
    daysAgo: 8,
    photos: [
      {
        image: STOCK_IMAGES.lifeClassroom,
        alt: t("Класстагы сабак", "Урок в классе", "A lesson in class"),
      },
      {
        image: STOCK_IMAGES.lifeStudy,
        alt: t("Биргелешип иштөө", "Работа в группе", "Working in a group"),
      },
      {
        image: STOCK_IMAGES.lifeReading,
        alt: t("Мугалим менен окуу", "Чтение с учителем", "Reading with a teacher"),
      },
      {
        image: STOCK_IMAGES.lifeWriting,
        alt: t("Дептердеги жазуу", "Работа в тетради", "Working in a notebook"),
      },
      {
        image: STOCK_IMAGES.programsPrimary,
        alt: t("Башталгыч класс", "Начальная школа", "Primary school"),
      },
      {
        image: STOCK_IMAGES.lifeArt,
        alt: t("Чыгармачылык сабагы", "Творческое занятие", "A creative class"),
      },
    ],
  },
  {
    slug: "sport",
    title: t("Спорт", "Спорт", "Sport"),
    description: t(
      "Футбол, баскетбол жана мектеп турнирлери.",
      "Футбол, баскетбол и школьные турниры.",
      "Football, basketball and school tournaments.",
    ),
    daysAgo: 26,
    photos: [
      { image: STOCK_IMAGES.lifeFootball, alt: t("Футбол", "Футбол", "Football") },
      { image: STOCK_IMAGES.lifeBasketball, alt: t("Баскетбол", "Баскетбол", "Basketball") },
      {
        image: STOCK_IMAGES.lifeSport,
        alt: t("Жеңил атлетика", "Лёгкая атлетика", "Athletics"),
      },
    ],
  },
  {
    slug: "prazdniki",
    title: t("Майрамдар жана бүтүрүү", "Праздники и выпускной", "Celebrations and graduation"),
    description: t(
      "Мектептин майрамдары, концерттери жана бүтүрүүчүлөр кечеси.",
      "Школьные праздники, концерты и выпускной.",
      "School celebrations, concerts and graduation.",
    ),
    daysAgo: 45,
    photos: [
      {
        image: STOCK_IMAGES.lifeCelebration,
        alt: t("Мектеп майрамы", "Школьный праздник", "A school celebration"),
      },
      {
        image: STOCK_IMAGES.lifeGraduation,
        alt: t("Бүтүрүүчүлөр кечеси", "Выпускной", "Graduation"),
      },
      {
        image: STOCK_IMAGES.lifeKids,
        alt: t("Тыныгуудагы окуучулар", "Ученики на перемене", "Students at break"),
      },
    ],
  },
  {
    slug: "kampus",
    title: t("Кампус жана тамактануу", "Кампус и питание", "Campus and meals"),
    description: t(
      "Мектеп имараты, китепкана жана үч маал тамак.",
      "Здание школы, библиотека и трёхразовое питание.",
      "The school building, the library and three meals a day.",
    ),
    daysAgo: 60,
    photos: [
      {
        image: STOCK_IMAGES.aboutMission,
        alt: t("Мектеп имараты", "Здание школы", "The school building"),
      },
      { image: STOCK_IMAGES.aboutCampus, alt: t("Мектеп короосу", "Двор школы", "School grounds") },
      { image: STOCK_IMAGES.aboutLibrary, alt: t("Китепкана", "Библиотека", "The library") },
      {
        image: STOCK_IMAGES.lifeMeals,
        alt: t("Мектеп ашканасы", "Школьное питание", "School meals"),
      },
    ],
  },
];

export type DemoGalleryPhoto = {
  id: string;
  url: ImageSource;
  alt: string;
  width: number | null;
  height: number | null;
  blurData: string | null;
};

export type DemoGalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: ImageSource | null;
  happenedOn: string | null;
  photos: DemoGalleryPhoto[];
};

export function demoGallery(locale: Locale): DemoGalleryAlbum[] {
  const now = Date.now();

  return DEMO_GALLERY.map((album) => {
    const photos = album.photos.map((photo, index) => ({
      id: `demo-photo-${album.slug}-${index}`,
      url: photo.image,
      alt: pickI18n(photo.alt, locale),
      width: null,
      height: null,
      blurData: null,
    }));

    return {
      id: `demo-album-${album.slug}`,
      slug: album.slug,
      title: pickI18n(album.title, locale),
      description: pickI18n(album.description, locale),
      coverUrl: photos[0]?.url ?? null,
      happenedOn: new Date(now - album.daysAgo * 86_400_000).toISOString().slice(0, 10),
      photos,
    };
  });
}

/* ---------------------------------------------------------------- Предметы */

/** Учебный план из открытого профиля школы плюс базовая государственная программа. */
const DEMO_SUBJECTS: { name: I18nText; color: string }[] = [
  { name: t("Англис тили", "Английский язык", "English"), color: "#16336b" },
  { name: t("Математика", "Математика", "Mathematics"), color: "#10864e" },
  { name: t("Араб тили", "Арабский язык", "Arabic"), color: "#96610a" },
  { name: t("Кыргыз тили", "Кыргызский язык", "Kyrgyz"), color: "#16336b" },
  { name: t("Орус тили", "Русский язык", "Russian"), color: "#16336b" },
  {
    name: t("Каржы сабаттуулугу", "Финансовая грамотность", "Financial literacy"),
    color: "#10864e",
  },
  { name: t("Этика (адеп-ахлак)", "Этика (адеп-ахлак)", "Ethics (adep-akhlak)"), color: "#96610a" },
  { name: t("Информатика", "Информатика", "Computer science"), color: "#10864e" },
  { name: t("Табият таануу", "Естествознание", "Natural science"), color: "#10864e" },
  { name: t("Физика", "Физика", "Physics"), color: "#16336b" },
  { name: t("Химия", "Химия", "Chemistry"), color: "#16336b" },
  { name: t("Биология", "Биология", "Biology"), color: "#10864e" },
  { name: t("География", "География", "Geography"), color: "#10864e" },
  { name: t("Тарых", "История", "History"), color: "#96610a" },
  { name: t("Дене тарбия", "Физкультура", "Physical education"), color: "#10864e" },
  { name: t("Сүрөт жана музыка", "ИЗО и музыка", "Art and music"), color: "#96610a" },
];

export function demoSubjects(locale: Locale) {
  return DEMO_SUBJECTS.map((subject, index) => ({
    id: `demo-subject-${index}`,
    name: pickI18n(subject.name, locale),
    color: subject.color,
  }));
}
