import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

export type PersonRelation =
  | "self"
  | "child"
  | "spouse"
  | "parent"
  | "friend"
  | "character"
  | "historical";

export type PersonGender = "male" | "female";

export interface NameHistoryEntry {
  name: string;
  reason?: string;
  date: string; // ISO yyyy-mm-dd
}

export interface RevertChecklist {
  nameChosen?: boolean;
  shahadaSpoken?: boolean;
  ghuslDone?: boolean;
  imamConfirmed?: boolean;
}

export interface Person {
  id: string;
  fullName: string;
  surname?: string;
  patronymic?: string; // отчество / насаб
  kunya?: string; // Абу/Умм
  nisba?: string;
  laqab?: string; // прозвище
  gender: PersonGender;
  birthDate?: string; // ISO yyyy-mm-dd
  relation: PersonRelation;
  notes?: string;
  // v2 fields (added 2026-04)
  nameHistory?: NameHistoryEntry[];
  parentId?: string;
  spouseId?: string;
  tags?: string[];
  meaningPersonal?: string;
  revertChecklist?: RevertChecklist;
  createdAt: number;
  updatedAt: number;
}

export type PersonInput = Omit<Person, "id" | "createdAt" | "updatedAt">;

// v1 used "imyagen.people.v1" — we keep the same key but migrate shapes in-place.
const STORAGE_KEY = "imyagen.people.v1";
const ACTIVE_KEY = "imyagen.people.active.v1";
const SCHEMA_VERSION = 2;
const SCHEMA_KEY = "imyagen.people.schema";

interface PeopleContextType {
  people: Person[];
  activePersonId: string | null;
  activePerson: Person | null;
  setActivePersonId: (id: string | null) => void;
  addPerson: (input: PersonInput) => Person;
  updatePerson: (id: string, patch: Partial<PersonInput>) => void;
  removePerson: (id: string) => void;
  getPerson: (id: string) => Person | undefined;
  appendNameHistory: (id: string, entry: NameHistoryEntry) => void;
  clearAll: () => void;
}

const PeopleContext = createContext<PeopleContextType | null>(null);

const safeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p_${Math.random().toString(36).slice(2)}_${Date.now()}`;

function migrate(p: Partial<Person>): Person | null {
  if (!p || typeof p.id !== "string" || typeof p.fullName !== "string") return null;
  return {
    id: p.id,
    fullName: p.fullName,
    surname: p.surname,
    patronymic: p.patronymic,
    kunya: p.kunya,
    nisba: p.nisba,
    laqab: p.laqab,
    gender: p.gender === "female" ? "female" : "male",
    birthDate: p.birthDate,
    relation: (p.relation as PersonRelation) ?? "self",
    notes: p.notes,
    nameHistory: Array.isArray(p.nameHistory) ? p.nameHistory : [],
    parentId: p.parentId,
    spouseId: p.spouseId,
    tags: Array.isArray(p.tags) ? p.tags : [],
    meaningPersonal: p.meaningPersonal,
    revertChecklist: p.revertChecklist ?? undefined,
    createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
    updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
  };
}

const loadPeople = (): Person[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed.map(migrate).filter((x): x is Person => x !== null);
    try {
      localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
    } catch {
      /* ignore */
    }
    return migrated;
  } catch {
    return [];
  }
};

export const PeopleProvider = ({ children }: { children: ReactNode }) => {
  const [people, setPeople] = useState<Person[]>(loadPeople);
  const [activePersonId, setActivePersonIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    } catch {
      /* quota — ignore */
    }
  }, [people]);

  useEffect(() => {
    try {
      if (activePersonId) localStorage.setItem(ACTIVE_KEY, activePersonId);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }, [activePersonId]);

  const setActivePersonId = useCallback((id: string | null) => {
    setActivePersonIdState(id);
  }, []);

  const addPerson = useCallback((input: PersonInput): Person => {
    const now = Date.now();
    const person: Person = {
      ...input,
      nameHistory: input.nameHistory ?? [],
      tags: input.tags ?? [],
      id: safeId(),
      createdAt: now,
      updatedAt: now,
    };
    setPeople((prev) => [person, ...prev]);
    return person;
  }, []);

  const updatePerson = useCallback(
    (id: string, patch: Partial<PersonInput>) => {
      setPeople((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
        )
      );
    },
    []
  );

  const removePerson = useCallback((id: string) => {
    // Cleanup references in other profiles to avoid dangling links.
    setPeople((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((p) => {
          const next = { ...p };
          if (next.parentId === id) next.parentId = undefined;
          if (next.spouseId === id) next.spouseId = undefined;
          return next;
        })
    );
    setActivePersonIdState((cur) => (cur === id ? null : cur));
  }, []);

  const getPerson = useCallback(
    (id: string) => people.find((p) => p.id === id),
    [people]
  );

  const appendNameHistory = useCallback(
    (id: string, entry: NameHistoryEntry) => {
      setPeople((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                nameHistory: [...(p.nameHistory ?? []), entry],
                updatedAt: Date.now(),
              }
            : p
        )
      );
    },
    []
  );

  const clearAll = useCallback(() => {
    setPeople([]);
    setActivePersonIdState(null);
  }, []);

  const activePerson = useMemo(
    () => people.find((p) => p.id === activePersonId) ?? null,
    [people, activePersonId]
  );

  const value = useMemo<PeopleContextType>(
    () => ({
      people,
      activePersonId,
      activePerson,
      setActivePersonId,
      addPerson,
      updatePerson,
      removePerson,
      getPerson,
      appendNameHistory,
      clearAll,
    }),
    [
      people,
      activePersonId,
      activePerson,
      setActivePersonId,
      addPerson,
      updatePerson,
      removePerson,
      getPerson,
      appendNameHistory,
      clearAll,
    ]
  );

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
};

export const usePeople = () => {
  const ctx = useContext(PeopleContext);
  if (!ctx) throw new Error("usePeople must be used within PeopleProvider");
  return ctx;
};

export const RELATION_LABELS: Record<PersonRelation, string> = {
  self: "Я сам(а)",
  child: "Ребёнок",
  spouse: "Супруг(а)",
  parent: "Родитель",
  friend: "Друг / близкий",
  character: "Персонаж",
  historical: "Историческая личность",
};

export const formatFullName = (p: Person): string => {
  const parts: string[] = [];
  if (p.kunya) parts.push(p.kunya);
  parts.push(p.fullName);
  if (p.patronymic) parts.push(`ибн/бинт ${p.patronymic}`);
  if (p.surname) parts.push(p.surname);
  if (p.nisba) parts.push(`ал-${p.nisba}`);
  if (p.laqab) parts.push(`«${p.laqab}»`);
  return parts.join(" ");
};
