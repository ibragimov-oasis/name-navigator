import {
  TajikRegistryName,
  TajikAlphabetStat,
  NameCheckResult,
  TajikNameSuggestion,
  TajikRegistryCounts,
} from "./tajikTypes";
import {
  normalizeStrict,
  normalizeLoose,
  normalizePhonetic,
  similarity,
  toSlug,
} from "@/lib/tajik/text";

/** Буквы таджикской кириллицы в алфавитном порядке */
export const TAJIK_ALPHABET = [
  "А", "Б", "В", "Г", "Ғ", "Д", "Е", "Ё", "Ж", "З", "И", "Ӣ", "Й", "К", "Қ", "Л", "М",
  "Н", "О", "П", "Р", "С", "Т", "У", "Ӯ", "Ф", "Х", "Ҳ", "Ч", "Ҷ", "Ш", "Э", "Ю", "Я",
] as const;

export const TAJIK_REGISTRY_SOURCE_URL = "https://www.kumitaizabon.tj/";
export const TAJIK_REGISTRY_DECREE =
  "Қарори Ҳукумати Ҷумҳурии Тоҷикистон аз 26 феврали соли 2026, №98";

/**
 * Обратная совместимость: агрессивная нормализация запроса.
 * Для точных сравнений используйте normalizeStrict из @/lib/tajik/text.
 */
export function normalizeNameQuery(str: string): string {
  return normalizePhonetic(str);
}

/** Слаг имени для пермалинков (?name=abirafshon) */
export function tajikNameSlug(name: TajikRegistryName): string {
  return toSlug(name.name_latin, name.id);
}

interface IndexedName {
  item: TajikRegistryName;
  strict: string[];
  loose: string[];
  phonetic: string[];
  haystack: string;
}

const indexCache = new WeakMap<readonly TajikRegistryName[], IndexedName[]>();

/** Предпосчитанный поисковый индекс (кэшируется по ссылке на массив) */
export function buildSearchIndex(names: readonly TajikRegistryName[]): IndexedName[] {
  const cached = indexCache.get(names);
  if (cached) return cached;

  const index: IndexedName[] = names.map((item) => {
    const variants = [item.name_tj, item.name_cyrillic, item.name_latin];
    return {
      item,
      strict: variants.map(normalizeStrict),
      loose: variants.map(normalizeLoose),
      phonetic: variants.map(normalizePhonetic),
      haystack: [
        item.name_tj,
        item.name_tj_raw,
        item.name_cyrillic,
        item.name_latin,
        item.meaning ?? "",
      ]
        .join(" ")
        .toLowerCase(),
    };
  });

  indexCache.set(names, index);
  return index;
}

/** Быстрый полнотекстовый поиск по индексу */
export function searchRegistry(
  names: readonly TajikRegistryName[],
  query: string
): TajikRegistryName[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...names];
  return buildSearchIndex(names)
    .filter((entry) => entry.haystack.includes(q))
    .map((entry) => entry.item);
}

/**
 * Проверка имени на официальную разрешённость.
 * permitted — только точное совпадение написания.
 */
export function checkTajikNameLegality(
  query: string,
  names: readonly TajikRegistryName[]
): NameCheckResult {
  const clean = query.trim();
  if (!clean) {
    return {
      query: "",
      status: "not_found",
      isPermitted: false,
      closeMatches: [],
      suggestions: [],
      recommendation: "Номро ворид кунед / Введите имя для проверки",
    };
  }

  const index = buildSearchIndex(names);
  const strict = normalizeStrict(clean);
  const loose = normalizeLoose(clean);
  const phonetic = normalizePhonetic(clean);

  const exact = index.find((e) => e.strict.includes(strict));
  const looseMatch = exact ?? index.find((e) => e.loose.includes(loose));

  // Кандидаты для подсказок
  const suggestions: TajikNameSuggestion[] = [];
  for (const entry of index) {
    if (entry.item === exact?.item) continue;
    let best = 0;
    for (const variant of entry.phonetic) {
      if (variant === phonetic) {
        best = Math.max(best, 0.99);
        continue;
      }
      if (Math.abs(variant.length - phonetic.length) > 3) continue;
      best = Math.max(best, similarity(variant, phonetic));
    }
    if (best >= 0.72) suggestions.push({ name: entry.item, score: best });
  }
  suggestions.sort((a, b) => b.score - a.score);
  const top = suggestions.slice(0, 10);

  if (exact) {
    return {
      query: clean,
      status: "permitted",
      isPermitted: true,
      exactMatch: exact.item,
      closeMatches: [exact.item, ...top.slice(0, 5).map((s) => s.name)],
      suggestions: top,
      recommendation: `Номи «${exact.item.name_tj}» расман дар Феҳристи номҳои миллии Ҷумҳурии Тоҷикистон (${TAJIK_REGISTRY_DECREE}) тасдиқ шудааст ва барои сабт дар мақомоти САҲШ (ЗАГС) иҷозат дода мешавад.`,
    };
  }

  if (looseMatch) {
    return {
      query: clean,
      status: "likely",
      isPermitted: false,
      exactMatch: undefined,
      closeMatches: [looseMatch.item, ...top.slice(0, 5).map((s) => s.name)],
      suggestions: [{ name: looseMatch.item, score: 0.95 }, ...top],
      recommendation: `Дар феҳрист номи наздик «${looseMatch.item.name_tj}» мавҷуд аст. Навишти шумо каме фарқ мекунад — барои сабти расмӣ маҳз шакли феҳрист «${looseMatch.item.name_tj}» (${looseMatch.item.name_latin}) истифода бурда мешавад.`,
    };
  }

  return {
    query: clean,
    status: "not_found",
    isPermitted: false,
    closeMatches: top.slice(0, 8).map((s) => s.name),
    suggestions: top,
    recommendation: `Номи «${clean}» дар феҳристи расмии номҳои миллӣ ёфт нашуд. Тибқи моддаи 20¹ Қонуни ҶТ «Дар бораи бақайдгирии давлатии асноди ҳолати шаҳрвандӣ» барои сабт танҳо номҳои феҳрист истифода мешаванд.`,
  };
}

/** Статистика по буквам алфавита */
export function getTajikAlphabetStats(
  names: readonly TajikRegistryName[]
): TajikAlphabetStat[] {
  const map = new Map<string, TajikAlphabetStat>();

  for (const letter of TAJIK_ALPHABET) {
    map.set(letter, { letter, count: 0, maleCount: 0, femaleCount: 0 });
  }

  for (const n of names) {
    const letter = (n.letter || n.name_tj.charAt(0)).toUpperCase();
    const stat = map.get(letter) ?? { letter, count: 0, maleCount: 0, femaleCount: 0 };
    stat.count++;
    if (n.gender === "male") stat.maleCount++;
    else stat.femaleCount++;
    map.set(letter, stat);
  }

  return [...map.values()].sort((a, b) => a.letter.localeCompare(b.letter, "tg"));
}

/** Сводные счётчики */
export function getTajikCounts(names: readonly TajikRegistryName[]): TajikRegistryCounts {
  let male = 0;
  let female = 0;
  let enriched = 0;
  for (const n of names) {
    if (n.gender === "male") male++;
    else female++;
    if (n.is_enriched || n.meaning) enriched++;
  }
  return { total: names.length, male, female, enriched };
}
