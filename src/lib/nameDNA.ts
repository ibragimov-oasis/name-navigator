/**
 * Name DNA — generates a visual "DNA fingerprint" from a name.
 * Combines letter frequency, phonetic structure, numerology & meaning
 * into a single canvas-rendered card.
 */

import { calculateNumerology } from "./numerology";

export interface NameDNAData {
  name: string;
  letterFreq: Record<string, number>;
  vowelRatio: number;
  phonoProfile: number[];   // 0-1 per character (vowel=high, consonant=low)
  numerology: number;
  dnaColors: string[];
}

const VOWELS = new Set("аеёиоуыэюяaeiouАЕЁИОУЫЭЮЯAEIOU");

const DNA_PALETTE = [
  "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71",
  "#1abc9c", "#3498db", "#9b59b6", "#e84393",
  "#00cec9", "#fdcb6e", "#6c5ce7", "#ff7675",
];

export function analyzeNameDNA(name: string): NameDNAData {
  const clean = name.replace(/\s+/g, "");
  const letterFreq: Record<string, number> = {};
  let vowelCount = 0;

  for (const ch of clean.toLowerCase()) {
    letterFreq[ch] = (letterFreq[ch] || 0) + 1;
    if (VOWELS.has(ch)) vowelCount++;
  }

  const phonoProfile = clean.split("").map(ch => VOWELS.has(ch) ? 0.8 + Math.random() * 0.2 : 0.1 + Math.random() * 0.3);

  const numResult = calculateNumerology(name);
  const destinyNum = numResult.destinyNumber;

  // deterministic color selection based on letters
  const dnaColors = clean.split("").map((ch, i) => {
    const idx = (ch.charCodeAt(0) + i) % DNA_PALETTE.length;
    return DNA_PALETTE[idx];
  });

  return {
    name,
    letterFreq,
    vowelRatio: clean.length > 0 ? vowelCount / clean.length : 0,
    phonoProfile,
    numerology: destinyNum,
    dnaColors,
  };
}

export function renderDNACard(
  dna: NameDNAData,
  canvas: HTMLCanvasElement,
  meaning?: string,
  origin?: string
): string {
  const ctx = canvas.getContext("2d")!;
  const W = 600;
  const H = 400;
  canvas.width = W;
  canvas.height = H;

  // background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#0f0c29");
  grad.addColorStop(0.5, "#302b63");
  grad.addColorStop(1, "#24243e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // DNA double helix
  const helixCenterY = H / 2;
  const helixWidth = W - 80;
  const startX = 40;
  const amplitude = 50;
  const steps = dna.dnaColors.length;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1 || 1);
    const x = startX + t * helixWidth;

    const y1 = helixCenterY + Math.sin(t * Math.PI * 3) * amplitude;
    const y2 = helixCenterY - Math.sin(t * Math.PI * 3) * amplitude;

    // connecting bar
    ctx.beginPath();
    ctx.strokeStyle = dna.dnaColors[i] + "88";
    ctx.lineWidth = 2;
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();

    // nodes
    for (const y of [y1, y2]) {
      ctx.beginPath();
      ctx.fillStyle = dna.dnaColors[i];
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // top strand line
  ctx.beginPath();
  ctx.strokeStyle = "#ffffff44";
  ctx.lineWidth = 2;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1 || 1);
    const x = startX + t * helixWidth;
    const y = helixCenterY + Math.sin(t * Math.PI * 3) * amplitude;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // bottom strand line
  ctx.beginPath();
  ctx.strokeStyle = "#ffffff44";
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1 || 1);
    const x = startX + t * helixWidth;
    const y = helixCenterY - Math.sin(t * Math.PI * 3) * amplitude;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // name text
  ctx.font = "bold 32px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(dna.name, W / 2, 45);

  // subtitle
  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff99";
  ctx.fillText("ДНК ИМЕНИ", W / 2, 68);

  // stats row
  const statsY = H - 60;
  ctx.font = "12px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffffcc";
  ctx.textAlign = "left";
  ctx.fillText(`Число судьбы: ${dna.numerology}`, 40, statsY);
  ctx.fillText(`Гласные: ${Math.round(dna.vowelRatio * 100)}%`, 200, statsY);
  ctx.fillText(`Букв: ${dna.name.replace(/\s/g, "").length}`, 340, statsY);

  if (meaning) {
    ctx.fillText(`Значение: ${meaning.slice(0, 40)}`, 40, statsY + 20);
  }
  if (origin) {
    ctx.fillText(`Происхождение: ${origin}`, 340, statsY + 20);
  }

  // border glow
  ctx.strokeStyle = "#6c5ce744";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  return canvas.toDataURL("image/png");
}
