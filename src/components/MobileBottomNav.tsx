import { Link, useLocation } from "react-router-dom";
import { Home, ShieldCheck, Heart, Menu, Sparkles } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { useNav } from "@/lib/navContext";

export default function MobileBottomNav() {
  const location = useLocation();
  const { favorites } = useFavorites();
  const { openDrawer, openSearch } = useNav();

  const isHome = location.pathname === "/";
  const isTajik = location.pathname === "/tajik-names" || location.pathname === "/tajikistan";
  const isFavorites = location.pathname === "/favorites";

  return (
    <nav
      aria-label="Нижняя панель навигации"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/80 bg-background/95 backdrop-blur-xl pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex h-14 items-center justify-around px-2">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors active:scale-95 ${
            isHome
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className={`h-5 w-5 ${isHome ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
          <span className="text-[10px] font-medium tracking-tight">Главная</span>
        </Link>

        {/* 2. Tajik Registry */}
        <Link
          to="/tajik-names"
          className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors active:scale-95 ${
            isTajik
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck
            className={`h-5 w-5 ${
              isTajik
                ? "stroke-[2.5] text-emerald-600 dark:text-emerald-400"
                : "stroke-[1.75]"
            }`}
          />
          <span className="text-[10px] font-medium tracking-tight">Реестр РТ</span>
          {/* Subtle indicator dot for official registry */}
          <span className="absolute top-1 right-1/4 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </Link>

        {/* 3. AI Search - Center Action Button */}
        <div className="flex flex-1 flex-col items-center justify-center -mt-3">
          <button
            onClick={openSearch}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-90 hover:scale-105"
            aria-label="AI Поиск имён"
          >
            <Sparkles className="h-5 w-5" />
          </button>
          <span className="text-[9px] font-semibold text-muted-foreground mt-0.5">
            AI Поиск
          </span>
        </div>

        {/* 4. Favorites */}
        <Link
          to="/favorites"
          className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors active:scale-95 ${
            isFavorites
              ? "text-rose font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorites ? "fill-rose text-rose stroke-[2.5]" : "stroke-[1.75]"
            }`}
          />
          <span className="text-[10px] font-medium tracking-tight">Избранное</span>
          {favorites.length > 0 && (
            <span className="absolute top-0.5 right-1/4 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose px-1 text-[9px] font-black text-white shadow-sm">
              {favorites.length > 99 ? "99+" : favorites.length}
            </span>
          )}
        </Link>

        {/* 5. Menu Drawer Trigger */}
        <button
          onClick={openDrawer}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          aria-label="Открыть полное меню"
        >
          <Menu className="h-5 w-5 stroke-[1.75]" />
          <span className="text-[10px] font-medium tracking-tight">Меню</span>
        </button>
      </div>
    </nav>
  );
}
