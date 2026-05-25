// Утилиты фильтрации питомцев: характер, удобство команды (слоги), размер

export const PET_CHARACTERS = [
  "активный",
  "спокойный",
  "храбрый",
  "ласковый",
  "умный",
  "игривый",
  "независимый",
  "дружелюбный",
] as const;

// Алиасы атрибутов → канонический характер
const characterAliases: Record<string, (typeof PET_CHARACTERS)[number]> = {
  "энергичный": "активный",
  "подвижный": "активный",
  "быстрый": "активный",
  "тихий": "спокойный",
  "мирный": "спокойный",
  "терпеливый": "спокойный",
  "сильный": "храбрый",
  "смелый": "храбрый",
  "защитник": "храбрый",
  "нежный": "ласковый",
  "добрый": "ласковый",
  "милый": "ласковый",
  "сообразительный": "умный",
  "мудрый": "умный",
  "хитрый": "умный",
  "весёлый": "игривый",
  "забавный": "игривый",
  "озорной": "игривый",
  "загадочный": "независимый",
  "гордый": "независимый",
  "верный": "дружелюбный",
  "общительный": "дружелюбный",
};

export function getPetCharacter(attributes: string[]): (typeof PET_CHARACTERS)[number][] {
  const result = new Set<(typeof PET_CHARACTERS)[number]>();
  attributes.forEach((a) => {
    const low = a.toLowerCase();
    if ((PET_CHARACTERS as readonly string[]).includes(low)) {
      result.add(low as (typeof PET_CHARACTERS)[number]);
    } else if (characterAliases[low]) {
      result.add(characterAliases[low]);
    }
  });
  return Array.from(result);
}

// Подсчёт слогов (русский): кол-во гласных
const VOWELS = "аеёиоуыэюяaeiouy";
export function countSyllables(name: string): number {
  let count = 0;
  for (const ch of name.toLowerCase()) {
    if (VOWELS.includes(ch)) count++;
  }
  return Math.max(1, count);
}

export function isCommandFriendly(name: string): boolean {
  // 1-2 слога — легко звать и подавать команды
  const s = countSyllables(name);
  return s >= 1 && s <= 2 && name.length <= 7;
}

export type PetSize = "малый" | "средний" | "крупный";

// Грубая эвристика размера на основе типа животного
const sizeByType: Record<string, PetSize> = {
  "Хомяк": "малый",
  "Попугай": "малый",
  "Кошка": "малый",
  "Кролик": "малый",
  "Мышь": "малый",
  "Крыса": "малый",
  "Рыба": "малый",
  "Черепаха": "средний",
  "Змея": "средний",
  "Собака": "средний",
  "Тигр": "крупный",
  "Лошадь": "крупный",
};

export function getPetSize(animalType: string): PetSize {
  return sizeByType[animalType] ?? "средний";
}
