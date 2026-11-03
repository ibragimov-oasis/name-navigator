import { ChildName, childNames as defaultChildNames, cultures as defaultCultures, religions as defaultReligions, uniqueAttributes as defaultChildAttributes } from "@/data/childNames";
import { PetName, petNames as defaultPetNames, animalTypes as defaultAnimalTypes, petAttributes as defaultPetAttributes } from "@/data/petNames";

// Runtime store — starts with defaults, can be extended via CSV import
let childNamesStore: ChildName[] = [...defaultChildNames];
let petNamesStore: PetName[] = [...defaultPetNames];

export function getChildNames(): ChildName[] {
  return childNamesStore;
}

export function getPetNames(): PetName[] {
  return petNamesStore;
}

export function addChildNames(names: ChildName[]): number {
  const existingIds = new Set(childNamesStore.map((n) => n.id));
  const newNames = names.filter((n) => !existingIds.has(n.id));
  childNamesStore = [...childNamesStore, ...newNames];
  return newNames.length;
}

export function addPetNames(names: PetName[]): number {
  const existingIds = new Set(petNamesStore.map((n) => n.id));
  const newNames = names.filter((n) => !existingIds.has(n.id));
  petNamesStore = [...petNamesStore, ...newNames];
  return newNames.length;
}

export function getChildCultures(): string[] {
  return [...new Set(childNamesStore.map((n) => n.culture))];
}

export function getChildReligions(): string[] {
  return [...new Set(childNamesStore.filter((n) => n.religion).map((n) => n.religion!))];
}

export function getChildAttributes(): string[] {
  return [...new Set(childNamesStore.flatMap((n) => n.attributes))];
}

export function getPetAnimalTypes(): string[] {
  return [...new Set(petNamesStore.map((n) => n.animalType))];
}

export function getPetAttributesList(): string[] {
  return [...new Set(petNamesStore.flatMap((n) => n.attributes))];
}

// ===== Auto-enriched names (filled by the scheduled `enrich-names` function) =====
interface EnrichedRow {
  id: string; name: string; gender: ChildName["gender"]; culture: string; origin: string | null;
  religion: string | null; meaning: string | null; history: string | null; attributes: string[] | null;
  famous_people: string[] | null; popularity: number | null; name_day: string | null; languages: string[] | null;
}
const ENRICHED_CACHE_KEY = "enriched-names-v1";

function toChildName(r: EnrichedRow): ChildName {
  return {
    id: `ai_${r.id}`, name: r.name, gender: r.gender, culture: r.culture, origin: r.origin ?? r.culture,
    religion: r.religion ?? undefined, meaning: r.meaning ?? "", history: r.history ?? "",
    attributes: Array.isArray(r.attributes) ? r.attributes : [], famousPeople: r.famous_people ?? undefined,
    popularity: r.popularity ?? 50, nameDay: r.name_day ?? undefined, languages: Array.isArray(r.languages) ? r.languages : [],
  };
}

function mergeEnriched(list: ChildName[]): number {
  const known = new Set(childNamesStore.map((n) => `${n.name.toLowerCase()}|${n.gender}`));
  return addChildNames(list.filter((n) => !known.has(`${n.name.toLowerCase()}|${n.gender}`)));
}

// Apply cached copy synchronously so pages see the names on first render.
try {
  const cached = typeof localStorage !== "undefined" ? localStorage.getItem(ENRICHED_CACHE_KEY) : null;
  if (cached) mergeEnriched(JSON.parse(cached) as ChildName[]);
} catch { /* ignore broken cache */ }

let enrichedLoad: Promise<number> | null = null;
export function loadEnrichedNames(): Promise<number> {
  if (enrichedLoad) return enrichedLoad;
  enrichedLoad = (async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const all: ChildName[] = [];
    for (let from = 0; from < 20000; from += 1000) {
      const { data, error } = await supabase
        .from("names_enriched" as never)
        .select("id,name,gender,culture,origin,religion,meaning,history,attributes,famous_people,popularity,name_day,languages")
        .eq("status", "published")
        .range(from, from + 999);
      if (error || !data) break;
      const rows = data as unknown as EnrichedRow[];
      all.push(...rows.map(toChildName));
      if (rows.length < 1000) break;
    }
    try { localStorage.setItem(ENRICHED_CACHE_KEY, JSON.stringify(all)); } catch { /* quota */ }
    const added = mergeEnriched(all);
    if (added > 0 && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("names-updated", { detail: added }));
    return added;
  })().catch(() => 0);
  return enrichedLoad;
}

if (typeof window !== "undefined") void loadEnrichedNames();
