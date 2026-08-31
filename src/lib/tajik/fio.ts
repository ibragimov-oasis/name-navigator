/**
 * Проверка полного имени (ФИО) по правилам Республики Таджикистан.
 * Основано на Законе ҶТ «О государственной регистрации актов гражданского
 * состояния» (ст. 20¹) и Постановлении Правительства №98.
 */

export type FioIssueLevel = "error" | "warning" | "info";

export interface FioIssue {
  level: FioIssueLevel;
  title: string;
  detail: string;
  suggestion?: string;
}

export interface FioInput {
  firstName: string;
  patronymic: string;
  lastName: string;
}

export interface FioCheckResult {
  input: FioInput;
  /** 0..100 — насколько ФИО соответствует национальным правилам */
  score: number;
  issues: FioIssue[];
  /** Рекомендованный вариант записи */
  suggestedFio: string;
}

/** Русифицированные окончания фамилий/отчеств */
const RUSSIFIED_SUFFIXES = ["ов", "ова", "ев", "ева", "евич", "ович", "овна", "евна", "вич", "овые"];

/** Национальные таджикские окончания */
const NATIONAL_SUFFIXES = ["зода", "зод", "иён", "ион", "пур", "духт", "ӣ", "и", "нажод", "фар"];

function endsWithAny(value: string, list: readonly string[]): string | null {
  const lower = value.toLowerCase().trim();
  for (const suffix of list) {
    if (lower.endsWith(suffix)) return suffix;
  }
  return null;
}

function tajikizeSurname(surname: string): string {
  const lower = surname.trim();
  if (!lower) return "";
  const stripped = lower.replace(/(ов|ова|ев|ева|овна|овач|ович|евич|евна)$/i, "");
  const base = stripped || lower;
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}зода`;
}

export function checkTajikFio(input: FioInput): FioCheckResult {
  const issues: FioIssue[] = [];
  const firstName = input.firstName.trim();
  const patronymic = input.patronymic.trim();
  const lastName = input.lastName.trim();

  let score = 100;

  if (!firstName) {
    issues.push({
      level: "error",
      title: "Ном холӣ аст",
      detail: "Барои санҷиш ном ҳатмист.",
    });
    score -= 40;
  }

  const russifiedSurname = lastName ? endsWithAny(lastName, RUSSIFIED_SUFFIXES) : null;
  if (russifiedSurname) {
    score -= 30;
    issues.push({
      level: "warning",
      title: "Насаби русишуда",
      detail: `Насаб бо «-${russifiedSurname}» ба анъанаи миллии тоҷикӣ мувофиқ нест. Аз соли 2016 сабти чунин насабҳо барои шаҳрвандони тоҷик тавсия намешавад.`,
      suggestion: tajikizeSurname(lastName),
    });
  } else if (lastName && endsWithAny(lastName, NATIONAL_SUFFIXES)) {
    issues.push({
      level: "info",
      title: "Насаби миллӣ",
      detail: "Насаб ба шакли миллии тоҷикӣ навишта шудааст.",
    });
  }

  const russifiedPatronymic = patronymic ? endsWithAny(patronymic, ["ович", "овна", "евич", "евна"]) : null;
  if (russifiedPatronymic) {
    score -= 20;
    issues.push({
      level: "warning",
      title: "Номи падари русишуда",
      detail: `Шакли «-${russifiedPatronymic}» русишуда аст. Шакли миллӣ: «<Номи падар>» + «зода» ё бе тағйир.`,
      suggestion: patronymic.replace(/(ович|овна|евич|евна)$/i, ""),
    });
  }

  if (firstName && /[a-z]/i.test(firstName)) {
    score -= 10;
    issues.push({
      level: "info",
      title: "Навишти лотинӣ",
      detail: "Ном бо ҳарфҳои лотинӣ ворид шуд. Барои санҷиши расмӣ шакли кириллии тоҷикӣ истифода бурда мешавад.",
    });
  }

  if (firstName.split(/\s+/).length > 2) {
    score -= 10;
    issues.push({
      level: "warning",
      title: "Номи мураккаб",
      detail: "Дар феҳристи расмӣ номҳои аз ду калима зиёд қариб вонамехӯранд.",
    });
  }

  const suggestedLast = russifiedSurname ? tajikizeSurname(lastName) : lastName;
  const suggestedPat = russifiedPatronymic
    ? patronymic.replace(/(ович|овна|евич|евна)$/i, "")
    : patronymic;

  return {
    input: { firstName, patronymic, lastName },
    score: Math.max(0, Math.min(100, score)),
    issues,
    suggestedFio: [suggestedLast, firstName, suggestedPat].filter(Boolean).join(" "),
  };
}
