import { Link } from "react-router-dom";
import Header from "@/components/Header";
import IslamicWidget from "@/components/IslamicWidget";
import { Baby, PawPrint, Sparkles, ArrowRight, Heart, Wand2, Swords, CalendarDays, BookOpen, Crown, BookHeart, ScrollText, GitCompare, BarChart3, Star, Globe, Users, UserCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-light via-background to-teal-light opacity-60" />
        <div className="container relative mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-coral-light px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              Генератор имён
            </div>
            <h1 className="font-display text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Найдите <span className="text-primary">идеальное</span> имя
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
              Подберите имя для ребёнка или питомца с учётом культуры, значения и характера.
            </p>
          </div>
        </div>
      </section>

      {/* Islamic Widget — Hijri date + Ayah of the day */}
      <IslamicWidget />

      {/* Name of the Day — personalized if active profile exists */}
      {(personalName || nameOfDay) && (
        <section className="border-t border-border bg-gradient-to-r from-primary/5 via-card to-accent/5 py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-card p-6 text-center shadow-sm">
              {personalName && activePerson ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
                    <UserCircle2 className="h-3.5 w-3.5" /> Имя для {activePerson.fullName}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground">{personalName.name}</h2>
                  <p className="mt-1 text-muted-foreground">{personalName.meaning}</p>
                  <div className="mt-3 flex justify-center gap-2 flex-wrap">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{personalName.origin}</span>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {personalName.gender === "male" ? "♂ Мужское" : "♀ Женское"}
                    </span>
                    {personalName.attributes.slice(0, 3).map((a) => (
                      <span key={a} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{a}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link
                      to={`/tafsir?name=${encodeURIComponent(personalName.name)}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      Подробный тафсир <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link to="/people/profiles" className="text-sm text-muted-foreground hover:text-foreground">
                      сменить профиль
                    </Link>
                  </div>
                </>
              ) : nameOfDay ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold mb-3">
                    <Star className="h-3.5 w-3.5 fill-gold" /> Имя дня
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground">{nameOfDay.name}</h2>
                  <p className="mt-1 text-muted-foreground">{nameOfDay.meaning}</p>
                  <div className="mt-3 flex justify-center gap-2 flex-wrap">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{nameOfDay.origin}</span>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{nameOfDay.gender === "male" ? "♂ Мужское" : "♀ Женское"}</span>
                    {nameOfDay.attributes.slice(0, 3).map(a => (
                      <span key={a} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{a}</span>
                    ))}
                  </div>
                  <Link to="/tafsir" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Подробный тафсир <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Main features */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mx-auto max-w-5xl">
            {[
              { to: "/children", icon: Baby, title: "Для детей", desc: "Мальчики и девочки", bgClass: "bg-coral-light", textClass: "text-primary" },
              { to: "/people", icon: Users, title: "Для людей", desc: "Взрослые, новообращённые, персонажи", bgClass: "bg-primary/10", textClass: "text-primary" },
              { to: "/pets", icon: PawPrint, title: "Для питомцев", desc: "Собаки, кошки и другие", bgClass: "bg-teal-light", textClass: "text-accent" },
              { to: "/wizard", icon: Wand2, title: "Мастер ФИО", desc: "Насаб, кунья, нисба", bgClass: "bg-lavender-light", textClass: "text-lavender" },
              { to: "/battle", icon: Swords, title: "Битва имён", desc: "Турнир лучших имён", bgClass: "bg-rose-light", textClass: "text-rose" },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bgClass} transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-6 w-6 ${item.textClass}`} />
                </div>
                <div className="text-center">
                  <h2 className="font-display text-lg font-bold text-foreground">{item.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className={`flex items-center gap-1 text-sm font-semibold ${item.textClass}`}>
                  Перейти <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Islamic features */}
      <section className="border-t border-border bg-card/50 py-10">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-6">☪️ Исламские инструменты</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mx-auto max-w-4xl">
            {[
              { to: "/tafsir", icon: BookOpen, title: "Тафсир имени", desc: "Коранические корни и хадисы" },
              { to: "/prophets", icon: Crown, title: "Пророки и сахабы", desc: "Справочник имён пророков" },
              { to: "/dua", icon: BookHeart, title: "Дуа для ребёнка", desc: "Молитвы при рождении" },
              { to: "/naming-guide", icon: ScrollText, title: "Этикет имянаречения", desc: "Сунна и правила" },
              { to: "/calendar", icon: CalendarDays, title: "Календарь именин", desc: "Именины по хиджре" },
              { to: "/compare", icon: GitCompare, title: "Сравнение имён", desc: "Radar-chart анализ" },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30">
                <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics + tools */}
      <section className="border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-3 mx-auto max-w-3xl">
            {[
              { icon: "📊", title: "Статистика", desc: "Графики и аналитика по всей базе имён", to: "/stats" },
              { icon: "🔢", title: "Нумерология", desc: "Абджад и число судьбы имени", to: "/numerology" },
              { icon: "🧬", title: "ДНК имени", desc: "Генетический код и визуализация", to: "/dna" },
              { icon: "🌍", title: "Аналитика имени", desc: "Пол, возраст и география по мировым данным", to: "/analytics" },
            ].map((f) => (
              <Link key={f.to} to={f.to} className="text-center group hover:opacity-80 transition-opacity">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
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
