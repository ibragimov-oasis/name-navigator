import { useState, useMemo } from "react";
import Header from "@/components/Header";
import NameCard from "@/components/NameCard";
import FilterChips from "@/components/FilterChips";
import { getChildNames } from "@/lib/namesStore";
import { UserCheck, Search } from "lucide-react";

const GOALS = [
  { key: "change", label: "Смена имени" },
  { key: "revert", label: "Принятие ислама" },
  { key: "rebrand", label: "Личный ребрендинг" },
  { key: "self", label: "Для себя осознанно" },
];

const IMPRESSIONS = [
  { key: "solid", label: "Солидное", attrs: ["мудрый", "сильный", "справедливый", "благородный"] },
  { key: "soft", label: "Мягкое", attrs: ["добрый", "нежный", "мягкая", "спокойный"] },
  { key: "charisma", label: "Харизматичное", attrs: ["весёлый", "красивый", "яркий", "лидер"] },
  { key: "spiritual", label: "Духовное", attrs: ["верующий", "праведный", "благочестивый", "светлый"] },
];

const AdultNames = () => {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<string[]>([]);
  const [goal, setGoal] = useState<string[]>([]);
  const [impression, setImpression] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const all = getChildNames();
    const impressionAttrs = new Set(
      IMPRESSIONS.filter((i) => impression.includes(i.key)).flatMap((i) => i.attrs.map((a) => a.toLowerCase())),
    );

    let result = all.filter((n) => {
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (gender.length > 0 && !gender.includes(n.gender)) return false;

      // Revert goal narrows to muslim names
      if (goal.includes("revert") && n.religion !== "Мусульманское") return false;

      if (impressionAttrs.size > 0) {
        const lowAttrs = n.attributes.map((a) => a.toLowerCase());
        const hit = lowAttrs.some((a) =>
          [...impressionAttrs].some((needle) => a.includes(needle) || needle.includes(a)),
        );
        if (!hit) return false;
      }
      return true;
    });

    // Adults usually prefer rarer / more meaningful names — surface less mainstream first
    if (goal.includes("rebrand") || goal.includes("change")) {
      result = result.sort((a, b) => a.popularity - b.popularity);
    } else {
      result = result.sort((a, b) => b.popularity - a.popularity);
    }
    return result.slice(0, 60);
  }, [search, gender, goal, impression]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-light">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Имя для взрослого</h1>
            <p className="text-sm text-muted-foreground">
              Подбор осознанного имени по цели и впечатлению
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-xl border border-border bg-card p-4 h-fit">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск имени..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <FilterChips
              label="Пол"
              options={["male", "female"]}
              selected={gender}
              onToggle={(v) =>
                setGender((arr) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]))
              }
            />

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Цель
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {GOALS.map((g) => {
                  const active = goal.includes(g.key);
                  return (
                    <button
                      key={g.key}
                      onClick={() =>
                        setGoal((arr) =>
                          arr.includes(g.key) ? arr.filter((x) => x !== g.key) : [...arr, g.key],
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Впечатление
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {IMPRESSIONS.map((i) => {
                  const active = impression.includes(i.key);
                  return (
                    <button
                      key={i.key}
                      onClick={() =>
                        setImpression((arr) =>
                          arr.includes(i.key) ? arr.filter((x) => x !== i.key) : [...arr, i.key],
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {i.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div>
            <p className="mb-3 text-sm text-muted-foreground">
              Найдено: <span className="font-semibold text-foreground">{filtered.length}</span> имён
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((n, i) => (
                <NameCard key={n.id} item={n} index={i} />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  Ничего не найдено. Смягчите фильтры.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdultNames;
