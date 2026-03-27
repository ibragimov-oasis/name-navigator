import { useState } from "react";
import Header from "@/components/Header";
import { prophets, Prophet } from "@/data/prophets";
import { Crown, Users, Heart, ChevronDown, ChevronUp } from "lucide-react";

const categories = [
  { key: "prophet" as const, label: "Пророки", icon: Crown, color: "text-primary" },
  { key: "sahabi" as const, label: "Сахабы", icon: Users, color: "text-accent" },
  { key: "wife" as const, label: "Жёны Пророка ﷺ и дочери", icon: Heart, color: "text-rose" },
];

const ProphetsGuide = () => {
  const [activeCategory, setActiveCategory] = useState<"prophet" | "sahabi" | "wife">("prophet");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = prophets.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <Crown className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Пророки и сахабы</h1>
          <p className="mt-2 text-muted-foreground">Имена пророков, сподвижников и семьи Пророка ﷺ</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6">
          {categories.map(c => (
            <button key={c.key} onClick={() => { setActiveCategory(c.key); setExpandedId(null); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                activeCategory === c.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
              }`}>
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id}
              className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md">
              <button
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="flex w-full items-center gap-4 p-4 text-left">
                <div className="flex-shrink-0 text-center">
                  <p className="text-2xl font-bold" style={{ fontFamily: '"Noto Naskh Arabic", serif', direction: "rtl" }}>
                    {p.nameAr}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-foreground">{p.nameRu}</h3>
                  <p className="text-xs text-muted-foreground">{p.title}</p>
                </div>
                {p.mentionedInQuran > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    Коран: {p.mentionedInQuran}×
                  </span>
                )}
                {expandedId === p.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {expandedId === p.id && (
                <div className="border-t border-border p-4 space-y-4 animate-fade-in">
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.story}</p>

                  {p.derivedNames.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Производные имена:</h4>
                      <div className="flex flex-wrap gap-2">
                        {p.derivedNames.map(dn => (
                          <div key={dn.name} className="rounded-lg bg-secondary px-3 py-1.5">
                            <span className="text-sm font-semibold text-foreground">{dn.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">— {dn.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProphetsGuide;
