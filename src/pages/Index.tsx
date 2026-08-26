import { Link } from "react-router-dom";
import Header from "@/components/Header";
import IslamicWidget from "@/components/IslamicWidget";
import { Baby, PawPrint, Sparkles, ArrowRight, Heart, Wand2, Swords, CalendarDays, BookOpen, Crown, BookHeart, ScrollText, GitCompare, BarChart3, Star, Globe, Users, UserCircle2, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { getChildNames } from "@/lib/namesStore";
import { usePeople } from "@/lib/people";

function getNameOfDay() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const names = getChildNames().filter(n => n.religion === "Мусульманское" || n.culture === "Арабская");
  if (names.length === 0) return null;
  const idx = Math.abs(hash) % names.length;
  return names[idx];
}

function getPersonalNameOfDay(activeName: string, activeGender: "male" | "female") {
  const today = new Date();
  const seed = `${activeName}-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const pool = getChildNames().filter(
    (n) =>
      n.gender === activeGender &&
      (n.religion === "Мусульманское" || n.culture === "Арабская"),
  );
  if (pool.length === 0) return null;
  return pool[Math.abs(hash) % pool.length];
}

const Index = () => {
  const { activePerson } = usePeople();
  const nameOfDay = useMemo(() => getNameOfDay(), []);
  const personalName = useMemo(
    () =>
      activePerson
        ? getPersonalNameOfDay(activePerson.fullName, activePerson.gender)
        : null,
    [activePerson]
  );

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-12">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-light via-background to-teal-light opacity-60" />
        <div className="container relative mx-auto px-4 py-8 sm:py-16 text-center">
          <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-coral-light px-3.5 py-1 text-xs sm:text-sm font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Генератор имён & культур
            </div>
            <h1 className="font-display text-3xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Найдите <span className="text-primary">идеальное</span> имя
            </h1>
            <p className="mx-auto max-w-lg text-xs sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              Подберите имя для ребёнка или питомца с учётом культуры, значения и характера.
            </p>
          </div>
        </div>
      </section>

      {/* Islamic Widget — Hijri date + Ayah of the day */}
      <IslamicWidget />

      {/* Name of the Day — personalized if active profile exists */}
      {(personalName || nameOfDay) && (
        <section className="border-t border-border bg-gradient-to-r from-primary/5 via-card to-accent/5 py-6 sm:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-card p-4 sm:p-6 text-center shadow-sm">
              {personalName && activePerson ? (
                <>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mb-2">
                    <UserCircle2 className="h-3.5 w-3.5" /> Имя для {activePerson.fullName}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{personalName.name}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{personalName.meaning}</p>
                  <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{personalName.origin}</span>
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {personalName.gender === "male" ? "♂ Мужское" : "♀ Женское"}
                    </span>
                    {personalName.attributes.slice(0, 3).map((a) => (
                      <span key={a} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{a}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link
                      to={`/tafsir?name=${encodeURIComponent(personalName.name)}`}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline"
                    >
                      Подробный тафсир <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link to="/people/profiles" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                      сменить профиль
                    </Link>
                  </div>
                </>
              ) : nameOfDay ? (
                <>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold text-gold mb-2">
                    <Star className="h-3.5 w-3.5 fill-gold" /> Имя дня
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{nameOfDay.name}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{nameOfDay.meaning}</p>
                  <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{nameOfDay.origin}</span>
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{nameOfDay.gender === "male" ? "♂ Мужское" : "♀ Женское"}</span>
                    {nameOfDay.attributes.slice(0, 3).map(a => (
                      <span key={a} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{a}</span>
                    ))}
                  </div>
                  <Link to="/tafsir" className="mt-3 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline">
                    Подробный тафсир <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Main features */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mx-auto max-w-6xl">
            {[
              { to: "/tajik-names", icon: ShieldCheck, title: "Реестр РТ", desc: "3,461 разрешённое имя Таджикистана", bgClass: "bg-emerald-500/15", textClass: "text-emerald-600 dark:text-emerald-400" },
              { to: "/children", icon: Baby, title: "Для детей", desc: "Мальчики и девочки", bgClass: "bg-coral-light", textClass: "text-primary" },
              { to: "/people", icon: Users, title: "Для людей", desc: "Взрослые, новообращённые", bgClass: "bg-primary/10", textClass: "text-primary" },
              { to: "/pets", icon: PawPrint, title: "Для питомцев", desc: "Собаки, кошки и другие", bgClass: "bg-teal-light", textClass: "text-accent" },
              { to: "/wizard", icon: Wand2, title: "Мастер ФИО", desc: "Насаб, кунья, нисба", bgClass: "bg-lavender-light", textClass: "text-lavender" },
              { to: "/style-quiz", icon: Sparkles, title: "Стиль-тест", desc: "Найди свой стиль за 10 вопросов", bgClass: "bg-gold/15", textClass: "text-gold" },
              { to: "/battle", icon: Swords, title: "Битва имён", desc: "Турнир лучших имён", bgClass: "bg-rose-light", textClass: "text-rose" },
              { to: "/couple", icon: Users, title: "Вдвоём", desc: "Свайп имён для пары", bgClass: "bg-coral-light", textClass: "text-primary" },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="group flex flex-col items-center gap-2 sm:gap-3 rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]">
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${item.bgClass} transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.textClass}`} />
                </div>
                <div className="text-center min-w-0">
                  <h2 className="font-display text-sm sm:text-base font-bold text-foreground truncate">{item.title}</h2>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${item.textClass} mt-auto`}>
                  Перейти <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Islamic features */}
      <section className="border-t border-border bg-card/50 py-6 sm:py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground text-center mb-4 sm:mb-6">☪️ Исламские инструменты</h2>
          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
            {[
              { to: "/tafsir", icon: BookOpen, title: "Тафсир имени", desc: "Коранические корни и хадисы" },
              { to: "/prophets", icon: Crown, title: "Пророки и сахабы", desc: "Справочник имён пророков" },
              { to: "/dua", icon: BookHeart, title: "Дуа для ребёнка", desc: "Молитвы при рождении" },
              { to: "/naming-guide", icon: ScrollText, title: "Этикет имянаречения", desc: "Сунна и правила" },
              { to: "/calendar", icon: CalendarDays, title: "Календарь именин", desc: "Именины по хиджре" },
              { to: "/compare", icon: GitCompare, title: "Сравнение имён", desc: "Radar-chart анализ" },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 sm:p-4 transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.99]">
                <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-display text-xs sm:text-sm font-bold text-foreground truncate">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{item.desc}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics + tools */}
      <section className="border-t border-border py-6 sm:py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mx-auto max-w-3xl">
            {[
              { icon: "📊", title: "Статистика", desc: "Графики по всей базе имён", to: "/stats" },
              { icon: "🔢", title: "Нумерология", desc: "Абджад и число судьбы", to: "/numerology" },
              { icon: "🧬", title: "ДНК имени", desc: "Генетический код имени", to: "/dna" },
              { icon: "🌍", title: "Аналитика", desc: "Мировые данные и тренды", to: "/analytics" },
            ].map((f) => (
              <Link key={f.to} to={f.to} className="text-center group p-3 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-sm transition-all">
                <span className="text-2xl sm:text-3xl">{f.icon}</span>
                <h3 className="mt-1.5 font-display text-xs sm:text-sm font-bold text-foreground">{f.title}</h3>
                <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto flex items-center justify-center gap-1 px-4 text-sm text-muted-foreground">
          Сделано с <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> ИмяГен
        </div>
      </footer>
    </div>
  );
};

export default Index;
