/**
 * Compatibility engine between two people.
 * Combines phonetic harmony, numerology (Abjad/Pythagorean),
 * cultural/religious match and shared/complementary attributes.
 * Pure client-side, no backend.
 */
import { calculateNumerology, getCompatibility, DESTINY_TRAITS } from "@/lib/numerology";
import { Person } from "@/lib/people";

export type Axis = "phonetic" | "numerology" | "cultural" | "attributes" | "lifepath";

export interface AxisScore {
  axis: Axis;
  label: string;
  score: number; // 0-100
  detail: string;
}

export interface CompatibilityResult {
  total: number; // 0-100
  axes: AxisScore[];
  strengths: string[];
  watchOuts: string[];
  advice: string[];
  /** Compact summary line for sharing / RAG prompt */
  summary: string;
}

/* ------------- phonetic ------------- */

const VOWELS = new Set("аеёиоуыэюяaeiouy".split(""));

function phoneticScore(a: string, b: string): { score: number; detail: string } {
  if (!a || !b) return { score: 50, detail: "недостаточно данных" };
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const lastA = al.slice(-1);
  const firstB = bl.slice(0, 1);
  const transition = lastA === firstB
    ? 35
    : VOWELS.has(lastA) !== VOWELS.has(firstB)
    ? 90
    : 60;

  const vA = [...al].filter((c) => VOWELS.has(c)).length / Math.max(al.length, 1);
  const vB = [...bl].filter((c) => VOWELS.has(c)).length / Math.max(bl.length, 1);
  const vDiff = Math.abs(vA - vB);
  const vowelBalance = Math.round(100 - vDiff * 200); // closer = better

  const lenDiff = Math.abs(al.length - bl.length);
  const lenScore = lenDiff <= 2 ? 90 : lenDiff <= 4 ? 70 : 50;

  const score = Math.round(transition * 0.5 + vowelBalance * 0.3 + lenScore * 0.2);
  const detail =
    score >= 80
      ? "имена красиво звучат вместе"
      : score >= 60
      ? "звучание гармоничное"
      : "звуки конфликтуют — повторите вслух";
  return { score: Math.max(0, Math.min(100, score)), detail };
}

/* ------------- cultural ------------- */

function detectScript(name: string): "cyrillic" | "latin" | "arabic" | "mixed" {
  const hasCyr = /[а-яё]/i.test(name);
  const hasLat = /[a-z]/i.test(name);
  const hasArab = /[\u0600-\u06FF]/.test(name);
  const flags = [hasCyr, hasLat, hasArab].filter(Boolean).length;
  if (flags > 1) return "mixed";
  if (hasArab) return "arabic";
  if (hasCyr) return "cyrillic";
  return "latin";
}

function culturalScore(p1: Person, p2: Person): { score: number; detail: string } {
  const s1 = detectScript(p1.fullName);
  const s2 = detectScript(p2.fullName);
  if (s1 === s2) {
    return { score: 90, detail: "одна культурная среда — глубокое взаимопонимание" };
  }
  // arabic + cyrillic (e.g. русский мусульманин) — частая и совместимая
  if ((s1 === "arabic" && s2 === "cyrillic") || (s1 === "cyrillic" && s2 === "arabic")) {
    return { score: 75, detail: "разные алфавиты, но общая исламская традиция" };
  }
  return { score: 60, detail: "разные культурные коды — взаимное обогащение" };
}

/* ------------- attributes / life path ------------- */

function lifePathScore(p1: Person, p2: Person): { score: number; detail: string } {
  if (!p1.birthDate || !p2.birthDate) {
    return { score: 60, detail: "укажите даты рождения для точного расчёта" };
  }
  const sum = (d: string) => {
    const digits = d.replace(/\D/g, "");
    let n = digits.split("").reduce((a, c) => a + Number(c), 0);
    while (n > 9) n = n.toString().split("").reduce((a, c) => a + Number(c), 0);
    return n || 1;
  };
  const a = sum(p1.birthDate);
  const b = sum(p2.birthDate);
  const diff = Math.abs(a - b);
  const map: Record<number, number> = { 0: 100, 1: 88, 2: 75, 3: 70, 4: 60, 5: 55, 6: 65, 7: 70, 8: 50, 9: 60 };
  const score = map[diff] ?? 60;
  return {
    score,
    detail: `жизненные пути ${a} и ${b} ${score >= 75 ? "созвучны" : score >= 60 ? "дополняют друг друга" : "учат терпению"}`,
  };
}

