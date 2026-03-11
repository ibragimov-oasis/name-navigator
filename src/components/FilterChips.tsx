import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface FilterChipsProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  colorClass?: string;
  collapsible?: boolean;
  maxVisible?: number;
  searchable?: boolean;
}

const FilterChips = ({
  label,
  options,
  selected,
  onToggle,
  colorClass = "bg-coral-light text-primary",
  collapsible = false,
  maxVisible = 12,
  searchable = false,
}: FilterChipsProps) => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = searchable && query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const visibleOptions = collapsible && !expanded
    ? filteredOptions.slice(0, maxVisible)
    : filteredOptions;

  const hasMore = collapsible && filteredOptions.length > maxVisible;

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Поиск ${label.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {visibleOptions.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? `${colorClass} border-transparent`
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {option}
            </button>
          );
        })}
        {searchable && query && filteredOptions.length === 0 && (
          <p className="text-xs text-muted-foreground">Ничего не найдено</p>
        )}
      </div>
      {hasMore && !query && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? (
            <>Свернуть <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Ещё {filteredOptions.length - maxVisible} <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default FilterChips;
