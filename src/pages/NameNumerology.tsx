import { useState } from "react";
import Header from "@/components/Header";
import { calculateNumerology, getCompatibility, DESTINY_TRAITS } from "@/lib/numerology";
import { Hash, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NameNumerology = () => {
  const [name, setName] = useState("");
  const [name2, setName2] = useState("");
  const [tab, setTab] = useState<"numerology" | "compatibility">("numerology");

  const result = name.trim() ? calculateNumerology(name) : null;
  const traits = result ? DESTINY_TRAITS[result.destinyNumber] : null;
  const compat = name.trim() && name2.trim() ? getCompatibility(name, name2) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <Hash className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Нумерология имени</h1>
          <p className="mt-1 text-muted-foreground">Узнайте числовую энергию вашего имени</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {([
            { id: "numerology" as const, label: "Нумерология", icon: Hash },
            { id: "compatibility" as const, label: "Совместимость", icon: Heart },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
                tab === t.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"
              )}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "numerology" ? (
          <>
            <div className="max-w-sm mx-auto mb-6">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Введите имя..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            {result && traits && (
              <div className="space-y-4 animate-fade-in">
                {/* Destiny number */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Число судьбы</p>
                  <p className="text-5xl font-bold text-primary">{result.destinyNumber}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{traits.title}</p>
                </div>

                {/* Details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground mb-2">Черты характера</p>
                    <div className="flex flex-wrap gap-1.5">
                      {traits.traits.map(t => (
                        <span key={t} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Стихия</span>
                      <span className="font-medium text-foreground">{traits.element}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Планета</span>
                      <span className="font-medium text-foreground">{traits.planet}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Счастливый день</span>
                      <span className="font-medium text-foreground">{traits.luckyDay}</span>
                    </div>
                  </div>
                </div>

                {/* Raw values */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-2">Числовые значения</p>
                  <div className="flex justify-around text-center">
                    {result.system === "abjad" && (
                      <div>
                        <p className="text-2xl font-bold text-foreground">{result.abjadTotal}</p>
                        <p className="text-xs text-muted-foreground">Абджад</p>
                      </div>
                    )}
                    <div>
                      <p className="text-2xl font-bold text-foreground">{result.pythagoreanTotal}</p>
                      <p className="text-xs text-muted-foreground">Пифагор</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{result.destinyNumber}</p>
                      <p className="text-xs text-muted-foreground">Судьба</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="max-w-sm mx-auto mb-6 space-y-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Первое имя..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary" />
              <div className="flex justify-center">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <input type="text" value={name2} onChange={e => setName2(e.target.value)}
                placeholder="Второе имя..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            {compat && (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Совместимость</p>
                  <p className="text-5xl font-bold text-primary">{compat.score}%</p>
                  <div className="mt-3 mx-auto max-w-xs">
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${compat.score}%` }} />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <Sparkles className="mx-auto h-5 w-5 text-primary mb-2" />
                  <p className="text-sm text-foreground">{compat.description}</p>
                </div>

                {/* Both numbers */}
                <div className="grid grid-cols-2 gap-3">
                  {[name, name2].map((n, i) => {
                    const r = calculateNumerology(n);
                    const t = DESTINY_TRAITS[r.destinyNumber];
                    return (
                      <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                        <p className="text-sm font-semibold text-foreground">{n}</p>
                        <p className="text-2xl font-bold text-primary mt-1">{r.destinyNumber}</p>
                        <p className="text-xs text-muted-foreground">{t?.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!result && tab === "numerology" && (
          <div className="mt-12 text-center">
            <p className="text-4xl">🔢</p>
            <p className="mt-2 text-muted-foreground">Введите имя для анализа</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameNumerology;
