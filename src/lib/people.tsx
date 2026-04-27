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
  createdAt: number;
  updatedAt: number;
}

export type PersonInput = Omit<Person, "id" | "createdAt" | "updatedAt">;

const STORAGE_KEY = "imyagen.people.v1";

interface PeopleContextType {
  people: Person[];
  activePersonId: string | null;
  activePerson: Person | null;
  setActivePersonId: (id: string | null) => void;
  addPerson: (input: PersonInput) => Person;
  updatePerson: (id: string, patch: Partial<PersonInput>) => void;
  removePerson: (id: string) => void;
  getPerson: (id: string) => Person | undefined;
  clearAll: () => void;
}

const PeopleContext = createContext<PeopleContextType | null>(null);

const ACTIVE_KEY = "imyagen.people.active.v1";

const safeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const loadPeople = (): Person[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Person =>
        p && typeof p.id === "string" && typeof p.fullName === "string"
    );
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

  const removePerson = useCallback(
    (id: string) => {
      setPeople((prev) => prev.filter((p) => p.id !== id));
      setActivePersonIdState((cur) => (cur === id ? null : cur));
    },
    []
  );

  const getPerson = useCallback(
    (id: string) => people.find((p) => p.id === id),
    [people]
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
