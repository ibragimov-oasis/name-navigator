import tajikDataRaw from "./tajikRegistryData.json";
import { TajikRegistryName, TajikAlphabetStat, NameCheckResult } from "./tajikTypes";

export const tajikRegistryNames: TajikRegistryName[] = (tajikDataRaw as TajikRegistryName[]);

// Unique Tajik letters in alphabet order
export const TAJIK_ALPHABET = [
  "А", "Б", "В", "Г", "Ғ", "Д", "Ё", "Ж", "З", "И", "Ӣ", "К", "Қ", "Л", "М",
  "Н", "О", "П", "Р", "С", "Т", "У", "Ӯ", "Ф", "Х", "Ҳ", "Ч", "Ҷ", "Ш", "Э", "Ю", "Я"
];

// Helper to normalize strings for comparison
export function normalizeNameQuery(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/['"`ʻ’ъь\s\-]/g, "")
    .replace(/ҳ/g, "х")
    .replace(/ҷ/g, "ж")
    .replace(/ӯ/g, "у")
    .replace(/ғ/g, "г")
    .replace(/қ/g, "к")
    .replace(/ӣ/g, "и")
    .replace(/о/g, "а")
    .replace(/е/g, "и")
    .replace(/э/g, "и")
    .replace(/я/g, "а")
    .replace(/ю/g, "у");
}

// Function to check if an input name is officially permitted in Tajikistan
export function checkTajikNameLegality(query: string): NameCheckResult {
  const clean = query.trim();
  if (!clean) {
    return {
      query: "",
      isPermitted: false,
      closeMatches: [],
      recommendation: "Номро ворид кунед / Введите имя для проверки",
    };
  }

  const queryLower = clean.toLowerCase();
  const queryNorm = normalizeNameQuery(clean);

  // 1. Exact match by Tajik, Cyrillic or Latin
  const exact = tajikRegistryNames.find(
    (n) =>
      n.name_tj.toLowerCase() === queryLower ||
      n.name_tj_raw.toLowerCase() === queryLower ||
      n.name_cyrillic.toLowerCase() === queryLower ||
      n.name_latin.toLowerCase() === queryLower
  );

  if (exact) {
    return {
      query: clean,
      isPermitted: true,
      exactMatch: exact,
      closeMatches: [exact],
      recommendation: `Номи «${exact.name_tj}» расман дар Феҳристи номҳои миллии Ҷумҳурии Тоҷикистон (Қарори №98) тасдиқ шудааст ва барои сабт дар мақомоти САҲШ (ЗАГС) иҷозат дода шудааст.`,
    };
  }

  // 2. Normalized / fuzzy match
  const close = tajikRegistryNames.filter((n) => {
    const nNormTj = normalizeNameQuery(n.name_tj);
    const nNormCyr = normalizeNameQuery(n.name_cyrillic);
    const nNormLat = normalizeNameQuery(n.name_latin);
    return (
      nNormTj === queryNorm ||
      nNormCyr === queryNorm ||
      nNormLat === queryNorm ||
      n.name_tj.toLowerCase().includes(queryLower) ||
      n.name_cyrillic.toLowerCase().includes(queryLower) ||
      n.name_latin.toLowerCase().includes(queryLower)
    );
  }).slice(0, 10);

  const isPermitted = close.some(
    (c) => normalizeNameQuery(c.name_tj) === queryNorm || normalizeNameQuery(c.name_cyrillic) === queryNorm
  );

  return {
    query: clean,
    isPermitted,
    exactMatch: isPermitted ? close[0] : undefined,
    closeMatches: close,
    recommendation: isPermitted
      ? `Номи «${clean}» эҳтимолан ба шакли «${close[0].name_tj}» дар феҳрист мавҷуд аст.`
      : `Номи «${clean}» дар феҳристи расмии номҳои миллии тасдиқшуда ёфт нашуд. Тибқи қонунгузории ҶТ танҳо номҳои расмӣ барои сабти асноди ҳолати шаҳрвандӣ тавсия мешаванд.`,
  };
}

// Get alphabet stats
export function getTajikAlphabetStats(): TajikAlphabetStat[] {
  const map: Record<string, { count: number; maleCount: number; femaleCount: number }> = {};
  
  for (const letter of TAJIK_ALPHABET) {
    map[letter] = { count: 0, maleCount: 0, femaleCount: 0 };
  }

  for (const n of tajikRegistryNames) {
    const l = n.letter.toUpperCase();
    if (!map[l]) {
      map[l] = { count: 0, maleCount: 0, femaleCount: 0 };
    }
    map[l].count++;
    if (n.gender === "male") map[l].maleCount++;
    else if (n.gender === "female") map[l].femaleCount++;
  }

  return Object.keys(map)
    .sort((a, b) => a.localeCompare(b, "tg"))
    .map((letter) => ({
      letter,
      count: map[letter].count,
      maleCount: map[letter].maleCount,
      femaleCount: map[letter].femaleCount,
    }));
}
