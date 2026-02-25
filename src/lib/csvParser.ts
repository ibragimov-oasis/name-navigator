import { ChildName } from "@/data/childNames";
import { PetName } from "@/data/petNames";

export type ImportType = "children" | "pets";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseArrayField(value: string): string[] {
  if (!value) return [];
  return value.split(";").map((s) => s.trim()).filter(Boolean);
}

export function parseChildrenCSV(csvText: string): { data: ChildName[]; errors: string[] } {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { data: [], errors: ["Файл пуст или нет данных после заголовка"] };

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const requiredHeaders = ["id", "name", "gender", "origin", "culture", "meaning", "attributes", "popularity", "history", "languages"];
  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length > 0) return { data: [], errors: [`Отсутствуют обязательные столбцы: ${missing.join(", ")}`] };

  const data: ChildName[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

      const gender = row.gender as "male" | "female" | "unisex";
      if (!["male", "female", "unisex"].includes(gender)) {
        errors.push(`Строка ${i + 1}: неверный пол "${row.gender}". Допустимо: male, female, unisex`);
        continue;
      }

      const popularity = parseInt(row.popularity, 10);
      if (isNaN(popularity) || popularity < 1 || popularity > 100) {
        errors.push(`Строка ${i + 1}: популярность должна быть числом от 1 до 100`);
        continue;
      }

      data.push({
        id: row.id || `import_${Date.now()}_${i}`,
        name: row.name,
        gender,
        origin: row.origin,
        culture: row.culture,
        religion: row.religion || undefined,
        meaning: row.meaning,
        attributes: parseArrayField(row.attributes),
        popularity,
        namedAfter: row.namedafter ? parseArrayField(row.namedafter) : undefined,
        famousPeople: row.famouspeople ? parseArrayField(row.famouspeople) : undefined,
        history: row.history,
        nameDay: row.nameday || undefined,
        languages: parseArrayField(row.languages),
      });
    } catch (e) {
      errors.push(`Строка ${i + 1}: ошибка парсинга`);
    }
  }

  return { data, errors };
}

export function parsePetsCSV(csvText: string): { data: PetName[]; errors: string[] } {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { data: [], errors: ["Файл пуст или нет данных после заголовка"] };

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const requiredHeaders = ["id", "name", "animaltype", "origin", "meaning", "attributes", "popularity", "description", "gender"];
  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length > 0) return { data: [], errors: [`Отсутствуют обязательные столбцы: ${missing.join(", ")}`] };

  const data: PetName[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

      const gender = row.gender as "male" | "female" | "unisex";
      if (!["male", "female", "unisex"].includes(gender)) {
        errors.push(`Строка ${i + 1}: неверный пол "${row.gender}"`);
        continue;
      }

      const popularity = parseInt(row.popularity, 10);
      if (isNaN(popularity) || popularity < 1 || popularity > 100) {
        errors.push(`Строка ${i + 1}: популярность должна быть числом от 1 до 100`);
        continue;
      }

      data.push({
        id: row.id || `import_${Date.now()}_${i}`,
        name: row.name,
        animalType: row.animaltype,
        origin: row.origin,
        meaning: row.meaning,
        attributes: parseArrayField(row.attributes),
        popularity,
        namedAfter: row.namedafter ? parseArrayField(row.namedafter) : undefined,
        famousPets: row.famouspets ? parseArrayField(row.famouspets) : undefined,
        description: row.description,
        gender,
      });
    } catch (e) {
      errors.push(`Строка ${i + 1}: ошибка парсинга`);
    }
  }

  return { data, errors };
}
