import { Link, useLocation } from "react-router-dom";
import {
  Baby,
  PawPrint,
  Sparkles,
  Heart,
  Menu,
  BookOpen,
  Crown,
  BookHeart,
  ScrollText,
  Search,
  Users,
  ShieldCheck,
  ChevronDown,
  Wand2,
  Swords,
  CalendarDays,
  Pen,
  Hash,
  Dna,
  GitCompare,
  BarChart3,
  Globe,
  Scale,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { useNav } from "@/lib/navContext";
import AISearchDialog from "@/components/AISearchDialog";
import MobileNavDrawer from "@/components/MobileNavDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const location = useLocation();
  const { favorites } = useFavorites();
  const { searchOpen, setSearchOpen, openSearch, openDrawer } = useNav();

  const isTajik = location.pathname.startsWith("/tajik");
  const isChildren = location.pathname.startsWith("/children") || location.pathname.startsWith("/people") || location.pathname.startsWith("/pets") || location.pathname === "/couple" || location.pathname === "/style-quiz";
  const isIslamic = location.pathname === "/tafsir" || location.pathname === "/prophets" || location.pathname === "/dua" || location.pathname === "/naming-guide" || location.pathname === "/calendar";
  const isTools = location.pathname === "/wizard" || location.pathname === "/battle" || location.pathname === "/signature" || location.pathname === "/numerology" || location.pathname === "/dna" || location.pathname === "/compare" || location.pathname === "/stats" || location.pathname === "/analytics" || location.pathname === "/import";
  const isFavorites = location.pathname === "/favorites";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md transition-all">
      <AISearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileNavDrawer />

      <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-black tracking-tight text-foreground leading-tight">
              ИмяГен
            </span>
            <span className="hidden sm:block text-[9px] text-muted-foreground font-medium -mt-0.5">
              Навигатор имён
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {/* 1. Tajik Registry */}
          <Link
            to="/tajik-names"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              isTajik
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Реестр РТ (№98)</span>
            <span className="text-[10px] font-mono px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              3.4k
            </span>
          </Link>

          {/* 2. Names Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors outline-none ${
                isChildren
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Baby className="h-4 w-4" />
              <span>Подбор имён</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-xl border-border/80">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Категории
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/children" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Baby className="h-4 w-4 text-primary" />
                  <span>Имена для детей</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/people" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Взрослые и персонажи</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/people/profiles" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <UserCircle2 className="h-4 w-4 text-primary" />
                  <span>Профили семьи</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/couple" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Heart className="h-4 w-4 text-rose" />
                  <span>Вдвоём (Couple Swipe)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/style-quiz" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span>Стиль-тест имён</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pets" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <PawPrint className="h-4 w-4 text-accent" />
                  <span>Клички для питомцев</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Islamic Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors outline-none ${
                isIslamic
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Исламские</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-xl border-border/80">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Исламские сервисы
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/tafsir" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Тафсир имени</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/prophets" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Crown className="h-4 w-4 text-gold" />
                  <span>Пророки и сахабы</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dua" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <BookHeart className="h-4 w-4 text-accent" />
                  <span>Дуа для ребёнка</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/naming-guide" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <ScrollText className="h-4 w-4 text-lavender" />
                  <span>Этикет имянаречения</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/calendar" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  <span>Календарь именин</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 4. Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors outline-none ${
                isTools
                  ? "bg-lavender-light text-lavender font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Wand2 className="h-4 w-4" />
              <span>Инструменты</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 shadow-xl border-border/80">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                Генераторы & Анализ
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/wizard" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Wand2 className="h-4 w-4 text-lavender" />
                  <span>Мастер ФИО (Насаб/Кунья)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/battle" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Swords className="h-4 w-4 text-rose" />
                  <span>Битва имён</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/signature" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Pen className="h-4 w-4 text-accent" />
                  <span>Генератор подписи</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/numerology" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Hash className="h-4 w-4 text-lavender" />
                  <span>Нумерология (Абджад)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dna" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Dna className="h-4 w-4 text-primary" />
                  <span>ДНК имени</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compare" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <GitCompare className="h-4 w-4 text-accent" />
                  <span>Сравнение имён</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/stats" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Статистика базы</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/analytics" className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer">
                  <Globe className="h-4 w-4 text-accent" />
                  <span>Мировая аналитика</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 5. Favorites */}
          <Link
            to="/favorites"
            className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              isFavorites
                ? "bg-rose-light text-rose"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 ${favorites.length > 0 ? "fill-rose text-rose" : ""}`} />
            <span>Избранное</span>
            {favorites.length > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
                {favorites.length > 99 ? "99+" : favorites.length}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* AI Search button (Desktop) */}
          <button
            onClick={openSearch}
            className="hidden md:flex items-center gap-2 rounded-xl border border-border/80 bg-secondary/50 px-3.5 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
            aria-label="AI поиск"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>Спросить AI…</span>
            <kbd className="ml-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Search Icon Trigger */}
          <button
            onClick={openSearch}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
            aria-label="Поиск с AI"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={openDrawer}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
            aria-label="Открыть мобильное меню"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
