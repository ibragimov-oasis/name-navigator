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
