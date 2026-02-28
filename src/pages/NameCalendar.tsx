import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { getChildNames } from "@/lib/namesStore";
import { Star, Crown, Moon, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const ISLAMIC_MONTHS = [
  "мухаррам", "сафар", "раби уль-авваль", "раби уль-ахир",
  "джумада уль-уля", "джумада уль-ахира", "раджаб", "шаабан",
  "рамадан", "шавваль", "зуль-каада", "зуль-хиджа",
];

const GREG_MONTHS: Record<string, number> = {
  "января": 0, "февраля": 1, "марта": 2, "апреля": 3,
  "мая": 4, "июня": 5, "июля": 6, "августа": 7,
  "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11,
};

interface ParsedNameDay {
  type: "islamic" | "gregorian";
  day: number;
  monthIndex: number;
}

function parseNameDay(nameDay: string): ParsedNameDay | null {
  const text = nameDay.trim().toLowerCase();
  for (let i = 0; i < ISLAMIC_MONTHS.length; i++) {
    if (text.includes(ISLAMIC_MONTHS[i])) {
      const day = parseInt(text.replace(ISLAMIC_MONTHS[i], "").trim(), 10);
      if (!isNaN(day)) return { type: "islamic", day, monthIndex: i };
    }
  }
  const parts = text.split(/\s+/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const monthIdx = GREG_MONTHS[parts[1]];
    if (!isNaN(day) && monthIdx !== undefined) return { type: "gregorian", day, monthIndex: monthIdx };
  }
  return null;
}

const islamicMonthLabels = [
  "Мухаррам", "Сафар", "Раби уль-Авваль", "Раби уль-Ахир",
  "Джумада уль-Уля", "Джумада уль-Ахира", "Раджаб", "Шаабан",
  "Рамадан", "Шавваль", "Зуль-Каада", "Зуль-Хиджа",
];

const gregMonthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const islamicMonthInfo: Record<number, string> = {
  0: "Священный месяц. День Ашура (10-е число) — день спасения пророка Мусы.",
  2: "Месяц рождения Пророка Мухаммада ﷺ (12-е число — Мавлид ан-Наби).",
  6: "Ночь Вознесения (Исра и Мирадж) — 27 раджаба.",
  7: "Ночь Бараат (15 шаабана) — ночь прощения и записи судеб.",
  8: "Священный месяц поста. Лейлат аль-Кадр (Ночь Могущества) — 27 рамадана.",
  9: "Праздник Ид аль-Фитр (1 шавваля) — праздник разговения.",
  11: "День Арафа (9-е) и Ид аль-Адха (10-е число) — праздник жертвоприношения.",
};

const NameCalendar = () => {
  const [selectedIslamicMonth, setSelectedIslamicMonth] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"islamic" | "gregorian">("islamic");
  const [selectedGregMonth, setSelectedGregMonth] = useState<number>(0);
  const allNames = getChildNames();

  const namesWithDays = useMemo(() => {
    return allNames
      .filter(n => n.nameDay)
      .map(n => ({ ...n, parsed: parseNameDay(n.nameDay!) }))
      .filter(n => n.parsed !== null);
  }, [allNames]);

  const islamicNames = useMemo(() => namesWithDays.filter(n => n.parsed!.type === "islamic"), [namesWithDays]);
  const gregorianNames = useMemo(() => namesWithDays.filter(n => n.parsed!.type === "gregorian"), [namesWithDays]);

  const currentNames = useMemo(() => {
    if (viewMode === "islamic") return islamicNames.filter(n => n.parsed!.monthIndex === selectedIslamicMonth);
    return gregorianNames.filter(n => n.parsed!.monthIndex === selectedGregMonth);
  }, [viewMode, selectedIslamicMonth, selectedGregMonth, islamicNames, gregorianNames]);

  const groupedByDay = useMemo(() => {
    const map = new Map<number, typeof currentNames>();
    for (const n of currentNames) {
      const day = n.parsed!.day;
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(n);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [currentNames]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <Moon className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Календарь именин</h1>
          <p className="mt-2 text-muted-foreground">Исламские и григорианские именины — выберите месяц</p>
        </div>

        {/* Переключатель */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setViewMode("islamic")}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              viewMode === "islamic" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            <Moon className="h-4 w-4" /> Исламский
          </button>
          <button
            onClick={() => setViewMode("gregorian")}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              viewMode === "gregorian" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            <BookOpen className="h-4 w-4" /> Григорианский
          </button>
        </div>

        {/* Месяцы */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {(viewMode === "islamic" ? islamicMonthLabels : gregMonthNames).map((label, i) => (
            <button
              key={i}
              onClick={() => viewMode === "islamic" ? setSelectedIslamicMonth(i) : setSelectedGregMonth(i)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                (viewMode === "islamic" ? selectedIslamicMonth : selectedGregMonth) === i
                  ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Инфо */}
        {viewMode === "islamic" && islamicMonthInfo[selectedIslamicMonth] && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm text-foreground font-medium">☪️ {islamicMonthInfo[selectedIslamicMonth]}</p>
          </div>
        )}

        {/* Статистика */}
        <div className="mb-6 flex justify-center gap-6 text-sm text-muted-foreground">
          <span>☪️ Мусульманских: <strong className="text-foreground">{islamicNames.length}</strong></span>
          <span>📅 Григорианских: <strong className="text-foreground">{gregorianNames.length}</strong></span>
          <span>📖 В этом месяце: <strong className="text-foreground">{currentNames.length}</strong></span>
        </div>

        {/* Результаты */}
        {groupedByDay.length > 0 ? (
          <div className="space-y-6">
            {groupedByDay.map(([day, names]) => (
              <div key={day}>
                <h2 className="mb-3 font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{day}</span>
                  {viewMode === "islamic" ? islamicMonthLabels[selectedIslamicMonth] : gregMonthNames[selectedGregMonth]}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {names.map(name => (
                    <div key={name.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-bold text-foreground">{name.name}</h3>
                            {name.popularity >= 90 && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              name.gender === "male" ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                                : name.gender === "female" ? "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400"
                                : "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                            )}>
                              {name.gender === "male" ? "♂" : name.gender === "female" ? "♀" : "⚥"}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{name.meaning}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Crown className="h-3 w-3" />{name.popularity}%
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{name.culture}</span>
                        {name.religion && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{name.religion}</span>
                        )}
                        {name.namedAfter?.map((ref, i) => (
                          <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">🕌 {ref}</span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{name.history}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-4xl">🌙</p>
            <p className="mt-2 text-muted-foreground">В этом месяце нет именин в базе</p>
            <p className="mt-1 text-xs text-muted-foreground">Попробуйте другой месяц</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameCalendar;
