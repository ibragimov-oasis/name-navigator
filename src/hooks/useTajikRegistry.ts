import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TajikRegistryName, TajikAlphabetStat, TajikRegistryCounts } from "@/data/tajikTypes";
import { getTajikAlphabetStats, getTajikCounts } from "@/data/tajikRegistry";
import { fetchRegistry, getCachedRegistry } from "@/lib/api/tajikRegistryApi";

export interface UseTajikRegistryResult {
  names: TajikRegistryName[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  counts: TajikRegistryCounts;
  alphabetStats: TajikAlphabetStat[];
}

const EMPTY: TajikRegistryName[] = [];

/**
 * Асинхронная загрузка реестра из /data/tajik-registry.json.
 * Данные кэшируются в памяти — повторные вызовы мгновенны.
 */
export function useTajikRegistry(): UseTajikRegistryResult {
  const cached = getCachedRegistry();
  const [names, setNames] = useState<TajikRegistryName[]>(cached ?? EMPTY);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (getCachedRegistry() && attempt === 0) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchRegistry(controller.signal)
      .then((data) => {
        if (!mounted.current) return;
        setNames(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!mounted.current || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Хатои боркунии феҳрист");
        setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => setAttempt((a) => a + 1), []);

  const counts = useMemo(() => getTajikCounts(names), [names]);
  const alphabetStats = useMemo(() => getTajikAlphabetStats(names), [names]);

  return { names, loading, error, reload, counts, alphabetStats };
}

/** Дебаунс произвольного значения */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
