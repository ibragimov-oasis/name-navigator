/**
 * Realistic signature generator using Canvas 2D bezier curves.
 * Each letter has hand-crafted cursive stroke paths.
 * Pen-pressure simulation, flourishes, and per-letter deformation.
 */

export interface SignatureStyle {
  id: string;
  label: string;
  inkColor: string;
  bgColor: string;
  tiltDeg: number;
  pressure: number;
  speed: number;
  flourish: boolean;
  initialsOnly: boolean;
  skipLetters: boolean;
  dotDecoration: boolean;
  letterSpacing: number;
}

export const SIGNATURE_STYLES: SignatureStyle[] = [
  { id: "business",     label: "Деловая",          inkColor: "#1a1a2e", bgColor: "#fefefe", tiltDeg: -4,  pressure: 1.0, speed: 1.0, flourish: false, initialsOnly: false, skipLetters: false, dotDecoration: false, letterSpacing: 1.0 },
  { id: "presidential", label: "Президентская",    inkColor: "#1a2744", bgColor: "#f8f6f0", tiltDeg: -6,  pressure: 1.3, speed: 0.9, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false, letterSpacing: 1.1 },
  { id: "calligraphic", label: "Каллиграфическая", inkColor: "#2c3e50", bgColor: "#fffef8", tiltDeg: -8,  pressure: 1.6, speed: 0.7, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false, letterSpacing: 1.2 },
  { id: "quick",        label: "Быстрая",          inkColor: "#333333", bgColor: "#ffffff", tiltDeg: -3,  pressure: 0.7, speed: 1.8, flourish: false, initialsOnly: false, skipLetters: true,  dotDecoration: false, letterSpacing: 0.7 },
  { id: "royal",        label: "Королевская",      inkColor: "#8b6914", bgColor: "#fffdf5", tiltDeg: -5,  pressure: 1.4, speed: 0.8, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false, letterSpacing: 1.15 },
  { id: "arabic",       label: "Арабская",         inkColor: "#1a1a1a", bgColor: "#f9f7f2", tiltDeg: 2,   pressure: 1.2, speed: 0.9, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: true,  letterSpacing: 1.0 },
  { id: "minimalist",   label: "Минималистичная",  inkColor: "#444444", bgColor: "#ffffff", tiltDeg: -2,  pressure: 0.8, speed: 1.5, flourish: false, initialsOnly: true,  skipLetters: false, dotDecoration: false, letterSpacing: 0.9 },
  { id: "artistic",     label: "Артистическая",    inkColor: "#0f3460", bgColor: "#fefefe", tiltDeg: -10, pressure: 1.8, speed: 0.6, flourish: true,  initialsOnly: false, skipLetters: false, dotDecoration: false, letterSpacing: 1.3 },
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

/* ─── Types ─── */
type Point = [number, number]; // [x, y] normalized coordinates
type StrokePath = Point[];

interface LetterDef {
  width: number;       // relative width (height is always 30)
  strokes: StrokePath[];
  descender?: boolean; // goes below baseline (y, р, у, etc.)
  ascender?: boolean;  // goes above cap height (б, etc.)
}

/* ─── LETTER PATHS ─── */
// Each letter defined in a coordinate system: x = 0..width, y = 0..30
// y=0 is top (ascender), y=20 is baseline for lowercase, y=30 is descender
// For uppercase: main body spans y=0..25, baseline at y=25

const UPPER_LETTERS: Record<string, LetterDef> = {
  // ─── CYRILLIC UPPERCASE ───
  'А': { width: 22, strokes: [
    [[0,25],[3,18],[7,8],[11,0],[15,8],[19,18],[22,25]], // A-shape
    [[5,16],[17,16]], // crossbar
  ]},
  'Б': { width: 20, strokes: [
    [[2,0],[18,0]], // top bar
    [[2,0],[2,25],[14,25],[18,22],[18,16],[14,13],[2,13]], // body with loop
  ]},
  'В': { width: 18, strokes: [
    [[2,0],[2,25]], // vertical
    [[2,0],[12,0],[16,3],[16,10],[12,12],[2,12]], // top loop
    [[2,12],[14,12],[18,16],[18,22],[14,25],[2,25]], // bottom loop
  ]},
  'Г': { width: 16, strokes: [
    [[2,0],[16,0]], // top bar
    [[2,0],[2,25]], // vertical
  ]},
  'Д': { width: 24, strokes: [
    [[4,25],[8,0],[16,0],[20,25]], // trapezoid
    [[0,25],[24,25]], // bottom bar
    [[0,25],[0,30]], // left leg
    [[24,25],[24,30]], // right leg
  ]},
  'Е': { width: 16, strokes: [
    [[16,0],[2,0],[2,25],[16,25]], // C-shape open right
    [[2,12],[12,12]], // middle bar
  ]},
  'Ж': { width: 28, strokes: [
    [[14,0],[14,25]], // center vertical
    [[0,0],[14,12],[0,25]], // left X
    [[28,0],[14,12],[28,25]], // right X
  ]},
  'З': { width: 16, strokes: [
    [[2,2],[6,0],[12,0],[16,4],[16,10],[12,12],[8,12]], // top arc
    [[8,12],[12,12],[16,16],[16,22],[12,25],[6,25],[2,23]], // bottom arc
  ]},
  'И': { width: 20, strokes: [
    [[2,0],[2,25],[18,0],[18,25]], // N-reversed diagonal
  ]},
  'Й': { width: 20, strokes: [
    [[2,0],[2,25],[18,0],[18,25]], // same as И
    [[6,-4],[10,-6],[14,-4]], // breve on top
  ]},
  'К': { width: 18, strokes: [
    [[2,0],[2,25]], // vertical
    [[18,0],[2,14],[18,25]], // diagonal arms
  ]},
  'Л': { width: 20, strokes: [
    [[0,25],[8,0],[12,0],[20,25]], // Л shape (tent)
  ]},
  'М': { width: 26, strokes: [
    [[2,25],[2,0],[13,18],[24,0],[24,25]], // M with two peaks
  ]},
  'Н': { width: 20, strokes: [
    [[2,0],[2,25]], // left vertical
    [[18,0],[18,25]], // right vertical
    [[2,12],[18,12]], // crossbar
  ]},
  'О': { width: 20, strokes: [
    [[10,0],[4,0],[1,6],[1,19],[4,25],[10,25],[16,25],[19,19],[19,6],[16,0],[10,0]], // oval
  ]},
  'П': { width: 20, strokes: [
    [[2,0],[18,0]], // top bar
    [[2,0],[2,25]], // left leg
    [[18,0],[18,25]], // right leg
  ]},
  'Р': { width: 18, strokes: [
    [[2,0],[2,25]], // vertical
    [[2,0],[12,0],[16,3],[16,10],[12,13],[2,13]], // loop
  ]},
  'С': { width: 18, strokes: [
    [[18,3],[14,0],[6,0],[2,4],[2,21],[6,25],[14,25],[18,22]], // C-arc
  ]},
  'Т': { width: 18, strokes: [
    [[0,0],[18,0]], // top bar
    [[9,0],[9,25]], // vertical center
  ]},
  'У': { width: 20, strokes: [
    [[2,0],[10,14]], // left arm down
    [[18,0],[10,14],[6,25],[3,28]], // right arm continuing to descender
  ], descender: true },
  'Ф': { width: 22, strokes: [
    [[11,0],[11,25]], // vertical
    [[11,6],[5,6],[2,10],[2,16],[5,20],[11,20]], // left loop
    [[11,6],[17,6],[20,10],[20,16],[17,20],[11,20]], // right loop
  ]},
  'Х': { width: 18, strokes: [
    [[2,0],[18,25]], // diagonal 1
    [[18,0],[2,25]], // diagonal 2
  ]},
  'Ц': { width: 22, strokes: [
    [[2,0],[2,25],[20,25],[20,0]], // П shape
    [[20,25],[22,30]], // tail
  ]},
  'Ч': { width: 18, strokes: [
    [[2,0],[2,12],[16,12]], // left arm + crossbar
    [[16,0],[16,25]], // right vertical
  ]},
  'Ш': { width: 26, strokes: [
    [[2,0],[2,25],[13,25],[13,0],[13,25],[24,25],[24,0]], // three verticals
  ]},
  'Щ': { width: 28, strokes: [
    [[2,0],[2,25],[13,25],[13,0],[13,25],[24,25],[24,0]], // three verticals
    [[24,25],[26,25],[28,30]], // tail
  ]},
  'Ъ': { width: 18, strokes: [
    [[2,0],[8,0],[8,25],[14,25],[18,21],[18,16],[14,13],[8,13]], // hard sign
  ]},
  'Ы': { width: 24, strokes: [
    [[2,0],[2,25],[8,25],[12,21],[12,16],[8,13],[2,13]], // Ь part
    [[20,0],[20,25]], // right I
  ]},
  'Ь': { width: 16, strokes: [
    [[2,0],[2,25],[10,25],[14,21],[14,16],[10,13],[2,13]], // soft sign
  ]},
  'Э': { width: 18, strokes: [
    [[0,3],[4,0],[12,0],[16,4],[16,21],[12,25],[4,25],[0,22]], // reversed C
    [[6,12],[16,12]], // middle bar
  ]},
  'Ю': { width: 26, strokes: [
    [[2,0],[2,25]], // left I
    [[2,12],[10,12]], // connector
    [[18,0],[13,0],[10,6],[10,19],[13,25],[18,25],[23,25],[26,19],[26,6],[23,0],[18,0]], // O
  ]},
  'Я': { width: 18, strokes: [
    [[16,0],[16,25]], // right vertical
    [[16,0],[6,0],[2,3],[2,10],[6,13],[16,13]], // reversed P loop
    [[8,13],[2,25]], // leg
  ]},

  // ─── LATIN UPPERCASE ───
  'A': { width: 22, strokes: [
    [[0,25],[11,0],[22,25]], [[5,16],[17,16]],
  ]},
  'B': { width: 18, strokes: [
    [[2,0],[2,25]], [[2,0],[12,0],[16,3],[16,10],[12,12],[2,12]],
    [[2,12],[14,12],[18,16],[18,22],[14,25],[2,25]],
  ]},
  'C': { width: 18, strokes: [
    [[18,3],[14,0],[6,0],[2,4],[2,21],[6,25],[14,25],[18,22]],
  ]},
  'D': { width: 18, strokes: [
    [[2,0],[2,25]], [[2,0],[10,0],[16,4],[18,12],[16,21],[10,25],[2,25]],
  ]},
  'E': { width: 16, strokes: [
    [[16,0],[2,0],[2,25],[16,25]], [[2,12],[12,12]],
  ]},
  'F': { width: 16, strokes: [
    [[16,0],[2,0],[2,25]], [[2,12],[12,12]],
  ]},
  'G': { width: 20, strokes: [
    [[18,3],[14,0],[6,0],[2,4],[2,21],[6,25],[14,25],[18,21],[18,14],[12,14]],
  ]},
  'H': { width: 20, strokes: [
    [[2,0],[2,25]], [[18,0],[18,25]], [[2,12],[18,12]],
  ]},
  'I': { width: 8, strokes: [
    [[4,0],[4,25]],
  ]},
  'J': { width: 14, strokes: [
    [[12,0],[12,20],[9,25],[5,25],[2,22]],
  ]},
  'K': { width: 18, strokes: [
    [[2,0],[2,25]], [[18,0],[2,14],[18,25]],
  ]},
  'L': { width: 16, strokes: [
    [[2,0],[2,25],[16,25]],
  ]},
  'M': { width: 26, strokes: [
    [[2,25],[2,0],[13,18],[24,0],[24,25]],
  ]},
  'N': { width: 20, strokes: [
    [[2,25],[2,0],[18,25],[18,0]],
  ]},
  'O': { width: 20, strokes: [
    [[10,0],[4,0],[1,6],[1,19],[4,25],[10,25],[16,25],[19,19],[19,6],[16,0],[10,0]],
  ]},
  'P': { width: 18, strokes: [
    [[2,0],[2,25]], [[2,0],[12,0],[16,3],[16,10],[12,13],[2,13]],
  ]},
  'Q': { width: 20, strokes: [
    [[10,0],[4,0],[1,6],[1,19],[4,25],[10,25],[16,25],[19,19],[19,6],[16,0],[10,0]],
    [[14,20],[20,28]],
  ]},
  'R': { width: 18, strokes: [
    [[2,0],[2,25]], [[2,0],[12,0],[16,3],[16,10],[12,13],[2,13]], [[12,13],[18,25]],
  ]},
  'S': { width: 16, strokes: [
    [[16,3],[12,0],[4,0],[1,4],[1,9],[4,12],[12,12],[15,16],[15,22],[12,25],[4,25],[1,22]],
  ]},
  'T': { width: 18, strokes: [
    [[0,0],[18,0]], [[9,0],[9,25]],
  ]},
  'U': { width: 20, strokes: [
    [[2,0],[2,20],[5,25],[15,25],[18,20],[18,0]],
  ]},
  'V': { width: 20, strokes: [
    [[2,0],[10,25],[18,0]],
  ]},
  'W': { width: 28, strokes: [
    [[2,0],[7,25],[14,10],[21,25],[26,0]],
  ]},
  'X': { width: 18, strokes: [
    [[2,0],[18,25]], [[18,0],[2,25]],
  ]},
  'Y': { width: 20, strokes: [
    [[2,0],[10,14],[18,0]], [[10,14],[10,25]],
  ]},
  'Z': { width: 18, strokes: [
    [[2,0],[18,0],[2,25],[18,25]],
  ]},
};

/* ─── Cursive transformation ─── */
// Transform block-letter paths into flowing cursive by adding curves and slant
function cursifyPath(points: Point[], rng: () => number, slant: number): Point[] {
  if (points.length < 2) return points;
  const result: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    // Apply italic slant: shift x based on how high the point is
    const slantOffset = (25 - y) * slant * 0.15;
    // Add hand-like micro-jitter
    const jx = (rng() - 0.5) * 1.2;
    const jy = (rng() - 0.5) * 1.0;
    result.push([x + slantOffset + jx, y + jy]);
  }
  return result;
}

