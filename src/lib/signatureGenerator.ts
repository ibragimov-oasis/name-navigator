/**
 * Realistic signature generator using Canvas 2D bezier curves.
 * No fonts for the signature itself — pure path drawing with
 * pen-pressure simulation, flourishes, and per-letter deformation.
 */

export interface SignatureStyle {
  id: string;
  label: string;
  inkColor: string;
  bgColor: string;
  tiltDeg: number;
  pressure: number;        // 0.5–2 multiplier
  speed: number;           // controls letter compression
  flourish: boolean;
  initialsOnly: boolean;
  skipLetters: boolean;    // skip middle letters (quick style)
  dotDecoration: boolean;
}

export const SIGNATURE_STYLES: SignatureStyle[] = [
  { id: "business",     label: "Деловая",          inkColor: "#1a1a2e", bgColor: "#fefefe", tiltDeg: -4,  pressure: 1.0, speed: 1.0, flourish: false, initialsOnly: false, skipLetters: false, dotDecoration: false },
  { id: "presidential", label: "Президентская",    inkColor: "#1a2744", bgColor: "#f8f6f0", tiltDeg: -6,  pressure: 1.3, speed: 0.9, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false },
  { id: "calligraphic", label: "Каллиграфическая",  inkColor: "#2c3e50", bgColor: "#fffef8", tiltDeg: -8,  pressure: 1.6, speed: 0.7, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false },
  { id: "quick",        label: "Быстрая",          inkColor: "#333333", bgColor: "#ffffff", tiltDeg: -3,  pressure: 0.7, speed: 1.8, flourish: false, initialsOnly: false, skipLetters: true,  dotDecoration: false },
  { id: "royal",        label: "Королевская",       inkColor: "#8b6914", bgColor: "#fffdf5", tiltDeg: -5,  pressure: 1.4, speed: 0.8, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false },
  { id: "arabic",       label: "Арабская",          inkColor: "#1a1a1a", bgColor: "#f9f7f2", tiltDeg: 2,   pressure: 1.2, speed: 0.9, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: true  },
  { id: "minimalist",   label: "Минималистичная",   inkColor: "#444444", bgColor: "#ffffff", tiltDeg: -2,  pressure: 0.8, speed: 1.5, flourish: false, initialsOnly: true,  skipLetters: false, dotDecoration: false },
  { id: "artistic",     label: "Артистическая",     inkColor: "#0f3460", bgColor: "#fefefe", tiltDeg: -10, pressure: 1.8, speed: 0.6, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false },
];

/* ─── deterministic seeded random ─── */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── letter stroke paths ─── */
// Each letter is an array of strokes; each stroke is an array of [dx, dy] offsets
// normalised to a ~20×30 unit box.  The engine scales them per style.
type StrokePath = number[][];

const LETTER_PATHS: Record<string, StrokePath[]> = {};

function defaultPath(ch: string): StrokePath[] {
  // generate a procedural "letter" shape from its char code
  const c = ch.charCodeAt(0);
  const h = 28 + (c % 6);
  const w = 14 + (c % 8);
  const strokes: StrokePath[] = [];

  // main stroke: a vertical with a curve
  strokes.push([
    [0, h * 0.1],
    [w * 0.15, 0],
    [w * 0.5, h * 0.15],
    [w * 0.3, h * 0.5],
    [w * 0.1, h * 0.85],
    [w * 0.4, h],
    [w * 0.8, h * 0.7],
    [w, h * 0.4],
    [w * 0.85, h * 0.9],
    [w * 0.95, h],
  ]);

  // if uppercase-ish (A-Z range or Cyrillic А-Я), add a cross-stroke
  if ((c >= 65 && c <= 90) || (c >= 1040 && c <= 1071)) {
    strokes.push([
      [0, h * 0.45],
      [w * 0.5, h * 0.38],
      [w, h * 0.42],
    ]);
  }

  return strokes;
}

function getLetterPaths(ch: string): StrokePath[] {
  const upper = ch.toUpperCase();
  if (LETTER_PATHS[upper]) return LETTER_PATHS[upper];
  return defaultPath(upper);
}

/* ─── drawing helpers ─── */

function drawStrokeWithPressure(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  baseWidth: number,
  pressure: number,
  color: string,
  rng: () => number
) {
  if (points.length < 2) return;

  // draw 3 passes for pressure effect
  const passes = [
    { width: baseWidth * pressure * 1.8, alpha: 0.08 },
    { width: baseWidth * pressure * 1.2, alpha: 0.25 },
    { width: baseWidth * pressure * 0.7, alpha: 0.9 },
  ];

  for (const pass of passes) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.globalAlpha = pass.alpha;
    ctx.lineWidth = pass.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;

      // pressure variation along stroke
      const t = i / points.length;
      const pressVar = 1 + Math.sin(t * Math.PI) * 0.4 * pressure;
      ctx.lineWidth = pass.width * pressVar + rng() * 0.3;

      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawFlourish(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  direction: "start" | "end",
  size: number,
  color: string,
  pressure: number,
  rng: () => number
) {
  const points: { x: number; y: number }[] = [];
  const steps = 20;
  const sign = direction === "start" ? -1 : 1;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x + sign * t * size * (0.8 + rng() * 0.4);
    const py = y + Math.sin(t * Math.PI * 2.5) * size * 0.3 * (1 - t * 0.5);
    points.push({ x: px, y: py });
  }

  drawStrokeWithPressure(ctx, points, 1.2, pressure * 0.7, color, rng);
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  count: number,
  spread: number,
  color: string,
  rng: () => number
) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const dx = (rng() - 0.5) * spread;
    const dy = (rng() - 0.5) * spread * 0.5 - spread * 0.6;
    const r = 1.5 + rng() * 1.5;
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ─── main generator ─── */

