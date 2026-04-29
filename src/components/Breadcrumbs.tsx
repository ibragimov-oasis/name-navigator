import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  to?: string;
  label: string;
}

const Breadcrumbs = ({ items }: { items: Crumb[] }) => (
  <nav
    aria-label="Хлебные крошки"
    className="container mx-auto max-w-5xl px-4 pt-3"
  >
    <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="h-3 w-3" />
          Главная
        </Link>
      </li>
      {items.map((c, i) => (
        <li key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 opacity-60" />
          {c.to && i < items.length - 1 ? (
            <Link to={c.to} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{c.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
