// Алгоритм гармонии ФИО — проверяет звучание имени с отчеством и фамилией

const VOWELS = new Set("аеёиоуыэюяaeiouy".split(""));

export function countSyllables(word: string): number {
  return word.toLowerCase().split("").filter(c => VOWELS.has(c)).length || 1;
}

function getLastLetters(word: string, n: number): string {
  return word.toLowerCase().slice(-n);
}

function getFirstLetters(word: string, n: number): string {
  return word.toLowerCase().slice(0, n);
}

// Проверка плавности перехода между словами (нет "спотыкания")
function transitionScore(word1: string, word2: string): number {
  if (!word1 || !word2) return 50;
  const last = word1.toLowerCase().slice(-1);
  const first = word2.toLowerCase().slice(0, 1);
  const lastIsVowel = VOWELS.has(last);
  const firstIsVowel = VOWELS.has(first);
  // Гласная → согласная или согласная → гласная = плавно
  if (lastIsVowel !== firstIsVowel) return 90;
  // Одинаковые буквы = не очень
  if (last === first) return 30;
  // Обе гласные или обе согласные
  return 55;
}

// Ритмичность — чередование длинных и коротких слов
function rhythmScore(syllables: number[]): number {
  if (syllables.length < 2) return 70;
  // Идеально: разная длина, не монотонно
  const allSame = syllables.every(s => s === syllables[0]);
  if (allSame) return 40;
  // Красивый ритм: чередование
  const hasVariety = new Set(syllables).size >= 2;
  return hasVariety ? 85 : 60;
}

// Аллитерация — повторяющиеся начальные звуки (лёгкая = красиво)
function alliterationScore(words: string[]): number {
  const firsts = words.map(w => w.toLowerCase().slice(0, 1));
  const unique = new Set(firsts);
  if (unique.size === 1 && words.length >= 3) return 60; // Слишком много повторов
  if (unique.size < words.length) return 80; // Немного аллитерации
  return 70;
}

export interface HarmonyResult {
  total: number; // 0-100
  details: {
    transition: number;
    rhythm: number;
    alliteration: number;
    length: number;
    /** Компоненты взвешенной оценки (0-100), если соответствующие данные введены */
    father?: number;
    mother?: number;
    surname?: number;
  };
  fullName: string;
  verdict: string;
}

// Генерация отчества из имени отца
export function generatePatronymic(fatherName: string, gender: "male" | "female"): string {
  if (!fatherName) return "";
  const name = fatherName.trim();
  const lastChar = name.slice(-1).toLowerCase();
  const lastTwo = name.slice(-2).toLowerCase();

  let stem = name;
  if (lastTwo === "ий" || lastTwo === "ей") {
    stem = name.slice(0, -2);
    return gender === "male" ? stem + "ьевич" : stem + "ьевна";
  }
  if (lastChar === "й") {
    stem = name.slice(0, -1);
    return gender === "male" ? stem + "евич" : stem + "евна";
  }
  if (lastChar === "а" || lastChar === "я") {
    stem = name.slice(0, -1);
    return gender === "male" ? stem + "ич" : stem + "ична";
  }
  if (lastChar === "ь") {
    stem = name.slice(0, -1);
    return gender === "male" ? stem + "евич" : stem + "евна";
  }
  // Стандартный случай — согласная на конце
  return gender === "male" ? name + "ович" : name + "овна";
}

