import Header from "@/components/Header";
import { BookOpen, CheckCircle, XCircle, Info, Calendar } from "lucide-react";

const sections = [
  {
    title: "Когда давать имя",
    icon: Calendar,
    content: [
      { type: "sunnah" as const, text: "По Сунне рекомендуется дать имя ребёнку на 7-й день после рождения" },
      { type: "sunnah" as const, text: "Допускается давать имя в день рождения — Пророк ﷺ назвал своего сына Ибрахимом в день его рождения" },
      { type: "info" as const, text: "На 7-й день также совершается Акика (жертвоприношение) и бритьё головы новорождённого" },
    ],
  },
  {
    title: "Обряд Акика",
    icon: Info,
    content: [
      { type: "sunnah" as const, text: "За мальчика режут двух баранов, за девочку — одного" },
      { type: "sunnah" as const, text: "Мясо раздают бедным, угощают родственников и соседей" },
      { type: "sunnah" as const, text: "Бреют голову новорождённого и раздают серебро (или деньги) по весу волос в качестве садаки" },
      { type: "info" as const, text: "Акика совершается на 7-й день, если нет возможности — на 14-й или 21-й день" },
    ],
  },
  {
    title: "Рекомендуемые имена",
    icon: CheckCircle,
    content: [
      { type: "recommended" as const, text: "Абдуллах и Абдуррахман — «Самые любимые имена перед Аллахом» (Муслим)" },
      { type: "recommended" as const, text: "Имена пророков: Мухаммад, Ибрахим, Муса, Иса, Юсуф, Нух и др." },
      { type: "recommended" as const, text: "Имена, начинающиеся на «Абд» + одно из имён Аллаха: Абдуль-Карим, Абдуль-Малик и др." },
      { type: "recommended" as const, text: "Имена сахабов и праведных жён Пророка ﷺ: Умар, Али, Хадиджа, Аиша, Фатима" },
      { type: "info" as const, text: "Хорошим считается имя с красивым значением: Салих (праведный), Нур (свет), Амина (верная)" },
    ],
  },
  {
    title: "Запрещённые и нежелательные имена",
    icon: XCircle,
    content: [
      { type: "forbidden" as const, text: "Запрещено (харам): имена, содержащие «Абд» + не имя Аллаха (например, Абдун-Наби — «раб Пророка»)" },
      { type: "forbidden" as const, text: "Запрещено: имена, принадлежащие только Аллаху — Аль-Халик (Творец), Ар-Раззак (Дающий пропитание) и т.п." },
      { type: "makruh" as const, text: "Нежелательно (макрух): имена с дурным значением или вызывающие насмешку" },
      { type: "makruh" as const, text: "Нежелательно: имена ангелов (Джибриль, Микаиль) — учёные расходятся во мнении" },
      { type: "makruh" as const, text: "Нежелательно: имена, которые могут ассоциироваться с нескромностью или гордыней" },
    ],
  },
  {
    title: "Структура полного мусульманского имени",
    icon: BookOpen,
    content: [
      { type: "info" as const, text: "Кунья (كنية) — почётное обращение: Абу (отец) / Умм (мать) + имя старшего ребёнка. Пример: Абу Бакр" },
      { type: "info" as const, text: "Исм (اسم) — личное имя, данное при рождении. Пример: Мухаммад" },
      { type: "info" as const, text: "Насаб (نسب) — цепочка отцов: ибн (сын) / бинт (дочь). Пример: ибн Ахмад ибн Али" },
      { type: "info" as const, text: "Нисба (نسبة) — указывает на происхождение, племя или город. Пример: аль-Бухари, ат-Татари" },
      { type: "info" as const, text: "Лакаб (لقب) — прозвище или титул. Пример: аль-Фарук (Различающий), ас-Сиддик (Правдивейший)" },
    ],
  },
  {
    title: "Сунна при рождении ребёнка",
    icon: Info,
    content: [
      { type: "sunnah" as const, text: "Произнести азан в правое ухо новорождённого и икамат в левое" },
      { type: "sunnah" as const, text: "Тахник — размягчить финик и протереть им нёбо ребёнка" },
      { type: "sunnah" as const, text: "Обрадовать родителей и поздравить их" },
      { type: "sunnah" as const, text: "Дать хорошее имя на 7-й день" },
      { type: "sunnah" as const, text: "Побрить голову и раздать садаку по весу волос" },
      { type: "sunnah" as const, text: "Совершить Акику" },
      { type: "sunnah" as const, text: "Обрезание (для мальчиков)" },
    ],
  },
];

const typeStyles = {
  sunnah: "border-l-primary bg-primary/5",
  recommended: "border-l-accent bg-accent/5",
  forbidden: "border-l-destructive bg-destructive/5",
  makruh: "border-l-gold bg-gold/5",
  info: "border-l-muted-foreground bg-secondary/50",
};

const typeLabels = {
  sunnah: "☪️ Сунна",
  recommended: "✅ Рекомендовано",
  forbidden: "❌ Запрещено",
  makruh: "⚠️ Нежелательно",
  info: "ℹ️ Информация",
};

const NamingGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Этикет имянаречения</h1>
          <p className="mt-2 text-muted-foreground">Полный гайд по исламским традициям именования</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-4">
                <section.icon className="h-5 w-5 text-primary" />
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.content.map((item, i) => (
                  <div key={i} className={`rounded-lg border-l-4 p-3 ${typeStyles[item.type]}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{typeLabels[item.type]}</span>
                    <p className="mt-1 text-sm text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NamingGuide;
