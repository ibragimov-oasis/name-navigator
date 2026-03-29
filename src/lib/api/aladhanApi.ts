/** Aladhan API — https://aladhan.com/prayer-times-api */

export interface HijriDateApi {
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
  weekday: { en: string; ar: string };
  holidays: string[];
}

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface AladhanDateResponse {
  hijri: HijriDateApi;
  gregorian: {
    date: string;
    day: string;
    month: { number: number; en: string };
    year: string;
    weekday: { en: string };
  };
}

export interface AladhanTimingsResponse {
  timings: PrayerTimings;
  date: AladhanDateResponse;
}

const BASE = "https://api.aladhan.com/v1";

function formatDateDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export async function fetchTodayTimings(
  latitude: number,
  longitude: number,
  method = 4 // Umm al-Qura
): Promise<AladhanTimingsResponse | null> {
  try {
    const dateStr = formatDateDDMMYYYY(new Date());
    const res = await fetch(
      `${BASE}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as AladhanTimingsResponse;
  } catch {
    return null;
  }
}

export async function fetchHijriDate(): Promise<HijriDateApi | null> {
  try {
    const dateStr = formatDateDDMMYYYY(new Date());
    // Use Mecca coords for Hijri date (it's the same everywhere)
    const res = await fetch(
      `${BASE}/timings/${dateStr}?latitude=21.4225&longitude=39.8262&method=4`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.date.hijri as HijriDateApi;
  } catch {
    return null;
  }
}

const HIJRI_MONTH_NAMES_RU: Record<number, string> = {
  1: "Мухаррам", 2: "Сафар", 3: "Раби уль-Авваль", 4: "Раби уль-Ахир",
  5: "Джумада уль-Уля", 6: "Джумада уль-Ахира", 7: "Раджаб", 8: "Шаабан",
  9: "Рамадан", 10: "Шавваль", 11: "Зуль-Каада", 12: "Зуль-Хиджа",
};

const WEEKDAY_RU: Record<string, string> = {
  "Al Ahad": "Воскресенье", "Al Ithnayn": "Понедельник",
  "Al Thulatha'a": "Вторник", "Al Arba'a": "Среда",
  "Al Khamees": "Четверг", "Al Jumu'a": "Пятница", "Al Sabt": "Суббота",
};

export function formatHijriRu(h: HijriDateApi): string {
  const monthName = HIJRI_MONTH_NAMES_RU[h.month.number] || h.month.en;
  return `${h.day} ${monthName} ${h.year} г.х.`;
}

export function getWeekdayRu(h: HijriDateApi): string {
  return WEEKDAY_RU[h.weekday.en] || h.weekday.en;
}
