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

export interface NameCheckResult {
  query: string;
  isPermitted: boolean;
  exactMatch?: TajikRegistryName;
  closeMatches: TajikRegistryName[];
  recommendation: string;
}

export interface TajikAlphabetStat {
  letter: string;
  count: number;
  maleCount: number;
  femaleCount: number;
}