export function generateSignature(
  name: string,
  style: SignatureStyle,
  canvas: HTMLCanvasElement
): string {
  const ctx = canvas.getContext("2d")!;
  const W = 700;
  const H = 250;
  canvas.width = W;
  canvas.height = H;

  const rng = seededRandom(hashSeed(name + style.id));

  // background
  ctx.fillStyle = style.bgColor;
  ctx.fillRect(0, 0, W, H);

  // apply global tilt
  ctx.save();
  const tiltRad = (style.tiltDeg * Math.PI) / 180;
  ctx.translate(W / 2, H / 2);
  ctx.rotate(tiltRad);
  ctx.translate(-W / 2, -H / 2);

  // determine which characters to draw
  let chars = name.split("");
  if (style.initialsOnly) {
    // take first letter of each word
    chars = name.split(/\s+/).map(w => w[0]).filter(Boolean);
  } else if (style.skipLetters && chars.length > 3) {
    // keep first 2-3 letters, replace rest with a wavy line
    chars = chars.slice(0, Math.min(3, Math.ceil(chars.length * 0.3)));
  }

  // calculate total width for centering
  const letterW = 18 * (1 / style.speed);
  const gap = 4 * (1 / style.speed);
  const totalW = chars.length * (letterW + gap);
  const startX = (W - totalW) / 2;
  const baseY = H / 2 + 10;

  // start flourish
  if (style.flourish) {
    drawFlourish(ctx, startX - 10, baseY, "start", 40 + rng() * 30, style.inkColor, style.pressure, rng);
  }

  let curX = startX;

  // draw each letter
  for (let ci = 0; ci < chars.length; ci++) {
    const ch = chars[ci];
    if (ch === " ") {
      curX += letterW * 0.5;
      continue;
    }

    const paths = getLetterPaths(ch);
    const isFirst = ci === 0;
    const scale = isFirst ? 1.6 : 0.9 + rng() * 0.3;
    const yOff = isFirst ? -12 : (rng() - 0.5) * 6;

    for (const stroke of paths) {
      const points: { x: number; y: number }[] = [];
      for (let pi = 0; pi < stroke.length; pi++) {
        const [dx, dy] = stroke[pi];
        const x = curX + dx * scale * (1 / style.speed);
        const y = baseY + (dy - 15) * scale + yOff;
        // add slight hand-jitter
        points.push({
          x: x + (rng() - 0.5) * 1.5,
          y: y + (rng() - 0.5) * 1.5,
        });
      }

      const baseStrokeW = isFirst ? 2.2 : 1.5;
      drawStrokeWithPressure(ctx, points, baseStrokeW, style.pressure, style.inkColor, rng);
    }

    // connection stroke to next letter
    if (ci < chars.length - 1 && chars[ci + 1] !== " ") {
      const connPoints: { x: number; y: number }[] = [];
      const endX = curX + letterW * scale;
      const nextX = endX + gap;
      const connY = baseY + (rng() - 0.3) * 8;

      for (let t = 0; t <= 1; t += 0.2) {
        connPoints.push({
          x: endX + t * gap,
          y: connY + Math.sin(t * Math.PI) * (rng() * 5 - 2),
        });
      }
      drawStrokeWithPressure(connPoints.length > 1 ? ctx : ctx, connPoints, 1.0, style.pressure * 0.6, style.inkColor, rng);
    }

    curX += (letterW + gap) * scale;
  }

  // if quick style, add wavy tail for skipped letters
  if (style.skipLetters && name.length > 3) {
    const tailPoints: { x: number; y: number }[] = [];
    const tailLen = Math.min(name.length * 8, 180);
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      tailPoints.push({
        x: curX + t * tailLen,
        y: baseY + Math.sin(t * Math.PI * 3) * (8 - t * 6) + (rng() - 0.5) * 2,
      });
    }
    drawStrokeWithPressure(ctx, tailPoints, 1.5, style.pressure * 0.8, style.inkColor, rng);
    curX += tailLen;
  }

  // end flourish
  if (style.flourish) {
    drawFlourish(ctx, curX + 10, baseY + 5, "end", 50 + rng() * 40, style.inkColor, style.pressure, rng);
  }

  // underline stroke (business / presidential)
  if (style.id === "business" || style.id === "presidential" || style.id === "royal") {
    const ulY = baseY + 25 + rng() * 5;
    const ulPoints: { x: number; y: number }[] = [];
    const ulStart = startX - 20;
    const ulEnd = curX + 30;
    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      ulPoints.push({
        x: ulStart + t * (ulEnd - ulStart),
        y: ulY + Math.sin(t * Math.PI * 1.5) * 3 + (rng() - 0.5) * 1,
      });
    }
    drawStrokeWithPressure(ctx, ulPoints, 1.3, style.pressure * 0.5, style.inkColor, rng);
  }

  // dot decorations (arabic style)
  if (style.dotDecoration) {
    const midX = (startX + curX) / 2;
    drawDots(ctx, midX, baseY, 3 + Math.floor(rng() * 3), 60, style.inkColor, rng);
  }

  ctx.restore();

  return canvas.toDataURL("image/png");
}

export function downloadSignature(dataUrl: string, name: string, styleId: string) {
  const link = document.createElement("a");
  link.download = `signature_${name}_${styleId}.png`;
  link.href = dataUrl;
  link.click();
}
