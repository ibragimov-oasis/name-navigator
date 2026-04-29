import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Mic2, Search, Volume2, Star, UserPlus, History } from "lucide-react";
import { getChildNames } from "@/lib/namesStore";
import { usePeople } from "@/lib/people";
import { toast } from "sonner";

const VIBES = [
  { key: "short", label: "Короткое (≤5 букв)" },
  { key: "vowel", label: "Звучное (много гласных)" },
  { key: "rare", label: "Редкое" },
  { key: "global", label: "Универсальное" },
];

const HISTORY_KEY = "imyagen.pseudonym.history.v1";
type HistoryItem = { name: string; gender: "male" | "female"; date: string };

const Pseudonym = () => {
  const { addPerson, setActivePersonId } = usePeople();
  const [search, setSearch] = useState("");
  const [vibes, setVibes] = useState<string[]>(["short"]);
  const [gender, setGender] = useState<"male" | "female" | "any">("any");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    } catch {
      /* ignore */
    }
  }, [history]);

  const saveAsCharacter = (name: string, g: "male" | "female") => {
    const created = addPerson({
      fullName: name,
      gender: g,
      relation: "character",
      tags: ["псевдоним"],
      notes: "Сохранено из инструмента «Псевдоним»",
    });
    setActivePersonId(created.id);
    setHistory((h) => [
      { name, gender: g, date: new Date().toISOString().slice(0, 10) },
      ...h.filter((x) => x.name !== name),
    ]);
    toast.success(`«${name}» сохранён как профиль персонажа`);
  };

  const results = useMemo(() => {
    const all = getChildNames();
    const scored = all
      .filter((n) => (gender === "any" ? true : n.gender === gender))
      .filter((n) => (search ? n.name.toLowerCase().includes(search.toLowerCase()) : true))
      .map((n) => {
        let score = 0;
        const len = n.name.length;
        const vowels = (n.name.match(/[аеёиоуыэюяaeiouy]/gi) || []).length;
        const vowelRatio = vowels / len;

        if (vibes.includes("short") && len <= 5) score += 3;
        if (vibes.includes("short") && len > 7) score -= 2;
        if (vibes.includes("vowel") && vowelRatio > 0.4) score += 3;
        if (vibes.includes("rare") && n.popularity < 50) score += 2;
        if (vibes.includes("rare") && n.popularity > 80) score -= 2;
        if (vibes.includes("global") && n.languages.length >= 2) score += 2;

        // base bonus for memorable / distinct
        score += Math.max(0, 6 - len) * 0.5;
        return { n, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
      .map((x) => x.n);
    return scored;
  }, [search, vibes, gender]);

  const speak = (name: string) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(name);
    u.lang = "ru-RU";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-light">
            <Mic2 className="h-6 w-6 text-accent" />
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Псевдоним / стейдж-нейм
          </h1>
          <p className="mt-2 text-muted-foreground">
            Короткое, звучное и запоминающееся имя для творчества
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Фильтр по имени…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Пол
            </label>
            <div className="mt-2 flex gap-2">
              {(["any", "male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    gender === g
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {g === "any" ? "Любой" : g === "male" ? "♂ Муж" : "♀ Жен"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Звучание
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {VIBES.map((v) => {
                const active = vibes.includes(v.key);
                return (
                  <button
                    key={v.key}
                    onClick={() =>
                      setVibes((arr) =>
                        arr.includes(v.key) ? arr.filter((x) => x !== v.key) : [...arr, v.key],
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Найдено: <span className="font-semibold text-foreground">{results.length}</span>
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">{n.name}</h3>
                  <p className="text-xs text-muted-foreground">{n.meaning}</p>
                </div>
                <button
                  onClick={() => speak(n.name)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-teal-light hover:text-accent"
                  title="Произнести"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                <span className="rounded-full bg-teal-light px-2 py-0.5 text-accent font-medium">
                  {n.name.length} букв
                </span>
                {n.popularity < 50 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-gold/10 px-2 py-0.5 text-gold font-medium">
                    <Star className="h-3 w-3" /> редкое
                  </span>
                )}
                <button
                  onClick={() => saveAsCharacter(n.name, n.gender as "male" | "female")}
                  className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-primary font-semibold hover:bg-primary/20"
                  title="Сохранить как профиль персонажа"
                >
                  <UserPlus className="h-3 w-3" /> Сохранить
                </button>
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Смягчите фильтры — ничего не подошло.
            </p>
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-accent" /> Недавно сохранённые
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h) => (
                <span
                  key={`${h.name}-${h.date}`}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {h.name}
                  <span className="text-muted-foreground">· {h.date}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pseudonym;
