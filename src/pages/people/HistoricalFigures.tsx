import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Crown, Search, BookOpen } from "lucide-react";
import { historicalFigures, figureFields } from "@/data/historicalFigures";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";

const HistoricalFigures = () => {
  const [search, setSearch] = useState("");
  const [field, setField] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return historicalFigures.filter((f) => {
      if (field !== "all" && f.field !== field) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          (f.fullName?.toLowerCase().includes(q) ?? false) ||
          f.knownFor.some((k) => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, field]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ to: "/people", label: "Для людей" }, { label: "Исторические личности" }]} />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
            <Crown className="h-6 w-6 text-gold" />
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Исторические личности
          </h1>
          <p className="mt-2 text-muted-foreground">
            Реальные люди, чьи имена изменили историю
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по имени или сфере…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setField("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                field === "all" ? "bg-gold text-white" : "bg-secondary text-secondary-foreground"
              }`}
            >
              Все
            </button>
            {figureFields.map((f) => (
              <button
                key={f.key}
                onClick={() => setField(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  field === f.key ? "bg-gold text-white" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((f) => {
            const open = expandedId === f.id;
            return (
              <div
                key={f.id}
                className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedId(open ? null : f.id)}
                  className="flex w-full items-start gap-4 p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-foreground">{f.name}</h3>
                    {f.fullName && (
                      <p className="text-xs text-muted-foreground">{f.fullName}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-gold/10 px-2 py-0.5 text-gold font-medium">
                        {f.era}
                      </span>
                      <span className="text-muted-foreground">{f.region}</span>
                      <span className="text-muted-foreground">· {f.years}</span>
                    </div>
                  </div>
                </button>
                {open && (
                  <div className="px-4 pb-4 animate-fade-in border-t border-border pt-3 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">{f.bio}</p>
                    <div className="flex flex-wrap gap-1">
                      {f.knownFor.map((k) => (
                        <span
                          key={k}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                    {f.derivedNames && f.derivedNames.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                          Имена, связанные с этой личностью:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {f.derivedNames.map((dn) => (
                            <Link
                              key={dn}
                              to={`/?name=${encodeURIComponent(dn)}`}
                              className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-colors"
                            >
                              {dn}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    <Link
                      to={`/tafsir?name=${encodeURIComponent(f.name)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <BookOpen className="h-3 w-3" /> Тафсир имени
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Никого не найдено по этому фильтру.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoricalFigures;
