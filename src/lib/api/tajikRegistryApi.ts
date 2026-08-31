/**
 * Единый слой доступа к данным Феҳристи номҳои миллии Тоҷикистон.
 *
 * Сейчас источник — статический JSON в /public/data (не попадает в JS-бандл).
 * Позже тот же интерфейс можно перевести на Supabase, включив USE_REMOTE.
 */
import { supabase } from "@/integrations/supabase/client";
import type { TajikRegistryName, NameCheckResult } from "@/data/tajikTypes";
import {
  checkTajikNameLegality,
  searchRegistry as searchInMemory,
  tajikNameSlug,
} from "@/data/tajikRegistry";

export const TAJIK_REGISTRY_URL = "/data/tajik-registry.json";
export const TAJIK_REGISTRY_VERSION = "2026-02-26-98";

/** Переключатель источника: статический файл или таблица Supabase */
const USE_REMOTE = false;

let cache: TajikRegistryName[] | null = null;
let inflight: Promise<TajikRegistryName[]> | null = null;

function isRegistryArray(value: unknown): value is TajikRegistryName[] {
  return Array.isArray(value) && value.every((v) => typeof v === "object" && v !== null && "name_tj" in v);
}

async function fetchStatic(signal?: AbortSignal): Promise<TajikRegistryName[]> {
  try {
    const res = await fetch(TAJIK_REGISTRY_URL, { signal, cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: unknown = await res.json();
    if (!isRegistryArray(json)) throw new Error("Формати нодурусти феҳрист");
    return json;
  } catch (err) {
    if (signal?.aborted) throw err;
    // Фолбэк для тестов/SSR: локальный JSON грузится отдельным чанком
    const mod = await import("@/data/tajikRegistryData.json");
    const data: unknown = (mod as { default: unknown }).default ?? mod;
    if (!isRegistryArray(data)) throw new Error("Формати нодурусти феҳрист");
    return data;
  }
}

/** Загрузка всего реестра (кэшируется в памяти на всё время сессии) */
export function fetchRegistry(signal?: AbortSignal): Promise<TajikRegistryName[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = fetchStatic(signal)
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((err: unknown) => {
      inflight = null;
      throw err instanceof Error ? err : new Error("Хатои номаълум");
    });

  return inflight;
}

/** Сбросить кэш (например, после обновления реестра) */
export function invalidateRegistry(): void {
  cache = null;
  inflight = null;
}

export function getCachedRegistry(): TajikRegistryName[] | null {
  return cache;
}

/** Поиск по реестру */
export async function searchRegistryApi(query: string): Promise<TajikRegistryName[]> {
  const names = await fetchRegistry();
  return searchInMemory(names, query);
}

/** Проверка имени */
export async function checkName(query: string): Promise<NameCheckResult> {
  const names = await fetchRegistry();
  return checkTajikNameLegality(query, names);
}

/** Поиск имени по слагу пермалинка */
export async function fetchNameBySlug(slug: string): Promise<TajikRegistryName | null> {
  const names = await fetchRegistry();
  const target = slug.toLowerCase();
  return (
    names.find((n) => tajikNameSlug(n) === target) ??
    names.find((n) => n.name_tj.toLowerCase() === target) ??
    names.find((n) => n.name_latin.toLowerCase() === target) ??
    null
  );
}

export interface TajikEnrichmentRow {
  name_key: string;
  meaning: string | null;
  history: string | null;
  origin: string | null;
}

/**
 * Дополнительные значения имён, сгенерированные пайплайном обогащения.
 * Таблица может отсутствовать — тогда возвращается пустая карта.
 */
export async function fetchEnrichment(): Promise<Map<string, TajikEnrichmentRow>> {
  const map = new Map<string, TajikEnrichmentRow>();
  if (!USE_REMOTE) {
    try {
      const { data, error } = await supabase
        .from("tajik_registry_enrichment")
        .select("name_key, meaning, history, origin")
        .limit(5000);
      if (error || !data) return map;
      for (const row of data as TajikEnrichmentRow[]) {
        map.set(row.name_key, row);
      }
    } catch {
      return map;
    }
  }
  return map;
}