// Interpolate between points to create smooth curves
function interpolatePoints(pts: Point[], density: number): Point[] {
  if (pts.length < 2) return pts;
  const result: Point[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    const steps = Math.max(2, Math.floor(dist / density));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      // Use smoothstep for more natural movement
      const st = t * t * (3 - 2 * t);
      result.push([x0 + (x1 - x0) * st, y0 + (y1 - y0) * st]);
    }
  }
  return result;
}

function getLetterDef(ch: string): LetterDef {
  const upper = ch.toUpperCase();
  if (UPPER_LETTERS[upper]) return UPPER_LETTERS[upper];
  // Fallback: generate a procedural shape
  const c = upper.charCodeAt(0);
  const w = 14 + (c % 8);
  const h = 25;
  return {
    width: w,
    strokes: [[
      [0, h * 0.8],
      [w * 0.2, h * 0.1],
      [w * 0.5, 0],
      [w * 0.8, h * 0.3],
      [w, h * 0.7],
      [w * 0.7, h],
    ]],
  };
}

/* ─── drawing helpers ─── */

function drawStrokeWithPressure(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  baseWidth: number,
  pressure: number,
  color: string,
  rng: () => number
): void {
  if (points.length < 2) return;

  // Dynamic pressure: bell curve — thick in middle, thin at edges
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;

  // Pass 1: soft shadow/bleed
  ctx.globalAlpha = 0.06;
  ctx.lineWidth = baseWidth * pressure * 2.5;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();

  // Pass 2: main ink with dynamic width
  ctx.globalAlpha = 0.85;
  for (let i = 1; i < points.length; i++) {
    const t = i / points.length;
    // Bell curve pressure: thick in middle
    const bellPressure = Math.sin(t * Math.PI) * 0.6 + 0.4;
    // Random hand tremor
    const tremor = 1 + (rng() - 0.5) * 0.15;
    ctx.lineWidth = baseWidth * pressure * bellPressure * tremor;

    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }

  // Pass 3: crisp center line
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = baseWidth * pressure * 0.45;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const mx = (prev.x + curr.x) / 2;
    const my = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawFlourish(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  direction: "start" | "end",
  size: number,
  color: string,
  pressure: number,
  rng: () => number,
  type: "loop" | "wave" | "spiral"
): void {
  const points: { x: number; y: number }[] = [];
  const steps = 25;
  const sign = direction === "start" ? -1 : 1;

  if (type === "loop") {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 2;
      const radius = size * 0.4 * (1 - t * 0.3);
      points.push({
        x: x + sign * t * size * 0.6 + Math.cos(angle) * radius * 0.3,
        y: y + Math.sin(angle) * radius,
      });
    }
  } else if (type === "wave") {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({
        x: x + sign * t * size * (0.8 + rng() * 0.4),
        y: y + Math.sin(t * Math.PI * 2.5) * size * 0.25 * (1 - t * 0.5),
      });
    }
  } else {
    // spiral
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 3;
      const radius = size * 0.15 * t;
      points.push({
        x: x + sign * t * size * 0.3 + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
      });
    }
  }

  drawStrokeWithPressure(ctx, points, 1.0, pressure * 0.6, color, rng);
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  count: number,
  spread: number,
  color: string,
  rng: () => number
): void {
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
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

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
    chars = name.split(/\s+/).map(w => w[0]).filter(Boolean);
  } else if (style.skipLetters && chars.length > 3) {
    chars = chars.slice(0, Math.min(3, Math.ceil(chars.length * 0.3)));
  }

  // calculate sizes
  const baseLetterW = 16 * (1 / style.speed) * style.letterSpacing;
  const baseScale = 0.85;
  const firstLetterScale = 1.8; // first letter is much bigger

  // estimate total width for centering
  let totalEstW = 0;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === " ") { totalEstW += baseLetterW * 0.5; continue; }
    const def = getLetterDef(chars[i]);
    const s = i === 0 ? firstLetterScale : baseScale + rng() * 0.15;
    totalEstW += def.width * s * (1 / style.speed) + 4 * style.letterSpacing;
  }

  // if quick style, add tail width estimate
  if (style.skipLetters && name.length > 3) {
    totalEstW += Math.min(name.length * 8, 180);
  }
  // add flourish width estimates
  if (style.flourish) totalEstW += 100;

  const startX = Math.max(30, (W - totalEstW) / 2);
  const baseY = H / 2 + 15;

  // Slant factor for cursive italic feel
  const slant = style.tiltDeg < 0 ? 0.2 : -0.1;

  // start flourish
  const flourishTypes: Array<"loop" | "wave" | "spiral"> = ["loop", "wave", "spiral"];
  const flourishType = flourishTypes[Math.floor(rng() * 3)];

  if (style.flourish) {
    drawFlourish(ctx, startX - 10, baseY, "start", 35 + rng() * 25, style.inkColor, style.pressure, rng, flourishType);
  }

  let curX = startX;
  let lastEndPoint: { x: number; y: number } | null = null;

  // draw each character
  for (let ci = 0; ci < chars.length; ci++) {
    const ch = chars[ci];
    if (ch === " ") {
      curX += baseLetterW * 0.5;
      lastEndPoint = null;
      continue;
    }

    const def = getLetterDef(ch);
    const isFirst = ci === 0;
    const scale = isFirst ? firstLetterScale : baseScale + rng() * 0.15;
    const yOff = isFirst ? -10 : (rng() - 0.5) * 4;
    const letterScale = scale * (1 / style.speed);

    // Connection stroke from previous letter
    if (lastEndPoint && !isFirst) {
      const connStart = lastEndPoint;
      const connEnd = { x: curX, y: baseY + yOff };
      const connMid = {
        x: (connStart.x + connEnd.x) / 2,
        y: Math.min(connStart.y, connEnd.y) - 3 - rng() * 4,
      };
      const connPoints: { x: number; y: number }[] = [];
      for (let t = 0; t <= 1; t += 0.1) {
        const u = 1 - t;
        connPoints.push({
          x: u * u * connStart.x + 2 * u * t * connMid.x + t * t * connEnd.x,
          y: u * u * connStart.y + 2 * u * t * connMid.y + t * t * connEnd.y,
        });
      }
      drawStrokeWithPressure(ctx, connPoints, 1.0, style.pressure * 0.5, style.inkColor, rng);
    }

    // Draw letter strokes
    let letterLastPt: { x: number; y: number } | null = null;
    for (const stroke of def.strokes) {
      const cursified = cursifyPath(stroke, rng, slant);
      const interpolated = interpolatePoints(cursified, 3);

      const screenPoints = interpolated.map(([px, py]) => ({
        x: curX + px * letterScale,
        y: baseY + (py - 12) * letterScale * 0.8 + yOff,
      }));

      const baseStrokeW = isFirst ? 2.0 : 1.3;
      drawStrokeWithPressure(ctx, screenPoints, baseStrokeW, style.pressure, style.inkColor, rng);

      if (screenPoints.length > 0) {
        letterLastPt = screenPoints[screenPoints.length - 1];
      }
    }

    lastEndPoint = letterLastPt;
    curX += (def.width + 4 * style.letterSpacing) * letterScale;
  }

  // if quick style, add wavy tail for skipped letters
  if (style.skipLetters && name.length > 3) {
    const tailPoints: { x: number; y: number }[] = [];
    const tailLen = Math.min(name.length * 8, 180);
    for (let i = 0; i <= 35; i++) {
      const t = i / 35;
      tailPoints.push({
        x: curX + t * tailLen,
        y: baseY + Math.sin(t * Math.PI * 3) * (8 - t * 6) + (rng() - 0.5) * 2,
      });
    }
    drawStrokeWithPressure(ctx, tailPoints, 1.5, style.pressure * 0.7, style.inkColor, rng);
    curX += tailLen;
  }

  // end flourish
  if (style.flourish) {
    const endFlourishType = flourishTypes[Math.floor(rng() * 3)];
    drawFlourish(ctx, curX + 10, baseY + 5, "end", 45 + rng() * 35, style.inkColor, style.pressure, rng, endFlourishType);
  }

  // underline stroke (business / presidential / royal)
  if (style.id === "business" || style.id === "presidential" || style.id === "royal") {
    const ulY = baseY + 22 + rng() * 5;
    const ulPoints: { x: number; y: number }[] = [];
    const ulStart = startX - 15;
    const ulEnd = curX + 25;
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      ulPoints.push({
        x: ulStart + t * (ulEnd - ulStart),
        y: ulY + Math.sin(t * Math.PI * 1.2) * 3 + (rng() - 0.5) * 0.8,
      });
    }
    drawStrokeWithPressure(ctx, ulPoints, 1.2, style.pressure * 0.45, style.inkColor, rng);
  }

  // dot decorations (arabic style)
  if (style.dotDecoration) {
    const midX = (startX + curX) / 2;
    drawDots(ctx, midX, baseY, 3 + Math.floor(rng() * 3), 60, style.inkColor, rng);
  }

  ctx.restore();

  return canvas.toDataURL("image/png");
}

export function downloadSignature(dataUrl: string, name: string, styleId: string): void {
  const link = document.createElement("a");
  link.download = `signature_${name}_${styleId}.png`;
  link.href = dataUrl;
  link.click();
}