function attributesAxis(p1: Person, p2: Person): { score: number; detail: string } {
  const samePolarity = p1.gender === p2.gender;
  const pair = `${p1.relation}|${p2.relation}`;
  const friendly = ["self|spouse", "spouse|self", "self|child", "child|self", "parent|child", "child|parent"];
  const hard = ["self|self"];
  if (hard.includes(pair)) return { score: 50, detail: "слишком близкие зоны — нужен внешний взгляд" };

  // Special boost: parent ↔ child — phonetic harmony with patronymic matters most
  if (pair === "parent|child" || pair === "child|parent") {
    return { score: 90, detail: "родитель и ребёнок — связь имени и отчества, важно созвучие" };
  }
  // Spouse ↔ spouse — extra weight to cultural alignment
  if (pair === "spouse|spouse" || pair === "self|spouse" || pair === "spouse|self") {
    return { score: 85, detail: "супружеская пара — баланс культур и характеров" };
  }
  if (friendly.includes(pair))
    return { score: 85, detail: "роли естественно дополняют друг друга" };
  return {
    score: samePolarity ? 70 : 78,
    detail: samePolarity ? "схожая энергия, общие ценности" : "разная энергия — баланс",
  };
}

/* ------------- main ------------- */

export function calculatePersonCompatibility(p1: Person, p2: Person): CompatibilityResult {
  const phon = phoneticScore(p1.fullName, p2.fullName);
  const numCompat = getCompatibility(p1.fullName, p2.fullName);
  const cult = culturalScore(p1, p2);
  const life = lifePathScore(p1, p2);
  const attrs = attributesAxis(p1, p2);

  const axes: AxisScore[] = [
    { axis: "phonetic", label: "Звучание имён", score: phon.score, detail: phon.detail },
    { axis: "numerology", label: "Нумерология", score: numCompat.score, detail: numCompat.description },
    { axis: "cultural", label: "Культура", score: cult.score, detail: cult.detail },
    { axis: "lifepath", label: "Жизненный путь", score: life.score, detail: life.detail },
    { axis: "attributes", label: "Роли и характер", score: attrs.score, detail: attrs.detail },
  ];

  // Weighted total
  const weights: Record<Axis, number> = {
    phonetic: 0.2,
    numerology: 0.25,
    cultural: 0.15,
    lifepath: 0.25,
    attributes: 0.15,
  };
  const total = Math.round(
    axes.reduce((sum, a) => sum + a.score * (weights[a.axis] ?? 0.2), 0)
  );

  const strengths = axes.filter((a) => a.score >= 75).map((a) => `${a.label}: ${a.detail}`);
  const watchOuts = axes.filter((a) => a.score < 60).map((a) => `${a.label}: ${a.detail}`);

  // Advice
  const n1 = calculateNumerology(p1.fullName).destinyNumber;
  const n2 = calculateNumerology(p2.fullName).destinyNumber;
  const t1 = DESTINY_TRAITS[n1]?.title ?? "—";
  const t2 = DESTINY_TRAITS[n2]?.title ?? "—";
  const advice: string[] = [
    `${p1.fullName} (${t1}) и ${p2.fullName} (${t2}) — учитывайте эти роли в общении.`,
    total >= 75
      ? "Сильная пара — развивайте общие проекты и совместные практики."
      : total >= 55
      ? "Стабильная связь — уделите внимание зонам ниже 60 баллов."
      : "Парадокс роста: различия станут силой, если вы их обсуждаете.",
    "Перечитайте имя друг друга вслух — звук создаёт настрой.",
  ];

  const summary = `${p1.fullName} ↔ ${p2.fullName}: ${total}/100. Сильно: ${
    strengths.slice(0, 2).map((s) => s.split(":")[0]).join(", ") || "—"
  }. Внимание: ${watchOuts.slice(0, 1).map((s) => s.split(":")[0]).join(", ") || "ничего критичного"}.`;

  return { total, axes, strengths, watchOuts, advice, summary };
}
