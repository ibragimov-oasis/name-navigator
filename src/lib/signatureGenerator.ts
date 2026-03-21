/**
 * Canvas-based signature generator. No AI, no tokens.
 * Uses Google Fonts loaded via <link> in index.html.
 */

export interface SignatureStyle {
  id: string;
  label: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bgColor: string;
  letterSpacing: number;
  italic: boolean;
  decoration?: "underline" | "none";
}

export const SIGNATURE_STYLES: SignatureStyle[] = [
  {
    id: "classic",
    label: "Классическая",
    fontFamily: "'Dancing Script', cursive",
    fontSize: 56,
    color: "#1a1a2e",
    bgColor: "#fefefe",
    letterSpacing: 2,
    italic: false,
    decoration: "underline",
  },
  {
    id: "elegant",
    label: "Элегантная",
    fontFamily: "'Great Vibes', cursive",
    fontSize: 60,
    color: "#2c3e50",
    bgColor: "#f8f5f0",
    letterSpacing: 3,
    italic: false,
  },
  {
    id: "modern",
    label: "Современная",
    fontFamily: "'Pacifico', cursive",
    fontSize: 48,
    color: "#0f3460",
    bgColor: "#ffffff",
    letterSpacing: 1,
    italic: false,
  },
  {
    id: "minimalist",
    label: "Минималистичная",
    fontFamily: "'Sacramento', cursive",
    fontSize: 64,
    color: "#333333",
    bgColor: "#ffffff",
    letterSpacing: 4,
    italic: false,
  },
  {
    id: "royal",
    label: "Королевская",
    fontFamily: "'Pinyon Script', cursive",
    fontSize: 54,
    color: "#8b6914",
    bgColor: "#fffdf5",
    letterSpacing: 2,
    italic: false,
    decoration: "underline",
  },
  {
    id: "ink",
    label: "Чернильная",
    fontFamily: "'Caveat', cursive",
    fontSize: 52,
    color: "#1a1a1a",
    bgColor: "#f9f7f2",
    letterSpacing: 1,
    italic: false,
  },
];

export function generateSignature(
  name: string,
  style: SignatureStyle,
  canvas: HTMLCanvasElement
): string {
  const ctx = canvas.getContext("2d")!;
  const width = 600;
  const height = 200;
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Text
  const fontStyle = style.italic ? "italic " : "";
  ctx.font = `${fontStyle}${style.fontSize}px ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  (ctx as any).letterSpacing = `${style.letterSpacing}px`;

  ctx.fillText(name, width / 2, height / 2);

  // Underline decoration
  if (style.decoration === "underline") {
    const metrics = ctx.measureText(name);
    const textWidth = metrics.width;
    const y = height / 2 + style.fontSize * 0.35;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - textWidth / 2, y);
    // Wavy line
    const startX = width / 2 - textWidth / 2;
    const endX = width / 2 + textWidth / 2;
    for (let x = startX; x <= endX; x += 4) {
      ctx.lineTo(x, y + Math.sin((x - startX) * 0.08) * 3);
    }
    ctx.stroke();
  }

  return canvas.toDataURL("image/png");
}

export function downloadSignature(dataUrl: string, name: string, styleId: string) {
  const link = document.createElement("a");
  link.download = `signature_${name}_${styleId}.png`;
  link.href = dataUrl;
  link.click();
}
