import { Link, useLocation } from "react-router-dom";
import { Baby, PawPrint, Sparkles, Upload, Wand2, Swords, CalendarDays, Heart, Menu, X, Pen, Hash, Dna, BookOpen, Crown, BookHeart, ScrollText, GitCompare, BarChart3, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useFavorites } from "@/lib/favorites";
import AISearchDialog from "@/components/AISearchDialog";

const navItems = [
  { to: "/children", label: "Дети", icon: Baby, activeClass: "bg-coral-light text-primary" },
  { to: "/pets", label: "Питомцы", icon: PawPrint, activeClass: "bg-teal-light text-accent" },
  { to: "/favorites", label: "Избранное", icon: Heart, activeClass: "bg-rose-light text-rose" },
  { to: "/wizard", label: "Мастер", icon: Wand2, activeClass: "bg-lavender-light text-lavender" },
  { to: "/battle", label: "Битва", icon: Swords, activeClass: "bg-rose-light text-rose" },
  { to: "/calendar", label: "Именины", icon: CalendarDays, activeClass: "bg-gold/10 text-gold" },
  { to: "/signature", label: "Подпись", icon: Pen, activeClass: "bg-teal-light text-accent" },
  { to: "/numerology", label: "Нумерология", icon: Hash, activeClass: "bg-lavender-light text-lavender" },
  { to: "/dna", label: "ДНК", icon: Dna, activeClass: "bg-coral-light text-primary" },
  { to: "/tafsir", label: "Тафсир", icon: BookOpen, activeClass: "bg-primary/10 text-primary" },
  { to: "/prophets", label: "Пророки", icon: Crown, activeClass: "bg-gold/10 text-gold" },
  { to: "/dua", label: "Дуа", icon: BookHeart, activeClass: "bg-accent/10 text-accent" },
  { to: "/naming-guide", label: "Этикет", icon: ScrollText, activeClass: "bg-lavender-light text-lavender" },
  { to: "/compare", label: "Сравнение", icon: GitCompare, activeClass: "bg-teal-light text-accent" },
  { to: "/stats", label: "Статистика", icon: BarChart3, activeClass: "bg-coral-light text-primary" },
  { to: "/import", label: "Импорт", icon: Upload, activeClass: "bg-secondary text-foreground" },
];

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { favorites } = useFavorites();

  // Global ⌘K / Ctrl+K hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <AISearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="h-6 w-6 text-primary group-hover:animate-float" />
          <span className="font-display text-xl font-bold text-foreground">ИмяГен</span>
        </Link>

        {/* AI Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors mx-4"
          aria-label="AI поиск"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Спросить AI…</span>
          <kbd className="ml-2 rounded border border-border bg-background px-1.5 text-[10px]">⌘K</kbd>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                location.pathname === item.to ? item.activeClass : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.to === "/favorites" && favorites.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[10px] font-bold text-white">
                  {favorites.length > 9 ? "9+" : favorites.length}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-2 space-y-1 animate-fade-in">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                location.pathname === item.to ? item.activeClass : "text-muted-foreground hover:bg-secondary"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.to === "/favorites" && favorites.length > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
