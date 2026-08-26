import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Sparkles,
  ShieldCheck,
  Baby,
  Users,
  PawPrint,
  Heart,
  Wand2,
  Swords,
  CalendarDays,
  Pen,
  Hash,
  Dna,
  BookOpen,
  Crown,
  BookHeart,
  ScrollText,
  GitCompare,
  BarChart3,
  Globe,
  Search,
  Scale,
  UserCircle2,
  ChevronRight,
} from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { usePeople } from "@/lib/people";
import { useNav } from "@/lib/navContext";

export default function MobileNavDrawer() {
  const location = useLocation();
  const { favorites } = useFavorites();
  const { activePerson } = usePeople();
  const { drawerOpen, closeDrawer, openSearch } = useNav();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (!drawerOpen) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-background border-r border-border shadow-2xl animate-in slide-in-from-left duration-300"
        aria-label="Мобильное меню навигации"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5 bg-card/80">
          <Link
            to="/"
            onClick={closeDrawer}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-black text-foreground">
                ИмяГен
              </span>
              <span className="block text-[10px] text-muted-foreground font-medium -mt-1">
                Навигатор имён & культур
              </span>
            </div>
          </Link>

          <button
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Active Person Mini Card (if active) */}
        {activePerson && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <UserCircle2 className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-none">
                  Активный профиль
                </p>
                <p className="text-xs font-bold text-foreground truncate mt-0.5">
                  {activePerson.fullName}
                </p>
              </div>
            </div>
            <Link
              to="/people/profiles"
              onClick={closeDrawer}
              className="text-[11px] text-primary font-semibold hover:underline shrink-0"
            >
              Сменить
            </Link>
          </div>
        )}

        {/* Quick Search Action */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              closeDrawer();
              openSearch();
            }}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-xs text-muted-foreground hover:border-primary/50 hover:bg-secondary/70 transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span>Поиск с AI (значения, тафсир)...</span>
            </div>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono">
              AI
            </kbd>
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 touch-scroll">
          {/* Section 1: Реестр Таджикистана */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Реестр РТ (Қарори №98)
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                3,461 ном
              </span>
            </div>

            <Link
              to="/tajik-names"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/tajik-names")
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Каталог и поиск номҳо</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/certificate"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/certificate")
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scale className="h-4 w-4 text-emerald-500" />
                <span>Сертификати расмии ном</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>

          {/* Section 2: Подбор имён и профили */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Baby className="h-3.5 w-3.5" />
                Подбор имён & Профили
              </span>
            </div>

            <Link
              to="/children"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/children")
                  ? "bg-coral-light text-primary font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Baby className="h-4 w-4 text-primary" />
                <span>Имена для детей</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/people"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/people")
                  ? "bg-coral-light text-primary font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-primary" />
                <span>Для взрослых и персонажей</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/people/profiles"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/people/profiles")
                  ? "bg-coral-light text-primary font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <span>Профили семьи & людей</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/couple"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/couple")
                  ? "bg-rose-light text-rose font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="h-4 w-4 text-rose" />
                <span>Вдвоём (Couple Swipe)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose/10 text-rose font-bold">
                NEW
              </span>
            </Link>

            <Link
              to="/style-quiz"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/style-quiz")
                  ? "bg-gold/15 text-gold font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>Стиль-тест имён (Quiz)</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/pets"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/pets")
                  ? "bg-teal-light text-accent font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PawPrint className="h-4 w-4 text-accent" />
                <span>Клички для питомцев</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/favorites"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/favorites")
                  ? "bg-rose-light text-rose font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="h-4 w-4 text-rose" />
                <span>Избранные имена</span>
              </div>
              {favorites.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>
          </div>

          {/* Section 3: Исламские сервисы */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Исламские традиции
              </span>
            </div>

            <Link
              to="/tafsir"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/tafsir")
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Тафсир имени</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/prophets"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/prophets")
                  ? "bg-gold/15 text-gold font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Crown className="h-4 w-4 text-gold" />
                <span>Пророки и сахабы</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/dua"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/dua")
                  ? "bg-accent/10 text-accent font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookHeart className="h-4 w-4 text-accent" />
                <span>Дуа при рождении ребёнка</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/naming-guide"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/naming-guide")
                  ? "bg-lavender-light text-lavender font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ScrollText className="h-4 w-4 text-lavender" />
                <span>Этикет имянаречения</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/calendar"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/calendar")
                  ? "bg-gold/15 text-gold font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className="h-4 w-4 text-gold" />
                <span>Календарь именин</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>

          {/* Section 4: Инструменты & Аналитика */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-lavender flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                Инструменты & Аналитика
              </span>
            </div>

            <Link
              to="/wizard"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/wizard")
                  ? "bg-lavender-light text-lavender font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wand2 className="h-4 w-4 text-lavender" />
                <span>Мастер ФИО (Кунья/Насаб)</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/battle"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/battle")
                  ? "bg-rose-light text-rose font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Swords className="h-4 w-4 text-rose" />
                <span>Битва имён (Турнир)</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/signature"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/signature")
                  ? "bg-teal-light text-accent font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pen className="h-4 w-4 text-accent" />
                <span>Генератор подписи</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/numerology"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/numerology")
                  ? "bg-lavender-light text-lavender font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Hash className="h-4 w-4 text-lavender" />
                <span>Нумерология (Абджад)</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/dna"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/dna")
                  ? "bg-coral-light text-primary font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Dna className="h-4 w-4 text-primary" />
                <span>ДНК имени</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/compare"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/compare")
                  ? "bg-teal-light text-accent font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GitCompare className="h-4 w-4 text-accent" />
                <span>Сравнение имён (Radar)</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/stats"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/stats")
                  ? "bg-coral-light text-primary font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Статистика базы</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>

            <Link
              to="/analytics"
              onClick={closeDrawer}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                isActive("/analytics")
                  ? "bg-accent/15 text-accent font-bold"
                  : "text-foreground hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-accent" />
                <span>Мировая аналитика</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border p-3 bg-card/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2">
            <span>© ИмяГен 2026</span>
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Реестр РТ
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
