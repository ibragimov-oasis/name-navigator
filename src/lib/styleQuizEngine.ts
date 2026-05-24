// Локальный «Nameberry-style» DNA quiz — без AI, чистая математика.
// 10 вопросов × веса по 8 стилям → топ-2 стиля → подбор имён из существующей базы.
import { getChildNames } from "@/lib/namesStore";
import type { ChildName } from "@/data/types";

export type Style =
  | "classic"     // классика, привычные
  | "spiritual"   // духовные, религиозные
  | "nature"      // природа, цветы, свет
  | "vintage"     // старинные, забытые
  | "strong"      // сила, благородство
  | "soft"        // нежность, любовь
  | "rare"        // редкие, необычные
  | "global";     // международные, многоязычные

export const STYLE_META: Record<Style, { label: string; emoji: string; desc: string }> = {
  classic:   { label: "Классический",   emoji: "🏛️", desc: "Проверенные временем имена, которые звучат уверенно и узнаваемо." },
  spiritual: { label: "Духовный",       emoji: "🕌", desc: "Имена с религиозным смыслом — пророки, праведники, благословения." },
  nature:    { label: "Природный",      emoji: "🌿", desc: "Свет, цветы, звёзды, элементы природы — живые и тёплые имена." },
  vintage:   { label: "Винтажный",      emoji: "📜", desc: "Старинные имена с глубокой историей, редко встречающиеся сегодня." },
  strong:    { label: "Сильный",        emoji: "🦁", desc: "Имена с энергией силы, благородства и мужества." },
  soft:      { label: "Нежный",         emoji: "🌸", desc: "Мягкое звучание, ассоциации с любовью, добротой, миром." },
  rare:      { label: "Редкий",         emoji: "💎", desc: "Необычные имена, которые выделяют, но не звучат странно." },
  global:    { label: "Международный",  emoji: "🌍", desc: "Имена, которые легко читаются в разных культурах и языках." },
};

export interface QuizOption {
  label: string;
  weights: Partial<Record<Style, number>>;
}
export interface QuizQuestion {
  q: string;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    q: "Какое имя вам ближе по звучанию?",
    options: [
      { label: "Александр, Мария",  weights: { classic: 3, strong: 1 } },
      { label: "Мухаммад, Айша",    weights: { spiritual: 3, classic: 1 } },
      { label: "Заря, Лейла",       weights: { nature: 3, soft: 1 } },
      { label: "Эмир, Зара",        weights: { rare: 2, global: 2 } },
    ],
  },
  {
    q: "Что важнее в имени?",
    options: [
      { label: "Значение и смысл",          weights: { spiritual: 3, vintage: 1 } },
      { label: "Красивое звучание",         weights: { soft: 3, nature: 1 } },
      { label: "Сила и характер",           weights: { strong: 3, classic: 1 } },
      { label: "Чтобы было редким",         weights: { rare: 3, vintage: 1 } },
    ],
  },
  {
    q: "Имя должно быть…",
    options: [
      { label: "Узнаваемым везде",      weights: { classic: 2, global: 2 } },
      { label: "С глубокими корнями",   weights: { spiritual: 2, vintage: 2 } },
      { label: "Как у героя",           weights: { strong: 3 } },
      { label: "Уникальным",            weights: { rare: 3 } },
    ],
  },
  {
    q: "Какой образ вам ближе?",
    options: [
      { label: "Цветущий сад",     weights: { nature: 3, soft: 1 } },
      { label: "Древний город",    weights: { vintage: 2, spiritual: 2 } },
      { label: "Горный орёл",      weights: { strong: 3 } },
      { label: "Звёздное небо",    weights: { nature: 2, rare: 2 } },
    ],
  },
  {
    q: "Любимая длина имени?",
    options: [
      { label: "Короткое (3–4 буквы)", weights: { strong: 2, global: 2 } },
      { label: "Среднее (5–6 букв)",   weights: { classic: 2, soft: 1 } },
      { label: "Длинное (7+)",         weights: { spiritual: 2, vintage: 2 } },
      { label: "Не важно",             weights: { rare: 1, nature: 1 } },
    ],
  },
  {
    q: "Если бы имя было цветом…",
    options: [
      { label: "Тёплый бежевый",   weights: { soft: 3, vintage: 1 } },
      { label: "Глубокий синий",   weights: { classic: 2, strong: 2 } },
      { label: "Золотой",          weights: { spiritual: 2, strong: 2 } },
      { label: "Изумрудный",       weights: { nature: 3, rare: 1 } },
    ],
  },
  {
    q: "Что вы цените в семейных традициях?",
    options: [
      { label: "Веру и духовность",     weights: { spiritual: 4 } },
      { label: "Связь поколений",       weights: { vintage: 3, classic: 1 } },
      { label: "Свободу выбора",        weights: { rare: 2, global: 2 } },
      { label: "Тепло и заботу",        weights: { soft: 3, nature: 1 } },
    ],
  },
  {
    q: "Как должно звучать имя на детской площадке?",
    options: [
      { label: "Привычно и понятно",    weights: { classic: 3, global: 1 } },
      { label: "Особенно, выделяться",  weights: { rare: 3, vintage: 1 } },
      { label: "Мягко и ласково",       weights: { soft: 3 } },
      { label: "Уверенно и звонко",     weights: { strong: 3 } },
    ],
  },
  {
    q: "Какой герой ближе по духу?",
    options: [
      { label: "Пророк или мудрец",     weights: { spiritual: 4 } },
      { label: "Воин-защитник",         weights: { strong: 3 } },
      { label: "Поэт или художник",     weights: { soft: 2, nature: 2 } },
      { label: "Учёный-первооткрыватель", weights: { rare: 2, classic: 2 } },
    ],
  },
  {
    q: "Ребёнок вырастет — где ему пригодится имя больше всего?",
    options: [
      { label: "В родной культуре",     weights: { spiritual: 2, classic: 2 } },
      { label: "За рубежом тоже",       weights: { global: 4 } },
      { label: "В творческой среде",    weights: { rare: 2, nature: 2 } },
      { label: "В деловой сфере",       weights: { classic: 2, strong: 2 } },
    ],
  },
];

