import { Link, useLocation } from "react-router-dom";
import { Baby, PawPrint, Sparkles, Upload } from "lucide-react";

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="h-6 w-6 text-primary group-hover:animate-float" />
          <span className="font-display text-xl font-bold text-foreground">ИмяГен</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/children"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              location.pathname === "/children"
                ? "bg-coral-light text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Baby className="h-4 w-4" />
            Дети
          </Link>
          <Link
            to="/pets"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              location.pathname === "/pets"
                ? "bg-teal-light text-accent"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <PawPrint className="h-4 w-4" />
            Питомцы
          </Link>
          <Link
            to="/import"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              location.pathname === "/import"
                ? "bg-lavender-light text-lavender"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Upload className="h-4 w-4" />
            Импорт
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