export function calculateHarmony(
  firstName: string,
  fatherName: string,
  surname: string,
  gender: "male" | "female",
  opts: HarmonyOptions = {}
): HarmonyResult {
  const patronymic = generatePatronymic(fatherName, gender);
  const parts = [surname, firstName, patronymic].filter(Boolean);
  const fullName = parts.join(" ");

  if (parts.length < 2) {
    return { total: 0, details: { transition: 0, rhythm: 0, alliteration: 0, length: 0 }, fullName, verdict: "Введите данные" };
  }

  // 1. Переходы между словами
  let trans = 0;
  let transCount = 0;
  for (let i = 0; i < parts.length - 1; i++) {
    trans += transitionScore(parts[i], parts[i + 1]);
    transCount++;
  }
  const avgTransition = transCount > 0 ? trans / transCount : 70;

  // 2. Ритм
  const syllables = parts.map(countSyllables);
  const rhythm = rhythmScore(syllables);

  // 3. Аллитерация
  const allit = alliterationScore(parts);

  // 4. Длина — не слишком длинное ФИО
  const totalLength = fullName.replace(/\s/g, "").length;
  const lengthScore = totalLength > 25 ? 50 : totalLength < 8 ? 60 : 85;

  // Базовая оценка звучания ФИО (имя + отчество + фамилия)
  const fioScore = Math.round(avgTransition * 0.35 + rhythm * 0.25 + allit * 0.2 + lengthScore * 0.2);

  // Взвешенная модель: отец 45% / мать 35% / фамилия 20%.
  // Веса отсутствующих компонентов перераспределяются пропорционально.
  const components: { key: "father" | "mother" | "surname"; weight: number; score: number }[] = [];
  if (fatherName.trim()) components.push({ key: "father", weight: HARMONY_WEIGHTS.father, score: fioScore });
  const mother = opts.motherName?.trim();
  if (mother) components.push({ key: "mother", weight: HARMONY_WEIGHTS.mother, score: motherHarmony(firstName, mother) });
  if (surname.trim()) components.push({ key: "surname", weight: HARMONY_WEIGHTS.surname, score: surnameHarmony(firstName, surname) });
  const weightSum = components.reduce((a, c) => a + c.weight, 0);
  const total = weightSum > 0
    ? Math.round(components.reduce((a, c) => a + c.score * c.weight, 0) / weightSum)
    : fioScore;
  const comp: { father?: number; mother?: number; surname?: number } = {};
  for (const c of components) comp[c.key] = c.score;

  let verdict = "";
  if (total >= 80) verdict = "🎵 Прекрасное звучание!";
  else if (total >= 65) verdict = "✨ Хорошая гармония";
  else if (total >= 50) verdict = "👍 Нормально звучит";
  else verdict = "🤔 Можно подобрать лучше";

  return {
    total,
    details: { transition: Math.round(avgTransition), rhythm, alliteration: allit, length: lengthScore, ...comp },
    fullName,
    verdict,
  };
}

export const HARMONY_WEIGHTS = { father: 0.45, mother: 0.35, surname: 0.2 } as const;

export interface HarmonyOptions {
  motherName?: string;
}

/** Созвучие имени ребёнка с именем матери: плавность, ритм, без «эха». */
export function motherHarmony(child: string, mother: string): number {
  if (!child || !mother) return 0;
  const c = child.toLowerCase(), m = mother.toLowerCase();
  if (c === m) return 35; // полное совпадение — путаница в семье
  const flow = (transitionScore(child, mother) + transitionScore(mother, child)) / 2;
  const rhythm = rhythmScore([countSyllables(child), countSyllables(mother)]);
  let score = flow * 0.5 + rhythm * 0.3 + 20;
  if (getFirstLetters(c, 1) === getFirstLetters(m, 1)) score -= 5; // лёгкое эхо
  if (getLastLetters(c, 2) === getLastLetters(m, 2)) score -= 10; // одинаковые окончания
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Сочетание фамилии с именем: переход фамилия → имя и общая длина. */
export function surnameHarmony(child: string, surname: string): number {
  if (!child || !surname) return 0;
  const flow = transitionScore(surname, child);
  const len = (surname + child).length;
  const lenScore = len > 18 ? 55 : len < 6 ? 60 : 90;
  return Math.round(flow * 0.6 + lenScore * 0.4);
}

export interface SiblingMatch {
  score: number; // 0-100
  sibling: string | null;
  reason: string | null;
}

/** Созвучие с именами старших детей: общее окончание, первая буква/корень, близкий ритм. */
export function siblingHarmony(child: string, siblings: string[]): SiblingMatch {
  let best: SiblingMatch = { score: 0, sibling: null, reason: null };
  const c = child.toLowerCase().trim();
  for (const raw of siblings) {
    const s = raw.toLowerCase().trim();
    if (!s || !c) continue;
    if (s === c) continue; // такое имя уже есть в семье
    let score = 0; const reasons: string[] = [];
    if (getLastLetters(c, 3) === getLastLetters(s, 3) && c.length > 3) { score += 45; reasons.push("рифма окончаний"); }
    else if (getLastLetters(c, 2) === getLastLetters(s, 2)) { score += 30; reasons.push("общее окончание"); }
    if (getFirstLetters(c, 3) === getFirstLetters(s, 3)) { score += 30; reasons.push("общий корень"); }
    else if (getFirstLetters(c, 1) === getFirstLetters(s, 1)) { score += 15; reasons.push("одна буква"); }
    const diff = Math.abs(countSyllables(c) - countSyllables(s));
    score += diff === 0 ? 25 : diff === 1 ? 15 : 0;
    score = Math.min(100, score);
    if (score > best.score) best = { score, sibling: raw.trim(), reason: reasons.join(", ") || "близкий ритм" };
  }
  return best;
}
