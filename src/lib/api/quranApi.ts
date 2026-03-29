/** Al Quran Cloud API — https://alquran.cloud/api */

export interface QuranAyah {
  number: number;
  text: string;
  surah: { number: number; name: string; englishName: string };
  numberInSurah: number;
}

export interface QuranSearchResult {
  count: number;
  matches: Array<{
    number: number;
    text: string;
    surah: { number: number; name: string; englishName: string };
    numberInSurah: number;
  }>;
}

const BASE = "https://api.alquran.cloud/v1";

export async function fetchAyah(
  surah: number,
  ayah: number,
  edition = "ru.kuliev"
): Promise<QuranAyah | null> {
  try {
    const res = await fetch(`${BASE}/ayah/${surah}:${ayah}/${edition}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as QuranAyah;
  } catch {
    return null;
  }
}

export async function fetchAyahWithArabic(
  surah: number,
  ayah: number
): Promise<{ arabic: string; russian: string; surahName: string; ayahNum: number } | null> {
  try {
    const res = await fetch(
      `${BASE}/ayah/${surah}:${ayah}/editions/quran-uthmani,ru.kuliev`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const [arData, ruData] = json.data as [QuranAyah, QuranAyah];
    return {
      arabic: arData.text,
      russian: ruData.text,
      surahName: arData.surah.englishName,
      ayahNum: arData.numberInSurah,
    };
  } catch {
    return null;
  }
}

export async function fetchRandomAyah(): Promise<{
  arabic: string;
  russian: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
} | null> {
  // Pick a well-known inspirational ayah (curated list for quality)
  const CURATED_AYAHS: Array<[number, number]> = [
    [2, 286], [3, 139], [94, 5], [94, 6], [2, 152], [13, 28],
    [65, 3], [2, 216], [39, 53], [3, 173], [9, 51], [2, 155],
    [40, 60], [14, 7], [93, 5], [55, 13], [112, 1], [1, 1],
    [2, 201], [3, 26], [24, 35], [59, 22], [67, 1], [36, 58],
  ];
  const [s, a] = CURATED_AYAHS[Math.floor(Math.random() * CURATED_AYAHS.length)];
  try {
    const res = await fetch(
      `${BASE}/ayah/${s}:${a}/editions/quran-uthmani,ru.kuliev`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const [ar, ru] = json.data as [QuranAyah, QuranAyah];
    return {
      arabic: ar.text,
      russian: ru.text,
      surahName: ar.surah.name,
      surahNumber: ar.surah.number,
      ayahNumber: ar.numberInSurah,
    };
  } catch {
    return null;
  }
}
