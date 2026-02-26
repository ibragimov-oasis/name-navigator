import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Calendar } from "@/components/ui/calendar";
import { getChildNames } from "@/lib/namesStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Gift, Star, Crown } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Маппинг месяц-день → именины
const MONTH_NAMES: Record<string, number> = {
  "января": 1, "февраля": 2, "марта": 3, "апреля": 4,
  "мая": 5, "июня": 6, "июля": 7, "августа": 8,
  "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12,
};

function parseNameDay(nameDay: string): { day: number; month: number } | null {
  const parts = nameDay.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const day = parseInt(parts[0], 10);
  const month = MONTH_NAMES[parts[1].toLowerCase()];
  if (isNaN(day) || !month) return null;
  return { day, month };
}

const NameCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const allNames = getChildNames();

  const namesWithDays = useMemo(() => {
    return allNames
      .filter(n => n.nameDay)
      .map(n => ({ ...n, parsed: parseNameDay(n.nameDay!) }))
      .filter(n => n.parsed !== null);
  }, [allNames]);

  const matchingNames = useMemo(() => {
    if (!date) return [];
    const d = date.getDate();
    const m = date.getMonth() + 1;
    return namesWithDays.filter(n => n.parsed!.day === d && n.parsed!.month === m);
  }, [date, namesWithDays]);

  // All dates that have name days
  const nameDayDates = useMemo(() => {
    const year = date?.getFullYear() || new Date().getFullYear();
    return namesWithDays
      .map(n => new Date(year, n.parsed!.month - 1, n.parsed!.day))
      .filter(d => !isNaN(d.getTime()));
  }, [namesWithDays, date]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <Gift className="mx-auto h-10 w-10 text-lavender" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Календарь именин</h1>
          <p className="mt-2 text-muted-foreground">Выберите дату рождения — узнайте, чьи именины в этот день</p>
        </div>

        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          {/* Calendar */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className={cn("p-3 pointer-events-auto")}
              modifiers={{
                nameDay: nameDayDates,
              }}
              modifiersClassNames={{
                nameDay: "bg-lavender-light text-lavender font-bold",
              }}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-lavender mr-1" />
              Дни с именинами отмечены
            </p>
          </div>

          {/* Results */}
          <div className="flex-1 w-full">
            {date && (
              <div className="animate-fade-in">
                <h2 className="font-display text-xl font-bold text-foreground">
                  <CalendarIcon className="mr-2 inline h-5 w-5 text-lavender" />
                  {format(date, "d MMMM", { locale: ru })}
                </h2>

                {matchingNames.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {matchingNames.map(name => (
                      <div key={name.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display text-lg font-bold text-foreground">{name.name}</h3>
                              {name.popularity >= 90 && <Star className="h-4 w-4 fill-gold text-gold" />}
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                name.gender === "male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
                              }`}>
                                {name.gender === "male" ? "♂" : "♀"}
                              </span>
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">{name.meaning}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Crown className="h-3 w-3" />{name.popularity}%
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="rounded-full bg-coral-light px-2 py-0.5 text-xs font-medium text-primary">{name.culture}</span>
                          {name.religion && (
                            <span className="rounded-full bg-lavender-light px-2 py-0.5 text-xs font-medium text-lavender">{name.religion}</span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{name.history}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 text-center">
                    <p className="text-4xl">📅</p>
                    <p className="mt-2 text-muted-foreground">В этот день нет именин в базе</p>
                    <p className="mt-1 text-xs text-muted-foreground">Попробуйте другую дату или добавьте имена через импорт</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameCalendar;
