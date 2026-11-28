// Typed client for the gemini-decisions edge function (Gemini Decision 1 + Flash Lite chain).
// Local logic always runs first; AI decisions only add to it and are cached for 7 days.
import { supabase } from "@/integrations/supabase/client";

export type DecisionMode = "yes_no" | "choice" | "rubric";
export interface DecisionOption { label: string; p: number }
export interface DecisionResult {
  decision: string;
  confidence: number;
  options: DecisionOption[];
  reason: string;
  model: string;
}

const CACHE = "decision:v1:";
const TTL = 7 * 24 * 3600_000;
const RATE_KEY = "decision:rate";
const RATE_LIMIT = 20;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function rateOk(): boolean {
  try {
    const now = Date.now();
    const arr = (JSON.parse(localStorage.getItem(RATE_KEY) || "[]") as number[]).filter((t) => now - t < 60_000);
    if (arr.length >= RATE_LIMIT) return false;
    arr.push(now);
    localStorage.setItem(RATE_KEY, JSON.stringify(arr));
  } catch { /* storage unavailable */ }
  return true;
}

export async function decide(input: { mode: DecisionMode; question: string; options?: string[]; context?: string }): Promise<DecisionResult> {
  const key = CACHE + hash(JSON.stringify(input));
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { t, v } = JSON.parse(raw) as { t: number; v: DecisionResult };
      if (Date.now() - t < TTL) return v;
    }
  } catch { /* ignore */ }
  if (!rateOk()) throw new Error("Слишком много запросов, подождите минуту.");
  const { data, error } = await supabase.functions.invoke<DecisionResult & { error?: string }>("gemini-decisions", { body: input });
  if (error || !data || data.error) throw new Error(data?.error || "ИИ сейчас недоступен — показан локальный результат.");
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: data })); } catch { /* ignore */ }
  return data;
}

// ---- Legal compliance agent (Tajik registry) ----
export const LEGALITY_OPTIONS = [
  "Прямое совпадение с реестром",
  "Допустимая национальная традиция",
  "Иноязычное / противоречит национальной культуре",
  "Устаревшее / искажённое написание",
] as const;

export function evaluateLegalityDecision(fio: { firstName: string; patronymic?: string; lastName?: string }, registryHint: string) {
  return decide({
    mode: "choice",
    options: [...LEGALITY_OPTIONS],
    question: `К какой категории относится ФИО «${[fio.lastName, fio.firstName, fio.patronymic].filter(Boolean).join(" ")}» по правилам именования Республики Таджикистан (национальный реестр имён, суффиксы фамилий -зода, -пур, -ӣ, -иён, -духт)?`,
    context: `Результат локальной проверки по реестру: ${registryHint}`,
  });
}

/** Rule: an exact registry match always wins over the AI answer. */
export function mergeLegality(registryStatus: "permitted" | "likely" | "not_found", ai: DecisionResult | null) {
  if (registryStatus === "permitted") return { label: LEGALITY_OPTIONS[0] as string, confidence: 1, source: "registry" as const };
  if (!ai) return null;
  return { label: ai.decision, confidence: ai.confidence, source: "ai" as const };
}

// ---- Sunnah & adab agent ----
export const ADAB_LEVELS = ["Харам", "Макрух", "Сомнительное", "Мубах", "Мустахабб"] as const;
export function evaluateAdabScore(name: string, meaning?: string) {
  return decide({
    mode: "rubric",
    options: ["0", "1", "2", "3", "4"],
    question: `Оцени имя «${name}» по исламскому этикету имянаречения: 0 — харам (рабство не Аллаху), 1 — макрух (грустное, высокомерное, идолы, грехи), 2 — сомнительное, 3 — мубах (хорошее нейтральное), 4 — мустахабб (пророки, сподвижники, Абдуллах/Абдуррахман).`,
    context: meaning ? `Значение: ${meaning}` : undefined,
  });
}
export function adabLevel(r: DecisionResult) {
  const i = Math.max(0, Math.min(4, parseInt(r.decision, 10) || 0));
  return { index: i, label: ADAB_LEVELS[i] };
}

// ---- Family harmony agent ----
export const HARMONY_OPTIONS = ["Отлично звучит", "Хорошо", "Есть запинки", "Плохо сочетается"] as const;
export function evaluateHarmonyScore(f: { name: string; fullName: string; mother?: string; siblings?: string[]; localScore: number }) {
  return decide({
    mode: "choice",
    options: [...HARMONY_OPTIONS],
    question: `Насколько благозвучно полное имя «${f.fullName}» (стыки согласных, ритм, звучание во взрослом возрасте и в сочетании с именами братьев/сестёр)?`,
    context: [
      f.mother && `Имя матери: ${f.mother}`,
      f.siblings?.length && `Старшие дети: ${f.siblings.join(", ")}`,
      `Локальная оценка гармонии: ${f.localScore}%`,
    ].filter(Boolean).join("\n"),
  });
}
