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
    home: "Главная",
    auth: "Авторизация",
    profile: "Профиль",
    admin: "Панель администратора",
    dashboard: "Панель управления",
    settings: "Настройки",
    search: "Поиск",
    contracts: "Конструктор договоров",
    library: "Библиотека",
    procedures: "Юридические процедуры",
    vault: "Сейф документов",
    quests: "Квесты",
    compass: "Компас",
    map: "Карта",
    menu: "Меню",
    order: "Заказ",
    table: "Стол",
    cart: "Корзина",
    payroll: "Расчет зарплаты",
    calculator: "Калькулятор",
    shifts: "Смены",
    recipes: "Рецепты",
    ingredients: "Ингредиенты",
    pantry: "Кладовая",
    schedule: "Расписание",
    courses: "Курсы",
    catalog: "Каталог",
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
