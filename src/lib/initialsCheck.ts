// Проверка инициалов ФИО на «проблемные» комбинации.
// Возвращает список предупреждений (пустой массив = всё хорошо).

const BAD_RU = new Set([
  "БЛЯ", "ХЕР", "СУК", "ЁБА", "ЕБА", "ХУЙ", "ПИЗ",
  "БАБ", "БОЛ", "ВОР", "БОМ", "ДУР", "ХАМ", "ЖИР",
  "ВРАГ", "ЗЛО", "ЛОХ", "УЁБ", "УЕБ",
  // короткие 2-буквенные
  "БЛ", "ХУ", "ПИ",
]);

const BAD_EN = new Set([
  "BAD", "ASS", "FAG", "GAY", "PIG", "WAR", "FOE",
  "DIE", "RIP", "SOB", "HOG", "BUG", "ROT", "BUM",
]);

export interface InitialsResult {
  initials: string;
  warnings: string[];
  ok: boolean;
}

export function checkInitials(firstName: string, fatherName: string, surname: string): InitialsResult {
  const norm = (s: string) => (s || "").trim();
  const parts = [surname, firstName, fatherName].map(norm).filter(Boolean);
  if (parts.length < 2) return { initials: "", warnings: [], ok: true };

  const letters = parts.map((p) => p[0].toUpperCase()).join("");
  const warnings: string[] = [];

  if (BAD_RU.has(letters) || BAD_EN.has(letters.replace(/[^A-Z]/g, ""))) {
    warnings.push(`Инициалы «${letters}» читаются как неприятное слово — стоит подумать о другом сочетании.`);
  }

  // повтор одной буквы во всех инициалах
  if (letters.length >= 3 && new Set(letters).size === 1) {
    warnings.push(`Все инициалы одинаковые («${letters}») — звучит однообразно.`);
  }

  // одинаковое начало имени и фамилии (тяжёлая аллитерация)
  if (firstName && surname && firstName[0].toLowerCase() === surname[0].toLowerCase()
      && firstName.slice(0, 2).toLowerCase() === surname.slice(0, 2).toLowerCase()) {
    warnings.push(`Имя и фамилия начинаются одинаково («${firstName.slice(0, 2)}…») — может звучать тяжеловесно.`);
  }

  return { initials: letters, warnings, ok: warnings.length === 0 };
}
