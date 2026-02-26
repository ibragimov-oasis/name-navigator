import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getChildNames } from "@/lib/namesStore";
import { calculateHarmony, generatePatronymic, HarmonyResult } from "@/lib/nameHarmony";
import { ChildName } from "@/data/childNames";
import { Wand2, ArrowRight, ArrowLeft, Sparkles, Star, Volume2, Heart } from "lucide-react";

type Step = "info" | "preferences" | "results";

const NameWizard = () => {
  const [step, setStep] = useState<Step>("info");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedCultures, setSelectedCultures] = useState<string[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const allNames = getChildNames();
  const cultures = [...new Set(allNames.map(n => n.culture))];
  const attrs = [...new Set(allNames.flatMap(n => n.attributes))];

  const results = useMemo(() => {
    let filtered = allNames.filter(n => n.gender === gender || n.gender === "unisex");
    if (selectedCultures.length > 0) {
      filtered = filtered.filter(n => selectedCultures.includes(n.culture));
    }
    if (selectedAttrs.length > 0) {
      filtered = filtered.filter(n => n.attributes.some(a => selectedAttrs.includes(a)));
    }

    return filtered.map(name => ({
      name,
      harmony: calculateHarmony(name.name, fatherName, surname, gender),
    })).sort((a, b) => b.harmony.total - a.harmony.total);
  }, [allNames, gender, selectedCultures, selectedAttrs, fatherName, surname]);

  const toggleCulture = (c: string) => {
    setSelectedCultures(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };
  const toggleAttr = (a: string) => {
    setSelectedAttrs(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };
  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {(["info", "preferences", "results"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step === s ? "bg-primary text-primary-foreground" :
                (["info", "preferences", "results"].indexOf(step) > i) ? "bg-accent text-accent-foreground" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className="h-0.5 w-8 bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Family info */}
        {step === "info" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <Wand2 className="mx-auto h-10 w-10 text-primary" />
              <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Мастер подбора</h1>
              <p className="mt-2 text-muted-foreground">Введите данные семьи — мы найдём идеально звучащее имя</p>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <div>
                <label className="text-sm font-semibold text-foreground">Фамилия</label>
                <Input value={surname} onChange={e => setSurname(e.target.value)} placeholder="Иванов" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Имя отца</label>
                <Input value={fatherName} onChange={e => setFatherName(e.target.value)} placeholder="Для отчества" className="mt-1" />
                {fatherName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Отчество: <span className="font-medium text-foreground">{generatePatronymic(fatherName, gender)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Имя матери <span className="text-muted-foreground font-normal">(опционально)</span></label>
                <Input value={motherName} onChange={e => setMotherName(e.target.value)} placeholder="Для подбора созвучных" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Пол ребёнка</label>
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => setGender("male")}
                    className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                      gender === "male" ? "border-primary bg-coral-light text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    ♂ Мальчик
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                      gender === "female" ? "border-rose bg-rose-light text-rose" : "border-border text-muted-foreground hover:border-rose/30"
                    }`}
                  >
                    ♀ Девочка
                  </button>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep("preferences")} className="w-full" size="lg">
              Далее <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === "preferences" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-10 w-10 text-accent" />
              <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Предпочтения</h1>
              <p className="mt-2 text-muted-foreground">Выберите культуру и желаемые качества</p>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <div>
                <label className="text-sm font-semibold text-foreground">Культура</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cultures.map(c => (
                    <button key={c} onClick={() => toggleCulture(c)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        selectedCultures.includes(c) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Качества имени</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {attrs.map(a => (
                    <button key={a} onClick={() => toggleAttr(a)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        selectedAttrs.includes(a) ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent/10"
                      }`}
                    >{a}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
              </Button>
              <Button onClick={() => setStep("results")} className="flex-1">
                Подобрать <Wand2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "results" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center">
              <Star className="mx-auto h-10 w-10 text-gold" />
              <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Результаты</h1>
              <p className="mt-2 text-muted-foreground">
                Найдено {results.length} имён, отсортированных по гармонии ФИО
              </p>
            </div>

            <Button variant="outline" onClick={() => setStep("preferences")} size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Изменить фильтры
            </Button>

            <div className="space-y-3">
              {results.slice(0, 20).map(({ name, harmony }, i) => (
                <div key={name.id}
                  className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                          {i + 1}
                        </span>
                        <h3 className="font-display text-xl font-bold text-foreground">{name.name}</h3>
                        {harmony.total >= 80 && <Star className="h-4 w-4 fill-gold text-gold" />}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{name.meaning}</p>
                      <p className="mt-1 text-xs font-medium text-foreground">
                        <Volume2 className="mr-1 inline h-3 w-3" />
                        {harmony.fullName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* Harmony score */}
                      <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                        harmony.total >= 80 ? "bg-accent/10 text-accent" :
                        harmony.total >= 65 ? "bg-gold/10 text-gold" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {harmony.total}%
                      </div>
                      <button onClick={() => toggleFav(name.id)} className="p-1 transition-colors">
                        <Heart className={`h-5 w-5 ${favorites.has(name.id) ? "fill-rose text-rose" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Harmony details */}
                  <div className="mt-3 flex gap-3">
                    {[
                      { label: "Переход", val: harmony.details.transition },
                      { label: "Ритм", val: harmony.details.rhythm },
                      { label: "Звучание", val: harmony.details.alliteration },
                    ].map(d => (
                      <div key={d.label} className="flex-1">
                        <div className="h-1.5 w-full rounded-full bg-secondary">
                          <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${d.val}%` }} />
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{d.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full bg-coral-light px-2 py-0.5 text-xs font-medium text-primary">{name.culture}</span>
                    {name.attributes.slice(0, 3).map(a => (
                      <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{a}</span>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">{harmony.verdict}</p>
                </div>
              ))}
            </div>

            {results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">Нет имён по заданным критериям</p>
                <Button variant="outline" onClick={() => setStep("preferences")} className="mt-4">
                  Изменить фильтры
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NameWizard;
