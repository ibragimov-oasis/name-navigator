/**
 * Gregorian to Hijri conversion using the Kuwaiti algorithm.
 * Accuracy: ±1 day. No external dependencies.
 */

export interface HijriDate {
  year: number;
  month: number; // 0-based (0 = Muharram)
  day: number;
}

export function gregorianToHijri(gDate: Date): HijriDate {
  const d = gDate.getDate();
  const m = gDate.getMonth() + 1;
  const y = gDate.getFullYear();

  let jd =
    Math.floor((11 * y + 3) / 30) +
    354 * y +
    30 * m -
    Math.floor((m - 1) / 2) +
    d +
    1948440 -
    385;

  // Convert to Julian Day Number properly
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  jd =
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045;

  // Kuwaiti algorithm
  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;

  const j =
    Math.floor((10985 - l) / 5316) *
      Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) *
      Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) *
      Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) *
      Math.floor((15238 * j) / 43) +
    29;

  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { year, month: month - 1, day }; // month 0-based
}

const HIJRI_MONTH_NAMES = [
  "Мухаррам", "Сафар", "Раби уль-Авваль", "Раби уль-Ахир",
  "Джумада уль-Уля", "Джумада уль-Ахира", "Раджаб", "Шаабан",
  "Рамадан", "Шавваль", "Зуль-Каада", "Зуль-Хиджа",
];

export function formatHijriDate(h: HijriDate): string {
  return `${h.day} ${HIJRI_MONTH_NAMES[h.month]} ${h.year} г.х.`;
}

export function getTodayHijri(): HijriDate {
  return gregorianToHijri(new Date());
}
