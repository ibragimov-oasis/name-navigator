import type { TajikRegistryName } from "@/data/tajikTypes";
import { normalizeLoose, normalizeStrict } from "@/lib/tajik/text";

export type RegistryStatus = "permitted" | "likely" | "not_found";
export interface RegistryBadge { status: RegistryStatus; label: string }

/** Культуры, для которых показываем соответствие реестру имён РТ. */
export function isRegistryCulture(culture: string): boolean {
  return /таджик|персид/i.test(culture);
}

export interface RegistryLookup { strict: Set<string>; loose: Map<string, string> }

export function buildRegistryLookup(names: readonly TajikRegistryName[]): RegistryLookup {
  const strict = new Set<string>(); const loose = new Map<string, string>();
  for (const n of names) {
    for (const v of [n.name_tj, n.name_cyrillic, n.name_tj_raw, n.name_cyrillic_raw]) {
      if (!v) continue;
      strict.add(normalizeStrict(v));
      const l = normalizeLoose(v);
      if (!loose.has(l)) loose.set(l, n.name_tj);
    }
  }
  return { strict, loose };
}

export function registryBadge(name: string, lookup: RegistryLookup): RegistryBadge {
  if (lookup.strict.has(normalizeStrict(name))) return { status: "permitted", label: "В реестре РТ" };
  const similar = lookup.loose.get(normalizeLoose(name));
  if (similar) return { status: "likely", label: `Похоже на «${similar}» (реестр РТ)` };
  return { status: "not_found", label: "Нет в реестре РТ" };
}
