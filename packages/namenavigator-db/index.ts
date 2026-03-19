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
  gender: "male" | "female"
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

  const total = Math.round(avgTransition * 0.35 + rhythm * 0.25 + allit * 0.2 + lengthScore * 0.2);

  let verdict = "";
  if (total >= 80) verdict = "🎵 Прекрасное звучание!";
  else if (total >= 65) verdict = "✨ Хорошая гармония";
  else if (total >= 50) verdict = "👍 Нормально звучит";
  else verdict = "🤔 Можно подобрать лучше";

  return {
    total,
    details: { transition: Math.round(avgTransition), rhythm, alliteration: allit, length: lengthScore },
    fullName,
    verdict,
  };
}
