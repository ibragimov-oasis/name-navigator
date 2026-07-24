// Client wrapper around the gemini-chat edge function.
// - LocalStorage cache (sha1-lite of prompt+system+model) — token economy.
// - Simple rate limit (10 req/min/session).
// - askGemini() for plain text, askGeminiJSON() for structured, streamGemini() for live.
import { supabase } from "@/integrations/supabase/client";

export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-2.5-flash-lite";

export interface GeminiOptions {
  system?: string;
  model?: GeminiModel;
  temperature?: number;
  history?: { role: "user" | "model"; text: string }[];
  cache?: boolean; // default true
  cacheTTLms?: number; // default 24h
}

const CACHE_PREFIX = "gemini:cache:";
const RATE_KEY = "gemini:rate";
const RATE_LIMIT = 12;
const RATE_WINDOW = 60_000;

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function checkRate(): boolean {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const now = Date.now();
    const arr: number[] = raw ? JSON.parse(raw) : [];
    const recent = arr.filter((t) => now - t < RATE_WINDOW);
    if (recent.length >= RATE_LIMIT) return false;
    recent.push(now);
    localStorage.setItem(RATE_KEY, JSON.stringify(recent));
    return true;
  } catch {
    return true;
  }
}

function readCache(key: string, ttl: number): string | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { v, t } = JSON.parse(raw);
    if (Date.now() - t > ttl) return null;
    return v;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: string) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: value, t: Date.now() }));
  } catch {
    // quota — clear old
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .slice(0, 20)
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  }
}

export async function askGemini(prompt: string, opts: GeminiOptions = {}): Promise<string> {
  const model = opts.model ?? "gemini-2.5-flash";
  const cacheKey = hash(`${model}::${opts.system ?? ""}::${prompt}`);
  const useCache = opts.cache !== false && !opts.history;
  const ttl = opts.cacheTTLms ?? 24 * 60 * 60 * 1000;

  if (useCache) {
    const hit = readCache(cacheKey, ttl);
    if (hit) return hit;
  }

  if (!checkRate()) {
    throw new Error("Слишком часто. Подождите минуту и попробуйте снова.");
  }

  const { data, error } = await supabase.functions.invoke("gemini-chat", {
    body: {
      prompt,
      system: opts.system,
      model,
      temperature: opts.temperature,
      history: opts.history,
    },
  });

  if (error) throw new Error(error.message || "Gemini ошибка");
  const answer: string = (data as { answer?: string } | null)?.answer ?? "";
  if (!answer) throw new Error("Пустой ответ от Gemini");

  if (useCache) writeCache(cacheKey, answer);
  return answer;
}

export async function askGeminiJSON<T = unknown>(prompt: string, opts: GeminiOptions = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("gemini-chat", {
    body: {
      prompt,
      system: opts.system,
      model: opts.model ?? "gemini-2.5-flash",
      temperature: opts.temperature,
      json: true,
    },
  });
  if (error) throw new Error(error.message || "Gemini ошибка");
  const answer: string = (data as { answer?: string } | null)?.answer ?? "{}";
  return JSON.parse(answer) as T;
}

export function clearGeminiCache() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(CACHE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
