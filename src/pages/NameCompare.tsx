import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { getChildNames } from "@/lib/namesStore";
import { calculateNumerology } from "@/lib/numerology";
import { GitCompare, Search, X } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const ATTR_CATEGORIES = ["сильный", "мудрый", "красивый", "добрый", "благородный", "верующий", "храбрый", "милосердный", "справедливый", "терпеливый"];

const NameCompare = () => {
  const [inputs, setInputs] = useState(["", ""]);
  const allNames = getChildNames();

  const selectedNames = useMemo(() => {
    return inputs.map(inp => {
      if (!inp.trim()) return null;
      return allNames.find(n => n.name.toLowerCase() === inp.toLowerCase().trim()) || null;
    });
  }, [inputs, allNames]);

  const radarData = useMemo(() => {
    return ATTR_CATEGORIES.map(attr => {
      const entry: Record<string, string | number> = { attribute: attr };
      selectedNames.forEach((name, i) => {
        if (name) {
          entry[`name${i}`] = name.attributes.includes(attr) ? 100 : name.attributes.some(a => a.toLowerCase().includes(attr.substring(0, 4))) ? 60 : 20;
        }
      });
      return entry;
    });
  }, [selectedNames]);

  const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--rose))", "hsl(var(--gold))"];

  const addSlot = () => { if (inputs.length < 4) setInputs([...inputs, ""]); };
  const removeSlot = (i: number) => {
    if (inputs.length > 2) setInputs(inputs.filter((_, idx) => idx !== i));
  };

  const getSuggestions = (query: string) => {
    if (!query.trim()) return [];
    return allNames.filter(n => n.name.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <GitCompare className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Сравнение имён</h1>
          <p className="mt-2 text-muted-foreground">Сравните 2–4 имени по всем параметрам</p>
        </div>

        {/* Input fields */}
        <div className="flex flex-wrap gap-3 mb-8">
          {inputs.map((inp, i) => (
            <div key={i} className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={inp}
                onChange={e => { const next = [...inputs]; next[i] = e.target.value; setInputs(next); }}
                placeholder={`Имя ${i + 1}`}
                className="pl-9 pr-8"
                style={{ borderColor: selectedNames[i] ? colors[i] : undefined }}
              />
              {inputs.length > 2 && (
                <button onClick={() => removeSlot(i)} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              {inp && !selectedNames[i] && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                  {getSuggestions(inp).map(n => (
                    <button key={n.id} onClick={() => { const next = [...inputs]; next[i] = n.name; setInputs(next); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary">
                      <span className="font-semibold">{n.name}</span>
                      <span className="text-xs text-muted-foreground">{n.meaning}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {inputs.length < 4 && (
            <button onClick={addSlot} className="rounded-xl border-2 border-dashed border-border px-6 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              + Добавить
            </button>
          )}
        </div>

        {/* Radar chart */}
        {selectedNames.some(Boolean) && (
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Радар атрибутов</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                {selectedNames.map((name, i) => name && (
                  <Radar key={i} name={name.name} dataKey={`name${i}`} stroke={colors[i]} fill={colors[i]} fillOpacity={0.15} strokeWidth={2} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {selectedNames.map((name, i) => name && (
                <span key={i} className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[i] }} />
                  {name.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comparison table */}
        {selectedNames.filter(Boolean).length >= 2 && (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left text-muted-foreground font-semibold">Параметр</th>
                  {selectedNames.map((name, i) => name && (
                    <th key={i} className="p-3 text-center font-bold text-foreground">{name.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Значение", fn: (n: any) => n.meaning },
                  { label: "Происхождение", fn: (n: any) => n.origin },
                  { label: "Культура", fn: (n: any) => n.culture },
                  { label: "Пол", fn: (n: any) => n.gender === "male" ? "♂ Муж" : n.gender === "female" ? "♀ Жен" : "⚥" },
                  { label: "Популярность", fn: (n: any) => `${n.popularity}/100` },
                  { label: "Число судьбы", fn: (n: any) => String(calculateNumerology(n.name).destinyNumber) },
                  { label: "Атрибуты", fn: (n: any) => n.attributes.slice(0, 4).join(", ") },
                ].map(row => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="p-3 font-semibold text-muted-foreground">{row.label}</td>
                    {selectedNames.map((name, i) => name && (
                      <td key={i} className="p-3 text-center text-foreground">{row.fn(name)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!selectedNames.some(Boolean) && (
          <div className="text-center py-16 text-muted-foreground">
            Введите имена для сравнения
          </div>
        )}
      </div>
    </div>
  );
};

export default NameCompare;
