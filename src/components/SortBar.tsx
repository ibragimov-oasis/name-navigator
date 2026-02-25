import { ArrowUpDown } from "lucide-react";

export type SortOption = "alphabetical" | "popularity" | "alphabetical-desc";

interface SortBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  count: number;
}

const SortBar = ({ sort, onSortChange, count }: SortBarProps) => {
  const options: { value: SortOption; label: string }[] = [
    { value: "popularity", label: "По популярности" },
    { value: "alphabetical", label: "А → Я" },
    { value: "alphabetical-desc", label: "Я → А" },
  ];

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Найдено: <span className="font-semibold text-foreground">{count}</span> имён
      </p>
      <div className="flex items-center gap-1">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              sort === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortBar;
