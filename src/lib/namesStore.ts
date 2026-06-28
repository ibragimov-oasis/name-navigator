import { ChildName, childNames as defaultChildNames, cultures as defaultCultures, religions as defaultReligions, uniqueAttributes as defaultChildAttributes } from "@/data/childNames";
import { PetName, petNames as defaultPetNames, animalTypes as defaultAnimalTypes, petAttributes as defaultPetAttributes } from "@/data/petNames";
import { supabase } from "@/integrations/supabase/client";

// Runtime store — starts with defaults, can be extended via CSV import or auto-enrichment
let childNamesStore: ChildName[] = [...defaultChildNames];
let petNamesStore: PetName[] = [...defaultPetNames];
let enrichedLoaded = false;

// Lazy-load AI-enriched names from Supabase (fire-and-forget, dedupes by name+gender)
export async function loadEnrichedNames(): Promise<number> {
  if (enrichedLoaded) return 0;
  enrichedLoaded = true;
  try {
    const { data, error } = await supabase
      .from("names_enriched")
      .select("id,name,gender,culture,origin,religion,meaning,history,attributes,languages")
      .eq("status", "published")
      .limit(1000);
    if (error || !data) return 0;
    const existing = new Set(
      childNamesStore.map((n) => `${n.name.toLowerCase()}|${n.gender}`),
    );
    const mapped: ChildName[] = data
      .filter((r: any) => !existing.has(`${(r.name as string).toLowerCase()}|${r.gender}`))
      .map((r: any) => ({
        id: `enriched-${r.id}`,
        name: r.name,
        gender: r.gender,
        origin: r.origin ?? "",
        culture: r.culture ?? "",
        religion: r.religion ?? undefined,
        meaning: r.meaning ?? "",
        attributes: Array.isArray(r.attributes) ? r.attributes : [],
        popularity: 50,
        history: r.history ?? "",
        languages: Array.isArray(r.languages) ? r.languages : [],
      }));
    childNamesStore = [...childNamesStore, ...mapped];
    return mapped.length;
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