export interface QuizResult {
  scores: Record<Style, number>;
  top: Style[]; // top-2
}

export function scoreQuiz(answers: number[]): QuizResult {
  const scores: Record<Style, number> = {
    classic: 0, spiritual: 0, nature: 0, vintage: 0,
    strong: 0, soft: 0, rare: 0, global: 0,
  };
  answers.forEach((idx, qi) => {
    const opt = QUIZ[qi]?.options[idx];
    if (!opt) return;
    for (const [s, w] of Object.entries(opt.weights)) {
      scores[s as Style] += w as number;
    }
  });
  const top = (Object.keys(scores) as Style[])
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 2);
  return { scores, top };
}

// Оценка имени по стилям — без правки базы. Используем существующие поля.
function nameStyleScore(n: ChildName, style: Style): number {
  const attrs = n.attributes.map((a) => a.toLowerCase()).join(" ");
  const culture = (n.culture || "").toLowerCase();
  const origin = (n.origin || "").toLowerCase();
  const religion = (n.religion || "").toLowerCase();
  const len = n.name.length;
  const pop = n.popularity;

  switch (style) {
    case "classic":
      return (pop >= 70 ? 3 : pop >= 50 ? 2 : 0) + (/русск|славян|европ|латин|греч/.test(origin + culture) ? 1 : 0);
    case "spiritual":
      return (religion ? 3 : 0) + (/коран|пророк|святой|вер|благодат|правед/.test(attrs) ? 2 : 0);
    case "nature":
      return /природ|цвет|свет|сия|звезд|луна|солнц|вода|огонь|зар|роза|лили/.test(attrs + " " + n.meaning.toLowerCase()) ? 4 : 0;
    case "vintage":
      return (pop < 40 ? 2 : 0) + (/старин|древн|винтаж|забыт/.test(attrs) ? 2 : 0) + (n.history && n.history.length > 200 ? 1 : 0);
    case "strong":
      return /сил|мужеств|благородн|воин|лев|орёл|орел|храбр|защит|власт|царь|корол/.test(attrs + " " + n.meaning.toLowerCase()) ? 4 : 0;
    case "soft":
      return /нежн|любов|добр|мир|тих|ласков|мягк|спокой|свет|радост/.test(attrs + " " + n.meaning.toLowerCase()) ? 4 : 0;
    case "rare":
      return (pop < 30 ? 3 : pop < 50 ? 1 : 0);
    case "global":
      return (n.languages && n.languages.length >= 3 ? 3 : 0) + (len <= 5 ? 1 : 0) + (/арабск|интернац|латин|англ/.test(origin + culture) ? 1 : 0);
  }
}

export function pickNamesForStyles(top: Style[], gender?: "male" | "female", limit = 30): ChildName[] {
  const all = getChildNames();
  const scored = all
    .filter((n) => !gender || n.gender === gender || n.gender === "unisex")
    .map((n) => ({
      n,
      score: top.reduce((acc, s, i) => acc + nameStyleScore(n, s) * (i === 0 ? 1.5 : 1), 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.n.popularity - a.n.popularity);
  return scored.slice(0, limit).map((x) => x.n);
}
