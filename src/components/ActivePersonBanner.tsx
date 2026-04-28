import { Link, useLocation } from "react-router-dom";
import { Star, ChevronRight, X } from "lucide-react";
import { usePeople } from "@/lib/people";

/**
 * Thin sticky banner shown under <Header/> when a profile is active.
 * Hidden on the home page (/) and on /people/* pages where the profile
 * is already obvious from context.
 */
const ActivePersonBanner = () => {
  const { activePerson, setActivePersonId } = usePeople();
  const { pathname } = useLocation();

  if (!activePerson) return null;
  if (pathname === "/") return null;
  if (pathname.startsWith("/people")) return null;

  return (
    <div className="sticky top-[57px] z-40 border-b border-primary/20 bg-primary/5 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between gap-2 px-4 py-1.5 text-xs">
        <div className="flex min-w-0 items-center gap-2 text-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold shrink-0" />
          <span className="truncate">
            Контекст:{" "}
            <Link
              to="/people/profiles"
              className="font-semibold text-primary hover:underline"
            >
              {activePerson.fullName}
            </Link>
            <span className="text-muted-foreground"> — данные подставлены автоматически</span>
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/people/profiles"
            className="hidden sm:inline-flex items-center gap-0.5 text-primary hover:underline font-semibold"
          >
            сменить <ChevronRight className="h-3 w-3" />
          </Link>
          <button
            onClick={() => setActivePersonId(null)}
            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Снять активный профиль"
            title="Снять активный профиль"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivePersonBanner;
