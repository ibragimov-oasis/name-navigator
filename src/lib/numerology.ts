/**
 * Name Numerology — Abjad (Arabic) + Pythagorean (Cyrillic/Latin)
 */

// Abjad values for Arabic letters
const ABJAD: Record<string, number> = {
  "ا": 1, "ب": 2, "ج": 3, "د": 4, "ه": 5, "و": 6, "ز": 7, "ح": 8, "ط": 9,
  "ي": 10, "ك": 20, "ل": 30, "م": 40, "ن": 50, "س": 60, "ع": 70, "ف": 80, "ص": 90,
  "ق": 100, "ر": 200, "ش": 300, "ت": 400, "ث": 500, "خ": 600, "ذ": 700, "ض": 800, "ظ": 900, "غ": 1000,
};

// Pythagorean mapping for Cyrillic
const CYRILLIC: Record<string, number> = {
  "а": 1, "б": 2, "в": 3, "г": 4, "д": 5, "е": 6, "ё": 7, "ж": 8, "з": 9,
  "и": 1, "й": 2, "к": 3, "л": 4, "м": 5, "н": 6, "о": 7, "п": 8, "р": 9,
  "с": 1, "т": 2, "у": 3, "ф": 4, "х": 5, "ц": 6, "ч": 7, "ш": 8, "щ": 9,
  "ъ": 1, "ы": 2, "ь": 3, "э": 4, "ю": 5, "я": 6,
};

// Pythagorean mapping for Latin
const LATIN: Record<string, number> = {
  "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8, "i": 9,
  "j": 1, "k": 2, "l": 3, "m": 4, "n": 5, "o": 6, "p": 7, "q": 8, "r": 9,
  "s": 1, "t": 2, "u": 3, "v": 4, "w": 5, "x": 6, "y": 7, "z": 8,
};

function reduceToSingle(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    let sum = 0;
    while (n > 0) { sum += n % 10; n = Math.floor(n / 10); }
    n = sum;
  }
  return n;
}

export function calculateNumerology(name: string): {
  abjadTotal: number;
  pythagoreanTotal: number;
  destinyNumber: number;
  system: "abjad" | "pythagorean" | "mixed";
} {
  const lower = name.toLowerCase();
  let abjadTotal = 0;
  let pyTotal = 0;
  let hasArabic = false;
  let hasCyrillic = false;

  for (const ch of lower) {
    if (ABJAD[ch]) { abjadTotal += ABJAD[ch]; hasArabic = true; }
    if (CYRILLIC[ch]) { pyTotal += CYRILLIC[ch]; hasCyrillic = true; }
    if (LATIN[ch]) { pyTotal += LATIN[ch]; }
  }

  const system = hasArabic ? "abjad" : hasCyrillic ? "pythagorean" : "pythagorean";
  const destinyNumber = reduceToSingle(hasArabic ? abjadTotal : pyTotal);

  return { abjadTotal, pythagoreanTotal: pyTotal, destinyNumber, system };
}

export function getCompatibility(name1: string, name2: string): {
  score: number;
  description: string;
} {
  const n1 = calculateNumerology(name1);
  const n2 = calculateNumerology(name2);
  const diff = Math.abs(n1.destinyNumber - n2.destinyNumber);
  const harmonics: Record<number, number> = { 0: 100, 1: 90, 2: 80, 3: 70, 4: 60, 5: 55, 6: 65, 7: 75, 8: 50, 9: 45 };
  const score = harmonics[diff] ?? 50;

  const descriptions: Record<string, string> = {
    "100": "Идеальная гармония! Числа полностью совпадают — глубокое духовное единство.",
    "90": "Прекрасная совместимость. Числа дополняют друг друга.",
    "80": "Сильная связь. Энергии имён хорошо сочетаются.",
    "75": "Хорошая совместимость с интересными различиями.",
    "70": "Добрая связь. Есть чему поучиться друг у друга.",
    "65": "Умеренная совместимость. Есть гармония, но нужны усилия.",
    "60": "Средняя совместимость. Различия создают баланс.",
    "55": "Нейтральная связь. Ни сильного притяжения, ни отталкивания.",
    "50": "Непростое сочетание. Потребуется мудрость и терпение.",
    "45": "Полярные энергии. Сложная, но потенциально трансформирующая связь.",
  };

  return { score, description: descriptions[String(score)] || "Уникальное сочетание энергий." };
}

export const DESTINY_TRAITS: Record<number, { title: string; traits: string[]; element: string; planet: string; luckyDay: string }> = {
  1: { title: "Лидер", traits: ["Инициативность", "Независимость", "Решительность", "Амбициозность"], element: "Огонь", planet: "Солнце", luckyDay: "Воскресенье" },
  2: { title: "Дипломат", traits: ["Чувствительность", "Сотрудничество", "Миролюбие", "Интуиция"], element: "Вода", planet: "Луна", luckyDay: "Понедельник" },
  3: { title: "Творец", traits: ["Творчество", "Общительность", "Оптимизм", "Вдохновение"], element: "Огонь", planet: "Юпитер", luckyDay: "Четверг" },
  4: { title: "Строитель", traits: ["Практичность", "Трудолюбие", "Надёжность", "Организованность"], element: "Земля", planet: "Сатурн", luckyDay: "Суббота" },
  5: { title: "Искатель", traits: ["Свобода", "Адаптивность", "Любознательность", "Энергичность"], element: "Воздух", planet: "Меркурий", luckyDay: "Среда" },
  6: { title: "Хранитель", traits: ["Ответственность", "Любовь", "Забота", "Гармония"], element: "Вода", planet: "Венера", luckyDay: "Пятница" },
  7: { title: "Мыслитель", traits: ["Мудрость", "Духовность", "Аналитичность", "Проницательность"], element: "Вода", planet: "Нептун", luckyDay: "Понедельник" },
  8: { title: "Властитель", traits: ["Сила воли", "Материальный успех", "Авторитет", "Справедливость"], element: "Земля", planet: "Сатурн", luckyDay: "Суббота" },
  9: { title: "Гуманист", traits: ["Сострадание", "Мудрость", "Бескорыстие", "Идеализм"], element: "Огонь", planet: "Марс", luckyDay: "Вторник" },
  11: { title: "Вдохновитель", traits: ["Духовное прозрение", "Харизма", "Интуиция", "Просветление"], element: "Воздух", planet: "Уран", luckyDay: "Среда" },
  22: { title: "Мастер-строитель", traits: ["Великие замыслы", "Практическая мудрость", "Глобальное мышление"], element: "Земля", planet: "Плутон", luckyDay: "Суббота" },
  33: { title: "Учитель", traits: ["Безусловная любовь", "Самоотдача", "Духовное наставничество"], element: "Вода", planet: "Нептун", luckyDay: "Пятница" },
};
