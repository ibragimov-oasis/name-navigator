import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getChildNames } from "@/lib/namesStore";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Heart,
  BookHeart,
  ScrollText,
  Star,
  Volume2,
  CheckCircle2,
  UserPlus,
  Copy,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { transliterateToArabic } from "@/lib/arabicTranslit";
import { speakName } from "@/lib/tts";
import { usePeople, RevertChecklist } from "@/lib/people";
import { toast } from "sonner";

type Step = "intro" | "gender" | "meaning" | "results";

const MEANINGS = [
  { key: "light", label: "Свет / нур", attrs: ["светлый", "светлая", "свет"] },
  { key: "faith", label: "Вера / иман", attrs: ["верующий", "праведный", "благочестивый"] },
  { key: "thanks", label: "Благодарность", attrs: ["благодарный", "восхваляемый"] },
  { key: "path", label: "Путь / руководство", attrs: ["мудрый", "ведущий", "наставник"] },
  { key: "mercy", label: "Милость / рахма", attrs: ["добрый", "милостивый", "нежная"] },
  { key: "strength", label: "Сила / стойкость", attrs: ["сильный", "стойкий", "храбрый"] },
];

const RevertName = () => {
  const navigate = useNavigate();
  const { addPerson, setActivePersonId, activePerson, updatePerson } = usePeople();
  const [step, setStep] = useState<Step>("intro");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [meaning, setMeaning] = useState<string[]>([]);
  const [previousName, setPreviousName] = useState<string>("");
  const [checklist, setChecklist] = useState<RevertChecklist>(
    activePerson?.revertChecklist ?? {}
  );

  const recommendations = useMemo(() => {
    if (step !== "results") return [];
    const all = getChildNames().filter(
      (n) => n.religion === "Мусульманское" && n.gender === gender,
    );
    const wantedAttrs = new Set(
      MEANINGS.filter((m) => meaning.includes(m.key)).flatMap((m) => m.attrs.map((a) => a.toLowerCase())),
    );
    const scored = all
      .map((n) => {
        const lowAttrs = n.attributes.map((a) => a.toLowerCase());
        const meaningHit = wantedAttrs.size === 0
          ? 0
          : lowAttrs.filter((a) =>
              [...wantedAttrs].some((w) => a.includes(w) || w.includes(a)),
            ).length;
        const meaningTextHit = wantedAttrs.size > 0 && [...wantedAttrs].some((w) =>
          n.meaning.toLowerCase().includes(w),
        ) ? 2 : 0;
        return { n, score: meaningHit * 3 + meaningTextHit + n.popularity / 100 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.n);
    return scored;
  }, [step, gender, meaning]);

  const toggleMeaning = (k: string) =>
    setMeaning((arr) => (arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]));

  const adoptName = (name: string) => {
    const stamp = new Date().toISOString().slice(0, 10);
    const created = addPerson({
      fullName: name,
      gender,
      relation: "self",
      nameHistory: previousName.trim()
        ? [{ name: previousName.trim(), reason: "имя до принятия ислама", date: stamp }]
        : [],
      tags: ["новообращённый"],
      meaningPersonal: "Имя, выбранное при принятии шахады",
      revertChecklist: { ...checklist, nameChosen: true },
    });
    setActivePersonId(created.id);
    toast.success(`«${name}» сохранено как ваш активный профиль`);
    navigate("/people/profiles");
  };

  const updateCheck = (key: keyof RevertChecklist, value: boolean) => {
    const next = { ...checklist, [key]: value };
    setChecklist(next);
    if (activePerson) {
      updatePerson(activePerson.id, { revertChecklist: next });
    }
  };

  const copyArabic = (txt: string) => {
    navigator.clipboard?.writeText(txt).then(() => toast.success("Скопировано"));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs
        items={[
          { to: "/people", label: "Для людей" },
          { label: "Новообращённый" },
        ]}
      />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Имя для новообращённого
          </h1>
          <p className="mt-2 text-muted-foreground">
            Подбор мусульманского имени при принятии шахады
          </p>
        </div>

        {step === "intro" && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-xl font-bold text-foreground">
              Ассаламу алейкум, и поздравляем 🤍
            </h2>
            <p className="text-sm text-foreground leading-relaxed">
              Принятие ислама — большой шаг. Смена имени <strong>не обязательна</strong>, если оно
              имеет хорошее значение и не противоречит шариату. Но многие выбирают новое
              мусульманское имя как символ нового начала.
            </p>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-foreground">
              <p className="font-semibold mb-1">📜 Слова Пророка ﷺ:</p>
              <p className="italic">
                «Поистине, в Судный день вас будут призывать по вашим именам и именам ваших отцов,
                поэтому давайте себе хорошие имена.»
              </p>
              <p className="text-xs text-muted-foreground mt-1">— Абу Дауд</p>
            </div>
            <div className="rounded-xl bg-gold/5 border border-gold/20 p-4 text-sm text-foreground">
              <p className="font-semibold mb-1">📚 Имена, которые менял Пророк ﷺ:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Асия («ослушница») → Джамиля («красивая»)</li>
                <li>Зайнаб была сначала Барра («благочестивая») — изменено, чтобы избежать самовосхваления</li>
                <li>Харб («война») → Сильм («мир»)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Менялись имена с плохим смыслом. Нейтральные и красивые имена сохранялись.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ваше имя до ислама (необязательно)
              </label>
              <input
                type="text"
                value={previousName}
                onChange={(e) => setPreviousName(e.target.value)}
                placeholder="Например, Александр"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Сохранится в истории имени вашего профиля.
              </p>
            </div>
            <button
              onClick={() => setStep("gender")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Начать <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === "gender" && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-xl font-bold text-foreground">
              Шаг 1. Кто принимает имя?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g);
                    setStep("meaning");
                  }}
                  className={`rounded-xl border-2 p-6 text-center transition-all hover:border-primary ${
                    gender === g ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="text-3xl mb-2">{g === "male" ? "👤" : "🧕"}</div>
                  <p className="font-semibold text-foreground">
                    {g === "male" ? "Мужчина" : "Женщина"}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("intro")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Назад
            </button>
          </div>
        )}

        {step === "meaning" && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-xl font-bold text-foreground">
              Шаг 2. Какой смысл вам близок?
            </h2>
            <p className="text-sm text-muted-foreground">Выберите 1-3 направления.</p>
            <div className="grid grid-cols-2 gap-2">
              {MEANINGS.map((m) => {
                const active = meaning.includes(m.key);
                return (
                  <button
                    key={m.key}
                    onClick={() => toggleMeaning(m.key)}
                    className={`rounded-xl border-2 p-3 text-sm font-medium text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:border-primary/30"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("gender")}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" /> Назад
              </button>
              <button
                onClick={() => setStep("results")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Подобрать имена <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold text-gold" /> Ваши 5 имён
              </h2>
              <p className="text-sm text-muted-foreground">
                {gender === "male" ? "Мужские" : "Женские"} мусульманские имена с арабским
                написанием и произношением.
              </p>
            </div>

            {recommendations.map((n, idx) => {
              const arabic = transliterateToArabic(n.name);
              return (
                <div
                  key={n.id}
                  className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                        <h3 className="font-display text-xl font-bold text-foreground">{n.name}</h3>
                        <span
                          className="text-xl text-primary"
                          style={{ fontFamily: '"Noto Naskh Arabic", serif', direction: "rtl" }}
                        >
                          {arabic}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{n.meaning}</p>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{n.history}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {n.attributes.slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => speakName(n.name, "ru-RU")}
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/70"
                    >
                      <Volume2 className="h-3 w-3" /> RU
                    </button>
                    <button
                      onClick={() => speakName(arabic, "ar-SA")}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      <Volume2 className="h-3 w-3" /> AR
                    </button>
                    <button
                      onClick={() => copyArabic(arabic)}
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/70"
                    >
                      <Copy className="h-3 w-3" /> Арабский
                    </button>
                    <button
                      onClick={() => adoptName(n.name)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 ml-auto"
                    >
                      <UserPlus className="h-3 w-3" /> Сделать моим именем
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gold" /> Чек-лист шахады
              </h3>
              <p className="text-xs text-muted-foreground">
                Отмечайте по мере прохождения. Сохраняется в активном профиле.
              </p>
              {(
                [
                  ["nameChosen", "Имя выбрано"],
                  ["shahadaSpoken", "Шахада произнесена"],
                  ["ghuslDone", "Гусль (полное омовение) сделан"],
                  ["imamConfirmed", "Имам подтвердил"],
                ] as [keyof RevertChecklist, string][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-card transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!checklist[key]}
                    onChange={(e) => updateCheck(key, e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-gold"
                  />
                  <span
                    className={`text-sm ${
                      checklist[key] ? "text-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </label>
              ))}
              {!activePerson && (
                <p className="text-xs text-muted-foreground italic">
                  💡 Чтобы чек-лист сохранился — нажмите «Сделать моим именем» на одном из имён выше.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <BookHeart className="h-5 w-5 text-primary" /> Дуа при принятии имени
              </h3>
              <p
                className="text-2xl leading-loose text-center text-foreground"
                style={{ fontFamily: '"Noto Naskh Arabic", serif', direction: "rtl" }}
              >
                اللَّهُمَّ اجْعَلْ هَذَا الِاسْمَ مُبَارَكًا لِي فِي الدُّنْيَا وَالْآخِرَةِ
              </p>
              <p className="text-sm text-foreground italic text-center">
                «О Аллах, сделай это имя благословенным для меня в этом мире и в Последующем.»
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" /> Что делать дальше
              </h3>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Сделайте полное омовение (гусль) — это сунна для нового мусульманина.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>Произнесите шахаду перед двумя свидетелями-мусульманами в мечети.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>Юридическая смена имени по паспорту — по желанию, не обязательна для ислама.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span>Используйте новое имя в кругу мусульман и в дуа. Прежнее имя сохраняется в насабе.</span>
                </li>
              </ol>
              <Link
                to="/naming-guide"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Подробный этикет имянаречения <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep("intro");
                  setMeaning([]);
                }}
                className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Начать заново
              </button>
              <Link
                to="/favorites"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose/90"
              >
                <Heart className="h-4 w-4" /> Сохранить
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RevertName;
