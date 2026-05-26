// Проверка занятости никнейма в открытых API без CORS-проблем.
// GitHub: api.github.com/users/USER → 200 = занят, 404 = свободен.
// Для Instagram/X нет публичного CORS-API — даём ссылку для ручной проверки.

export type AvailabilityResult = {
  platform: "github" | "instagram" | "twitter";
  username: string;
  status: "free" | "taken" | "unknown";
  link: string;
};

export async function checkGithub(username: string): Promise<AvailabilityResult> {
  const link = `https://github.com/${username}`;
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
    if (res.status === 404) return { platform: "github", username, status: "free", link };
    if (res.status === 200) return { platform: "github", username, status: "taken", link };
    return { platform: "github", username, status: "unknown", link };
  } catch {
    return { platform: "github", username, status: "unknown", link };
  }
}

export function manualCheck(
  platform: "instagram" | "twitter",
  username: string,
): AvailabilityResult {
  const link =
    platform === "instagram"
      ? `https://instagram.com/${username}`
      : `https://x.com/${username}`;
  return { platform, username, status: "unknown", link };
}

// Генерируем короткие никнеймы из имени
export function generateNicknames(name: string): string[] {
  const base = name
    .toLowerCase()
    .replace(/[^a-zа-я0-9]/gi, "")
    .replace(/[а-я]/g, (ch) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[ch] ?? ch;
    });

  if (!base) return [];

  const short = base.slice(0, 6);
  const variants = new Set<string>([
    base,
    short,
    `${short}_real`,
    `${short}.official`,
    `the${short}`,
    `${short}xo`,
    `${short}404`,
    `${base}${Math.floor(Math.random() * 90 + 10)}`,
    `${short}.${Math.floor(Math.random() * 9 + 1)}`,
    `mr${short}`,
    `${short}studio`,
  ]);

  return Array.from(variants).filter((v) => v.length >= 3 && v.length <= 20).slice(0, 8);
}
