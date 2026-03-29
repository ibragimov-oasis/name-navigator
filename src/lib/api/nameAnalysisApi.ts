/** Free name analysis APIs: Genderize, Nationalize, Agify */

export interface GenderizeResult {
  name: string;
  gender: "male" | "female" | null;
  probability: number;
  count: number;
}

export interface NationalizeCountry {
  country_id: string;
  probability: number;
}

export interface NationalizeResult {
  name: string;
  country: NationalizeCountry[];
  count: number;
}

export interface AgifyResult {
  name: string;
  age: number | null;
  count: number;
}

export interface NameAnalysis {
  gender: GenderizeResult;
  nationality: NationalizeResult;
  age: AgifyResult;
}

// Country code → Russian name mapping
const COUNTRY_NAMES: Record<string, string> = {
  AF: "Афганистан", AL: "Албания", DZ: "Алжир", SA: "Саудовская Аравия",
  AE: "ОАЭ", EG: "Египет", TR: "Турция", PK: "Пакистан",
  ID: "Индонезия", MY: "Малайзия", BD: "Бангладеш", IN: "Индия",
  NG: "Нигерия", IR: "Иран", IQ: "Ирак", SY: "Сирия",
  JO: "Иордания", LB: "Ливан", PS: "Палестина", YE: "Йемен",
  OM: "Оман", KW: "Кувейт", BH: "Бахрейн", QA: "Катар",
  LY: "Ливия", TN: "Тунис", MA: "Марокко", SD: "Судан",
  SO: "Сомали", US: "США", GB: "Великобритания", DE: "Германия",
  FR: "Франция", RU: "Россия", CN: "Китай", JP: "Япония",
  KR: "Корея", BR: "Бразилия", MX: "Мексика", IT: "Италия",
  ES: "Испания", NL: "Нидерланды", SE: "Швеция", NO: "Норвегия",
  FI: "Финляндия", PL: "Польша", UA: "Украина", KZ: "Казахстан",
  UZ: "Узбекистан", TJ: "Таджикистан", TM: "Туркменистан",
  AZ: "Азербайджан", GE: "Грузия", AM: "Армения",
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

// Transliterate Cyrillic to Latin for API calls
function transliterate(name: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
    ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return name
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

export async function analyzeNameFull(name: string): Promise<NameAnalysis | null> {
  const latinName = transliterate(name);
  try {
    const [gRes, nRes, aRes] = await Promise.all([
      fetch(`https://api.genderize.io/?name=${encodeURIComponent(latinName)}`),
      fetch(`https://api.nationalize.io/?name=${encodeURIComponent(latinName)}`),
      fetch(`https://api.agify.io/?name=${encodeURIComponent(latinName)}`),
    ]);

    if (!gRes.ok || !nRes.ok || !aRes.ok) return null;

    const [gender, nationality, age] = await Promise.all([
      gRes.json() as Promise<GenderizeResult>,
      nRes.json() as Promise<NationalizeResult>,
      aRes.json() as Promise<AgifyResult>,
    ]);

    return { gender, nationality, age };
  } catch {
    return null;
  }
}
