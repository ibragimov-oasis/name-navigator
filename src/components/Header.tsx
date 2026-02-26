import { Link, useLocation } from "react-router-dom";
import { Baby, PawPrint, Sparkles, Upload, Wand2, Swords, CalendarDays, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/children", label: "Дети", icon: Baby, activeClass: "bg-coral-light text-primary" },
  { to: "/pets", label: "Питомцы", icon: PawPrint, activeClass: "bg-teal-light text-accent" },
  { to: "/wizard", label: "Мастер", icon: Wand2, activeClass: "bg-lavender-light text-lavender" },
  { to: "/battle", label: "Битва", icon: Swords, activeClass: "bg-rose-light text-rose" },
  { to: "/calendar", label: "Именины", icon: CalendarDays, activeClass: "bg-gold/10 text-gold" },
  { to: "/import", label: "Импорт", icon: Upload, activeClass: "bg-secondary text-foreground" },
];

const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="h-6 w-6 text-primary group-hover:animate-float" />
          <span className="font-display text-xl font-bold text-foreground">ИмяГен</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                location.pathname === item.to ? item.activeClass : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
              <item.icon className="h-4 w-4" />
              {item.label}
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
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
