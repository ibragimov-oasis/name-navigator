import { useState, useMemo } from "react";
import { childNames, cultures, religions, uniqueAttributes } from "@/data/childNames";
import Header from "@/components/Header";
import FilterChips from "@/components/FilterChips";
import NameCard from "@/components/NameCard";
import SortBar, { SortOption } from "@/components/SortBar";
import { Search, Baby } from "lucide-react";

const ChildrenNames = () => {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<string[]>([]);
  const [selectedCultures, setSelectedCultures] = useState<string[]>([]);
  const [selectedReligions, setSelectedReligions] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("popularity");

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let result = childNames.filter((n) => {
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (gender.length > 0 && !gender.includes(n.gender)) return false;
      if (selectedCultures.length > 0 && !selectedCultures.includes(n.culture)) return false;
      if (selectedReligions.length > 0 && n.religion && !selectedReligions.includes(n.religion)) return false;
      if (selectedAttributes.length > 0 && !selectedAttributes.some((a) => n.attributes.includes(a))) return false;
      return true;
    });

    switch (sort) {
      case "alphabetical":
        result.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      case "alphabetical-desc":
        result.sort((a, b) => b.name.localeCompare(a.name, "ru"));
        break;
      case "popularity":
        result.sort((a, b) => b.popularity - a.popularity);
        break;
    }

    return result;
  }, [search, gender, selectedCultures, selectedReligions, selectedAttributes, sort]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-light">
            <Baby className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Имена для детей</h1>
            <p className="text-sm text-muted-foreground">Найдите идеальное имя для вашего ребёнка</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Filters */}
          <aside className="space-y-4 rounded-xl border border-border bg-card p-4">
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
              onToggle={(v) => toggle(gender, v, setGender)}
              colorClass="bg-coral-light text-primary"
            />

            <FilterChips
              label="Культура"
              options={cultures}
              selected={selectedCultures}
              onToggle={(v) => toggle(selectedCultures, v, setSelectedCultures)}
              colorClass="bg-lavender-light text-lavender"
            />

            <FilterChips
              label="Религия"
              options={religions}
              selected={selectedReligions}
              onToggle={(v) => toggle(selectedReligions, v, setSelectedReligions)}
              colorClass="bg-teal-light text-accent"
            />

            <FilterChips
              label="Атрибуты"
              options={uniqueAttributes}
              selected={selectedAttributes}
              onToggle={(v) => toggle(selectedAttributes, v, setSelectedAttributes)}
              colorClass="bg-rose-light text-rose"
            />

            {(gender.length > 0 || selectedCultures.length > 0 || selectedReligions.length > 0 || selectedAttributes.length > 0) && (
              <button
                onClick={() => { setGender([]); setSelectedCultures([]); setSelectedReligions([]); setSelectedAttributes([]); }}
                className="w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Сбросить фильтры
              </button>
            )}
          </aside>

          {/* Results */}
          <div className="space-y-3">
            <SortBar sort={sort} onSortChange={setSort} count={filtered.length} />
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Baby className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium text-foreground">Ничего не найдено</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((name, i) => (
                  <NameCard key={name.id} item={name} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChildrenNames;
