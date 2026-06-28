export interface FeedbackLocation {
  sectionKey: string;
  sectionLabel: string;
  item?: string;
}

export function parseFeedbackLocation(pathname: string): FeedbackLocation {
  const segments = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  
  if (segments.length === 0) {
    return { sectionKey: "home", sectionLabel: "Главная" };
  }
  
  const baseSegment = segments[0];
  const sectionKey = baseSegment.toLowerCase();
  
    const TRANSLATIONS: Record<string, string> = {
    "admin": "Панель администратора",
    "analytics": "Аналитика трендов",
    "auth": "Авторизация",
    "battle": "Битва имен",
    "calendar": "Календарь имен",
    "certificate": "Сертификат имени",
    "children": "Имена для детей",
    "compare": "Сравнение имен",
    "couple": "Выбор имени парой",
    "dashboard": "Панель управления",
    "dna": "ДНК имени",
    "dua": "Коллекция дуа",
    "favorites": "Избранные имена",
    "home": "Главная",
    "import": "Импорт данных",
    "naming-guide": "Руководство по именам",
    "numerology": "Нумерология имени",
    "people": "Имена для людей",
    "people/adult": "Имена для взрослых",
    "people/character": "Имена персонажей",
    "people/compatibility": "Совместимость имен",
    "people/historical": "Исторические личности",
    "people/nasab": "Насаб (родословная)",
    "people/profiles": "Профили имен",
    "people/pseudonym": "Псевдонимы",
    "people/revert": "Имена при принятии ислама",
    "pets": "Имена для питомцев",
    "profile": "Профиль",
    "prophets": "Имена пророков",
    "search": "Поиск",
    "settings": "Настройки",
    "signature": "Генератор подписи",
    "stats": "Статистика имен",
    "style-quiz": "Тест на стиль имен",
    "tafsir": "Тафсир (значение)",
    "wizard": "Мастер генерации",
  };
  
  let sectionLabel = TRANSLATIONS[sectionKey];
  if (!sectionLabel) {
    sectionLabel = baseSegment
      .replace(/[-_]+/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  
  let item: string | undefined;
  if (segments.length > 1) {
    try {
      item = decodeURIComponent(segments[segments.length - 1]);
    } catch {
      item = segments[segments.length - 1];
    }
  }
  
  return { sectionKey, sectionLabel, item };
}
