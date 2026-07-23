import { ChildName, childNames as defaultChildNames } from "@/data/childNames";
import { PetName, petNames as defaultPetNames } from "@/data/petNames";

// Runtime store — starts with defaults, extended via static JSON or edge-function dump
let childNamesStore: ChildName[] = [...defaultChildNames];
let petNamesStore: PetName[] = [...defaultPetNames];
let enrichedLoaded = false;

const SUPABASE_PROJECT = "xvpngscmnasjuwxjoqyp";
const DUMP_URL = `https://${SUPABASE_PROJECT}.supabase.co/functions/v1/names-dump`;
const STATIC_URL = "/data/ai-names.json";

function mergeEnriched(rows: any[]): number {
  const existing = new Set(
    childNamesStore.map((n) => `${n.name.toLowerCase()}|${n.gender}`),
  );
  const mapped: ChildName[] = rows
    .filter(
      (r) =>
        r?.name &&
        r?.gender &&
        !existing.has(`${String(r.name).toLowerCase()}|${r.gender}`),
    )
    .map((r) => ({
      id: `enriched-${r.id}`,
      name: r.name,
      gender: r.gender,
      origin: r.origin ?? "",
      culture: r.culture ?? "",
      religion: r.religion ?? undefined,
      meaning: r.meaning ?? "",
      attributes: Array.isArray(r.attributes) ? r.attributes : [],
      popularity: Number.isFinite(Number(r.popularity)) ? Number(r.popularity) : 50,
      history: r.history ?? "",
      languages: Array.isArray(r.languages) ? r.languages : [],
      nameNative: r.name_native ?? undefined,
      nameLatin: r.name_latin ?? undefined,
      nameDay: r.name_day ?? undefined,
      famousPeople: Array.isArray(r.famous_people) ? r.famous_people : undefined,
    }));
  childNamesStore = [...childNamesStore, ...mapped];
  return mapped.length;
}

// 1) Try static repo file (no DB hit). 2) Fall back to cached edge-function dump.
export async function loadEnrichedNames(): Promise<number> {
  if (enrichedLoaded) return 0;
  enrichedLoaded = true;

  // Static file from repo
  try {
    const res = await fetch(STATIC_URL, { cache: "force-cache" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.names) && json.names.length > 0) {
        return mergeEnriched(json.names);
      }
    }
  } catch {
    /* ignore, try edge */
  }

  // Edge function dump (CDN-cached, hits DB at most once per hour globally)
  try {
    const res = await fetch(DUMP_URL);
    if (!res.ok) return 0;
    const json = await res.json();
    return mergeEnriched(json?.names ?? []);
  } catch {
    return 0;
  }
}

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
