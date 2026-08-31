export interface TajikRegistryName {
  id: string;
  num: number;
  name_tj: string;
  name_tj_raw: string;
  name_cyrillic: string;
  name_cyrillic_raw: string;
  name_latin: string;
  name_latin_raw: string;
  gender: "male" | "female";
  gender_label: string;
  gender_tj: string;
  letter: string;
  is_official_permitted: boolean;
  legal_decree: string;
  is_enriched: boolean;
  matched_child_name_id?: string;
  meaning?: string;
  origin?: string;
  attributes?: string[];
  history?: string;
}

/**
 * Статус проверки имени:
 * - permitted  — точное совпадение с записью реестра (можно регистрировать);
 * - likely     — совпадение только после нормализации написания (нужна сверка);
 * - not_found  — в реестре не найдено.
 */
export type NameCheckStatus = "permitted" | "likely" | "not_found";

export interface TajikNameSuggestion {
  name: TajikRegistryName;
  /** 0..1 — насколько похоже на запрос */
  score: number;
}

export interface NameCheckResult {
  query: string;
  status: NameCheckStatus;
  /** true только для статуса "permitted" (обратная совместимость) */
  isPermitted: boolean;
  exactMatch?: TajikRegistryName;
  /** Ближайшие варианты из реестра, отсортированные по релевантности */
  closeMatches: TajikRegistryName[];
  suggestions: TajikNameSuggestion[];
  recommendation: string;
}

export interface TajikAlphabetStat {
  letter: string;
  count: number;
  maleCount: number;
  femaleCount: number;
}

export interface TajikRegistryCounts {
  total: number;
  male: number;
  female: number;
  enriched: number;
}
