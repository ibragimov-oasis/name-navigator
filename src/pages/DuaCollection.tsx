import { useState } from "react";
import Header from "@/components/Header";
import { duas, Dua } from "@/data/duas";
import { BookHeart, Baby, Stethoscope, ScrollText, Heart } from "lucide-react";

const categoryConfig = {
  birth: { label: "Рождение", icon: Baby, color: "text-primary" },
  naming: { label: "Имянаречение", icon: ScrollText, color: "text-accent" },
  health: { label: "Здоровье", icon: Stethoscope, color: "text-rose" },
  general: { label: "Общие", icon: Heart, color: "text-gold" },
};

const DuaCollection = () => {
  const [activeCategory, setActiveCategory] = useState<Dua["category"] | "all">("all");

  const filtered = activeCategory === "all" ? duas : duas.filter(d => d.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <BookHeart className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Дуа для ребёнка</h1>
          <p className="mt-2 text-muted-foreground">Молитвы при рождении, выборе имени и за здоровье ребёнка</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"
            }`}>
            Все
          </button>
          {(Object.keys(categoryConfig) as Dua["category"][]).map(cat => {
            const cfg = categoryConfig[cat];
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"
                }`}>
                <cfg.icon className="h-3.5 w-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Duas */}
        <div className="space-y-4">
          {filtered.map(dua => {
            const cfg = categoryConfig[dua.category];
            return (
              <div key={dua.id} className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                      <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">{dua.title}</h3>
                  </div>
                </div>

                {/* Arabic text */}
                <div className="rounded-lg bg-secondary/50 p-4 text-center">
                  <p className="text-2xl leading-loose text-foreground" style={{ fontFamily: '"Noto Naskh Arabic", serif', direction: "rtl" }}>
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-xs font-semibold text-primary mb-1">Транслитерация:</p>
                  <p className="text-sm text-foreground italic">{dua.transliteration}</p>
                </div>

                {/* Translation */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Перевод:</p>
                  <p className="text-sm text-foreground">{dua.translation}</p>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>📚 {dua.source}</span>
                  <span>🕐 {dua.when}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DuaCollection;
