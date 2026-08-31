/**
 * Текстовые утилиты для таджикского реестра имён.
 * Строгий TypeScript, без внешних зависимостей.
 */

/** Специфические буквы таджикской кириллицы */
export const TAJIK_RARE_LETTERS = ["Ғ", "Қ", "Ҷ", "Ӯ", "Ӣ", "Ҳ"] as const;

const TAJIK_VOWELS = "аеёиоуэюяӣӯ";

/**
 * Мягкая нормализация: регистр, пробелы, апострофы.
 * НЕ схлопывает разные гласные — используется для точных сравнений.
 */
export function normalizeStrict(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019'`ʻ"]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Жёсткая нормализация: приводит распространённые варианты написания
 * (таджикская кириллица ↔ русская ↔ латиница) к общему виду.
 * Используется ТОЛЬКО для поиска похожих вариантов, но не для вывода
 * «имя официально разрешено».
 */
export function normalizeLoose(input: string): string {
  if (!input) return "";
  return normalizeStrict(input)
    .replace(/[\s\-ъь]/g, "")
    .replace(/ҳ/g, "х")
    .replace(/ҷ/g, "ж")
    .replace(/ӯ/g, "у")
    .replace(/ғ/g, "г")
    .replace(/қ/g, "к")
    .replace(/ӣ/g, "и")
    .replace(/ё/g, "е")
    .replace(/й/g, "и");
}

/**
 * Фонетическая нормализация (самая агрессивная): дополнительно схлопывает
 * близкие гласные. Только для подсказок «возможно, вы имели в виду».
 */
export function normalizePhonetic(input: string): string {
  return normalizeLoose(input)
    .replace(/о/g, "а")
    .replace(/[еэ]/g, "и")
    .replace(/я/g, "а")
    .replace(/ю/g, "у")
    .replace(/(.)\1+/g, "$1");
}

/** Расстояние Левенштейна (итеративное, O(n·m) память O(m)) */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr: number[] = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = [...curr];
  }
  return prev[b.length];
}

/** Похожесть 0..1 на основе расстояния Левенштейна */
export function similarity(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

/** Приблизительный подсчёт слогов по числу гласных */
export function countSyllables(name: string): number {
  const lower = name.toLowerCase();
  let count = 0;
  for (const ch of lower) {
    if (TAJIK_VOWELS.includes(ch)) count++;
  }
  return Math.max(1, count);
}

/** URL-safe slug из латинского написания имени */
export function toSlug(latin: string, fallback: string): string {
  const base = (latin || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback.toLowerCase();
}

/** Содержит ли имя редкие таджикские буквы */
export function hasRareLetters(name: string): boolean {
  const upper = name.toUpperCase();
  return TAJIK_RARE_LETTERS.some((l) => upper.includes(l));
}

/** Корень имени (для подбора пар брат/сестра) — первые 4-5 значимых букв */
export function nameRoot(name: string): string {
  const loose = normalizeLoose(name);
  return loose.slice(0, Math.min(5, Math.max(3, Math.floor(loose.length * 0.6))));
}
