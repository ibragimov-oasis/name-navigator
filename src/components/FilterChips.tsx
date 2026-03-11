import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FilterChipsProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  colorClass?: string;
  collapsible?: boolean;
  maxVisible?: number;
}

const FilterChips = ({ label, options, selected, onToggle, colorClass = "bg-coral-light text-primary", collapsible = false, maxVisible = 12 }: FilterChipsProps) => {
  const [expanded, setExpanded] = useState(false);

  const visibleOptions = collapsible && !expanded ? options.slice(0, maxVisible) : options;
  const hasMore = collapsible && options.length > maxVisible;

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
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
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? (
            <>Свернуть <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Ещё {options.length - maxVisible} <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default FilterChips;
