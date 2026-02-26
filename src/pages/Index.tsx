import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Baby, PawPrint, Sparkles, ArrowRight, Heart, Wand2, Swords, CalendarDays } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-light via-background to-teal-light opacity-60" />
        <div className="container relative mx-auto px-4 py-20 text-center">
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
              Узнайте историю и происхождение каждого имени.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 mx-auto max-w-3xl">
              {[
                { to: "/children", icon: Baby, title: "Для детей", desc: "Мальчики и девочки", color: "primary", bgClass: "bg-coral-light", textClass: "text-primary" },
                { to: "/pets", icon: PawPrint, title: "Для питомцев", desc: "Собаки, кошки и другие", color: "accent", bgClass: "bg-teal-light", textClass: "text-accent" },
                { to: "/wizard", icon: Wand2, title: "Мастер ФИО", desc: "Подбор по гармонии", color: "lavender", bgClass: "bg-lavender-light", textClass: "text-lavender" },
                { to: "/battle", icon: Swords, title: "Битва имён", desc: "Турнир лучших имён", color: "rose", bgClass: "bg-rose-light", textClass: "text-rose" },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
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
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: "🌍", title: "Разные культуры", desc: "Русские, арабские, английские, башкирские, румынские и другие имена" },
              { icon: "📖", title: "Полная информация", desc: "Значение, происхождение, именины, известные люди с этим именем" },
              { icon: "🎯", title: "Умные фильтры", desc: "Фильтруйте по полу, культуре, религии и желаемым атрибутам" },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
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
