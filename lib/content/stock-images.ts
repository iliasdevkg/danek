/**
 * Фотографии витрины — до того, как школа загрузит свои через CRM.
 *
 * Каждая привязана к конкретному месту на сайте, а не лежит «про запас»:
 * имя ключа читается как адрес блока. Как только в site_settings, teachers
 * или gallery_photos появится собственный снимок, компонент покажет его
 * вместо этого файла — приоритет решает сам компонент, здесь только пути.
 *
 * Импорт из assets/, а не public/: next/image статически анализирует такой
 * импорт на сборке, сам считает размеры, генерирует blur-заглушку и раздаёт
 * AVIF/WebP. Ни одного запроса к чужому CDN и ни одного сдвига раскладки.
 *
 * Источник — Unsplash (свободная лицензия, коммерческое использование
 * разрешено без атрибуции).
 */
import type { StaticImageData } from "next/image";

import aboutLibrary from "@/assets/images/about-library.jpg";
import artClass from "@/assets/images/art-class.jpg";
import campusBuilding from "@/assets/images/campus-building.jpg";
import campusLawn from "@/assets/images/campus-lawn.jpg";
import celebration from "@/assets/images/celebration.jpg";
import classroomWide from "@/assets/images/classroom-wide.jpg";
import graduation from "@/assets/images/graduation.jpg";
import heroClassroom from "@/assets/images/hero-classroom.jpg";
import heroDeskWork from "@/assets/images/hero-desk-work.jpg";
import heroGirlBoard from "@/assets/images/hero-girl-board.jpg";
import heroKidsWalking from "@/assets/images/hero-kids-walking.jpg";
import kidsTogether from "@/assets/images/kids-together.jpg";
import lectureHall from "@/assets/images/lecture-hall.jpg";
import libraryReading from "@/assets/images/library-reading.jpg";
import parentsSeminar from "@/assets/images/parents-seminar.jpg";
import prepStudents from "@/assets/images/prep-students.jpg";
import programMiddle from "@/assets/images/program-middle.jpg";
import programPrep from "@/assets/images/program-prep.jpg";
import programPrimary from "@/assets/images/program-primary.jpg";
import studyTogether from "@/assets/images/study-together.jpg";
import subjectEnglish from "@/assets/images/subject-english.jpg";
import subjectMath from "@/assets/images/subject-math.jpg";
import teachersBanner from "@/assets/images/teachers-banner.jpg";
import writingHand from "@/assets/images/writing-hand.jpg";

import lifeBasketball from "@/assets/images/life/basketball.jpg";
import lifeFootball from "@/assets/images/life/football.jpg";
import lifeMeals from "@/assets/images/life/meals.jpg";
import lifeSportTrack from "@/assets/images/life/sport-track.jpg";

import teacher01 from "@/assets/images/teachers/teacher-01.jpg";
import teacher02 from "@/assets/images/teachers/teacher-02.jpg";
import teacher03 from "@/assets/images/teachers/teacher-03.jpg";
import teacher04 from "@/assets/images/teachers/teacher-04.jpg";
import teacher05 from "@/assets/images/teachers/teacher-05.jpg";
import teacher06 from "@/assets/images/teachers/teacher-06.jpg";
import teacher07 from "@/assets/images/teachers/teacher-07.jpg";
import teacher08 from "@/assets/images/teachers/teacher-08.jpg";
import teacher09 from "@/assets/images/teachers/teacher-09.jpg";
import teacher10 from "@/assets/images/teachers/teacher-10.jpg";

/**
 * Источник картинки для next/image.
 *
 * Строка — снимок школы из Supabase Storage, объект — локальный файл со
 * встроенными размерами и blur-заглушкой. Компоненты принимают оба варианта,
 * поэтому переход с демонстрационных фото на настоящие не требует правок
 * вёрстки: меняется только значение.
 */
export type ImageSource = string | StaticImageData;

/**
 * Адрес картинки строкой — для мест, где объект не примут: OpenGraph, JSON-LD,
 * атрибут `content` у мета-тега.
 *
 * У локального импорта путь лежит в поле `src` и уже содержит хеш содержимого,
 * поэтому ссылка не протухает между сборками.
 */
export function imageSourceUrl(src: ImageSource): string {
  return typeof src === "string" ? src : src.src;
}

export const STOCK_IMAGES = {
  /** Обложка главной: начальный класс, поднятые руки. */
  homeHero: heroClassroom,
  /** Малые кадры коллажа на обложке. */
  homeHeroKids: heroKidsWalking,
  homeHeroBoard: heroGirlBoard,
  homeHeroDesk: heroDeskWork,

  /** «О школе»: здание и двор. */
  aboutMission: campusBuilding,
  aboutCampus: campusLawn,
  aboutLibrary: aboutLibrary,

  /** Ступени обучения. */
  programsPrimary: programPrimary,
  programsMiddle: programMiddle,
  programsPrep: programPrep,
  programsSubjectsMath: subjectMath,
  programsSubjectsEnglish: subjectEnglish,

  /** Школьная жизнь. */
  lifeMeals: lifeMeals,
  lifeFootball: lifeFootball,
  lifeBasketball: lifeBasketball,
  lifeSport: lifeSportTrack,
  lifeCelebration: celebration,
  lifeGraduation: graduation,
  lifeArt: artClass,
  lifeKids: kidsTogether,
  lifeClassroom: classroomWide,
  lifeStudy: studyTogether,
  lifeReading: libraryReading,
  lifeWriting: writingHand,

  /** Родителям: семинары и встречи. */
  parentsSeminar: parentsSeminar,
  parentsHall: lectureHall,

  /** Баннер раздела «Педагоги». */
  teachersBanner: teachersBanner,

  /** Подготовка к экзаменам. */
  prepStudents: prepStudents,
} as const satisfies Record<string, ImageSource>;

/** Портреты для демонстрационных карточек педагогов. */
export const STOCK_PORTRAITS: readonly StaticImageData[] = [
  teacher01,
  teacher02,
  teacher03,
  teacher04,
  teacher05,
  teacher06,
  teacher07,
  teacher08,
  teacher09,
  teacher10,
];
