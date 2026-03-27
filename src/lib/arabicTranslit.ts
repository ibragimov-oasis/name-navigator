/**
 * Cyrillic → Arabic transliteration for Russian-written Islamic names
 */

const CYRILLIC_TO_ARABIC: Record<string, string> = {
  "а": "ا", "б": "ب", "в": "و", "г": "غ", "д": "د", "е": "ي", "ё": "يو",
  "ж": "ج", "з": "ز", "и": "ي", "й": "ي", "к": "ك", "л": "ل", "м": "م",
  "н": "ن", "о": "و", "п": "ب", "р": "ر", "с": "س", "т": "ت", "у": "و",
  "ф": "ف", "х": "خ", "ц": "تس", "ч": "تش", "ш": "ش", "щ": "شش",
  "ъ": "", "ы": "ي", "ь": "", "э": "ا", "ю": "يو", "я": "يا",
};

// Special compound transliterations for common Islamic name patterns
const SPECIAL_PATTERNS: [string, string][] = [
  ["абд", "عبد"],
  ["алл", "الل"],
  ["мух", "مح"],
  ["ибн", "ابن"],
  ["абу", "أبو"],
  ["аль-", "ال"],
  ["ибра", "إبرا"],
  ["исм", "إسم"],
  ["рахм", "رحم"],
  ["хам", "حم"],
  ["сал", "صل"],
  ["нур", "نور"],
  ["амин", "أمين"],
  ["фат", "فاط"],
  ["хад", "خد"],
  ["аиш", "عائش"],
  ["зайн", "زين"],
  ["джа", "جا"],
  ["шам", "شم"],
];

export function transliterateToArabic(name: string): string {
  let input = name.toLowerCase();
  let result = "";

  let i = 0;
  while (i < input.length) {
    // Try special patterns first (longest match)
    let matched = false;
    for (const [pattern, arabic] of SPECIAL_PATTERNS) {
      if (input.substring(i).startsWith(pattern)) {
        result += arabic;
        i += pattern.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const ch = input[i];
      result += CYRILLIC_TO_ARABIC[ch] || ch;
      i++;
    }
  }

  return result;
}

// Render Arabic text on a canvas with calligraphic styling
export function renderArabicOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number = 48
): void {
  ctx.save();
  ctx.font = `${fontSize}px "Noto Naskh Arabic", "Traditional Arabic", serif`;
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1a472a";
  ctx.fillText(text, x, y);
  ctx.restore();
}
