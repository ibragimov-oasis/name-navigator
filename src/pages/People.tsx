import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Users, UserCheck, Sparkles, Mic2, Crown, ArrowRight, Heart, IdCard, HeartHandshake } from "lucide-react";

const sections = [
  {
    to: "/people/profiles",
    icon: IdCard,
    title: "Мои профили",
    desc: "Сохраните себя и близких — все инструменты будут работать персонально",
    bg: "bg-rose-light",
    fg: "text-rose",
  },
  {
    to: "/people/adult",
    icon: UserCheck,
    title: "Имя для взрослого",
    desc: "Подбор имени для себя или близкого: смена имени, ребрендинг, осознанный выбор",
    bg: "bg-coral-light",
    fg: "text-primary",
  },
  {
    to: "/people/revert",
    icon: Sparkles,
    title: "Имя для новообращённого",
    desc: "Мусульманское имя при принятии шахады — с тафсиром, дуа и инструкцией",
    bg: "bg-primary/10",
    fg: "text-primary",
  },
  {
    to: "/people/character",
    icon: Users,
    title: "Имя для персонажа",
    desc: "Для писателей, RPG и сценаристов: культура, эпоха, архетип → имя + биография",
    bg: "bg-lavender-light",
    fg: "text-lavender",
  },
  {
    to: "/people/pseudonym",
    icon: Mic2,
    title: "Псевдоним / стейдж-нейм",
    desc: "Короткое, звучное и запоминающееся имя для творчества и бренда",
    bg: "bg-teal-light",
    fg: "text-accent",
  },
  {
    to: "/people/historical",
    icon: Crown,
    title: "Исторические личности",
    desc: "Пророки, сахабы, учёные, поэты, правители — реальные люди и их имена",
    bg: "bg-gold/10",
    fg: "text-gold",
  },
  {
    to: "/people/compatibility",
    icon: HeartHandshake,
    title: "Совместимость двух людей",
    desc: "Звучание, нумерология, культура и жизненный путь — одна карточка для пары",
    bg: "bg-rose-light",
    fg: "text-rose",
  },
];

const People = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Имена для людей — взрослых, новообращённых, персонажей | Имяген"
        description="Подбор имени для взрослого, мусульманское имя для новообращённого, имя для персонажа книги, псевдоним и совместимость двух людей."
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-light">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-black text-foreground">
            Имена для людей
          </h1>
          <p className="mt-3 text-muted-foreground">
            Не только для младенцев. Подберите имя для взрослого, новообращённого, персонажа книги
            или творческий псевдоним — с глубоким смыслом и культурным контекстом.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.bg} transition-transform group-hover:scale-110`}
              >
                <s.icon className={`h-5 w-5 ${s.fg}`} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">{s.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground leading-snug">{s.desc}</p>
              </div>
              <span
                className={`mt-auto inline-flex items-center gap-1 text-sm font-semibold ${s.fg}`}
              >
                Открыть <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          Сделано с <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> для всех, кто ищет своё имя
        </footer>
      </main>
    </div>
  );
};

export default People;
