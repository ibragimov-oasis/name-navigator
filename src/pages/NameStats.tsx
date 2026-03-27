import { useMemo } from "react";
import Header from "@/components/Header";
import { getChildNames } from "@/lib/namesStore";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--rose))", "hsl(var(--gold))",
  "hsl(var(--lavender))", "#6366f1", "#f59e0b", "#14b8a6", "#f43f5e", "#8b5cf6",
];

const NameStats = () => {
  const allNames = getChildNames();

  const stats = useMemo(() => {
    const maleNames = allNames.filter(n => n.gender === "male");
    const femaleNames = allNames.filter(n => n.gender === "female");

    // Top by popularity
    const topMale = [...maleNames].sort((a, b) => b.popularity - a.popularity).slice(0, 10);
    const topFemale = [...femaleNames].sort((a, b) => b.popularity - a.popularity).slice(0, 10);

    // By culture
    const cultureCounts: Record<string, number> = {};
    allNames.forEach(n => { cultureCounts[n.culture] = (cultureCounts[n.culture] || 0) + 1; });
    const cultureData = Object.entries(cultureCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // By attribute
    const attrCounts: Record<string, number> = {};
    allNames.forEach(n => n.attributes.forEach(a => { attrCounts[a] = (attrCounts[a] || 0) + 1; }));
    const attrData = Object.entries(attrCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    // Longest/shortest
    const byLength = [...allNames].sort((a, b) => b.name.length - a.name.length);
    const longest = byLength.slice(0, 5);
    const shortest = byLength.slice(-5).reverse();

    // Most attributes
    const byAttrs = [...allNames].sort((a, b) => b.attributes.length - a.attributes.length).slice(0, 5);

    return { topMale, topFemale, cultureData, attrData, longest, shortest, byAttrs, total: allNames.length, maleCount: maleNames.length, femaleCount: femaleNames.length };
  }, [allNames]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <BarChart3 className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Статистика имён</h1>
          <p className="mt-2 text-muted-foreground">Аналитика {stats.total} имён в базе данных</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Всего имён", val: stats.total, color: "text-primary" },
            { label: "Мужских", val: stats.maleCount, color: "text-accent" },
            { label: "Женских", val: stats.femaleCount, color: "text-rose" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <p className={`text-3xl font-bold ${c.color}`}>{c.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Culture distribution */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Распределение по культурам</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.cultureData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {stats.cultureData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top attributes */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Топ-15 атрибутов</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.attrData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top popular */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {[
            { title: "♂ Топ-10 мужских", names: stats.topMale },
            { title: "♀ Топ-10 женских", names: stats.topFemale },
          ].map(block => (
            <div key={block.title} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">{block.title}</h3>
              <div className="space-y-2">
                {block.names.map((n, i) => (
                  <div key={n.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold">{i + 1}</span>
                    <span className="flex-1 font-semibold text-foreground">{n.name}</span>
                    <div className="h-1.5 w-20 rounded-full bg-secondary">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${n.popularity}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{n.popularity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Records */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">📏 Самые длинные</h4>
            {stats.longest.map(n => (
              <p key={n.id} className="text-sm text-muted-foreground">{n.name} <span className="text-xs">({n.name.length} букв)</span></p>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">📏 Самые короткие</h4>
            {stats.shortest.map(n => (
              <p key={n.id} className="text-sm text-muted-foreground">{n.name} <span className="text-xs">({n.name.length} букв)</span></p>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">✨ Больше всего качеств</h4>
            {stats.byAttrs.map(n => (
              <p key={n.id} className="text-sm text-muted-foreground">{n.name} <span className="text-xs">({n.attributes.length} атрибутов)</span></p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameStats;
