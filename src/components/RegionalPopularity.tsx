import { useState, useMemo } from "react";
import { MapPin, TrendingUp } from "lucide-react";
import { REGIONS, YEARS, getRegionData } from "@/data/regionPopularity";

export const RegionalPopularity = () => {
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [year, setYear] = useState<number>(YEARS[YEARS.length - 1]);

  const data = useMemo(() => getRegionData(region, year), [region, year]);
  const males = data.filter((n) => n.gender === "male");
  const females = data.filter((n) => n.gender === "female");

  return (
    <div className="rounded-xl border border-border bg-card p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">
          Популярность по регионам России
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Данные на основе агрегированной статистики ЗАГС
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">Регион</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Год: {year}
          </label>
          <input
            type="range"
            min={YEARS[0]}
            max={YEARS[YEARS.length - 1]}
            step={1}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            {YEARS.map((y) => <span key={y}>{y}</span>)}
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Нет данных для этого региона/года
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: "♂ Топ мужских", list: males, color: "text-accent" },
            { title: "♀ Топ женских", list: females, color: "text-rose" },
          ].map((block) => (
            <div key={block.title} className="rounded-lg bg-secondary/30 p-4">
              <h4 className={`text-sm font-bold mb-2 ${block.color}`}>{block.title}</h4>
              <ol className="space-y-1">
                {block.list.map((n) => (
                  <li key={n.rank} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] font-bold text-muted-foreground">
                      {n.rank}
                    </span>
                    <span className="text-foreground">{n.name}</span>
                    {n.rank === 1 && <TrendingUp className="h-3 w-3 text-primary ml-auto" />}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegionalPopularity;
