import { Badge } from "@/components/ui/badge";

interface FilterChipsProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  colorClass?: string;
}

const FilterChips = ({ label, options, selected, onToggle, colorClass = "bg-coral-light text-primary" }: FilterChipsProps) => {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
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
    </div>
  );
};

export default FilterChips;
