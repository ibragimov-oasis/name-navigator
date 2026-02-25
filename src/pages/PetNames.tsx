import { useState, useMemo } from "react";
import { getPetNames, getPetAnimalTypes, getPetAttributesList } from "@/lib/namesStore";
import Header from "@/components/Header";
import FilterChips from "@/components/FilterChips";
import NameCard from "@/components/NameCard";
import SortBar, { SortOption } from "@/components/SortBar";
import { Search, PawPrint } from "lucide-react";

const PetNames = () => {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("popularity");

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let result = getPetNames().filter((n) => {
      if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (gender.length > 0 && !gender.includes(n.gender)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(n.animalType)) return false;
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
  }, [search, gender, selectedTypes, selectedAttributes, sort]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-light">
            <PawPrint className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Имена для питомцев</h1>
            <p className="text-sm text-muted-foreground">Подберите уникальное имя для вашего любимца</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
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
              options={["male", "female", "unisex"]}
              selected={gender}
              onToggle={(v) => toggle(gender, v, setGender)}
              colorClass="bg-coral-light text-primary"
            />

            <FilterChips
              label="Тип животного"
              options={getPetAnimalTypes()}
              selected={selectedTypes}
              onToggle={(v) => toggle(selectedTypes, v, setSelectedTypes)}
              colorClass="bg-teal-light text-accent"
            />

            <FilterChips
              label="Атрибуты"
              options={getPetAttributesList()}
              selected={selectedAttributes}
              onToggle={(v) => toggle(selectedAttributes, v, setSelectedAttributes)}
              colorClass="bg-rose-light text-rose"
            />

            {(gender.length > 0 || selectedTypes.length > 0 || selectedAttributes.length > 0) && (
              <button
                onClick={() => { setGender([]); setSelectedTypes([]); setSelectedAttributes([]); }}
                className="w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Сбросить фильтры
              </button>
            )}
          </aside>

          <div className="space-y-3">
            <SortBar sort={sort} onSortChange={setSort} count={filtered.length} />
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <PawPrint className="mb-3 h-10 w-10 text-muted-foreground" />
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

export default PetNames;
