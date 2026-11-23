import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getChildNames, loadEnrichedNames } from "@/lib/namesStore";
import { useFavorites } from "@/lib/favorites";
import { speakName, stopSpeech, ttsSupported } from "@/lib/tts";
import { fetchRegistry } from "@/lib/api/tajikRegistryApi";
import WizardNameDetailDialog from "@/components/wizard/WizardNameDetailDialog";
import { buildRegistryLookup, isRegistryCulture, registryBadge, type RegistryLookup } from "@/components/wizard/RegistryBadge";
import { calculateHarmony, generatePatronymic, siblingHarmony } from "@/lib/nameHarmony";
import { ChildName } from "@/data/childNames";
import { Wand2, ArrowRight, ArrowLeft, Sparkles, Star, Volume2, Heart, Users, ShieldCheck, Plus, X } from "lucide-react";

type Step = "info" | "preferences" | "results";

const NISBA_OPTIONS = [
  { region: "Бухара", nisba: "аль-Бухари" },
  { region: "Казань", nisba: "аль-Казани" },
  { region: "Дагестан", nisba: "ад-Дагестани" },
  { region: "Татарстан", nisba: "ат-Татари" },
  { region: "Башкортостан", nisba: "аль-Башкири" },
  { region: "Узбекистан", nisba: "аль-Узбеки" },
  { region: "Казахстан", nisba: "аль-Казахи" },
  { region: "Чечня", nisba: "аш-Шишани" },
  { region: "Египет", nisba: "аль-Мисри" },
  { region: "Сирия", nisba: "аш-Шами" },
  { region: "Медина", nisba: "аль-Мадани" },
  { region: "Мекка", nisba: "аль-Макки" },
];

const NameWizard = () => {
  const [step, setStep] = useState<Step>("info");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedCultures, setSelectedCultures] = useState<string[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [siblings, setSiblings] = useState<string[]>([]);
  const [siblingInput, setSiblingInput] = useState("");
  const [visible, setVisible] = useState(20);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [registry, setRegistry] = useState<RegistryLookup | null>(null);
  const canSpeak = ttsSupported();
  // Nasab fields
  const [grandfatherName, setGrandfatherName] = useState("");
  const [greatGrandfatherName, setGreatGrandfatherName] = useState("");
  const [firstChildName, setFirstChildName] = useState("");
  const [selectedNisba, setSelectedNisba] = useState("");
  const [showNasab, setShowNasab] = useState(false);

  // Живое обновление каталога: свежие имена из автопополнения
  useEffect(() => {
    const onUpdate = () => setCatalogVersion(v => v + 1);
    window.addEventListener("names-updated", onUpdate);
    void loadEnrichedNames().then(added => { if (added > 0) onUpdate(); });
    return () => { window.removeEventListener("names-updated", onUpdate); stopSpeech(); };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allNames = useMemo(() => getChildNames(), [catalogVersion]);
  const cultures = useMemo(() => [...new Set(allNames.map(n => n.culture))], [allNames]);
  const attrs = useMemo(() => [...new Set(allNames.flatMap(n => n.attributes))], [allNames]);

  const results = useMemo(() => {
    let filtered = allNames.filter(n => n.gender === gender || n.gender === "unisex");
    if (selectedCultures.length > 0) {
      filtered = filtered.filter(n => selectedCultures.includes(n.culture));
    }
    if (selectedAttrs.length > 0) {
      filtered = filtered.filter(n => n.attributes.some(a => selectedAttrs.includes(a)));
    }

    return filtered.map(name => {
      const harmony = calculateHarmony(name.name, fatherName, surname, gender, { motherName });
      const sibling = siblingHarmony(name.name, siblings);
      // Созвучие с братьями/сёстрами даёт бонус до +15 к сортировке
      return { name, harmony, sibling, rank: harmony.total + sibling.score * 0.15 };
    }).filter(r => !siblings.some(s => s.trim().toLowerCase() === r.name.name.toLowerCase()))
      .sort((a, b) => b.rank - a.rank);
  }, [allNames, gender, selectedCultures, selectedAttrs, fatherName, surname, motherName, siblings]);

  useEffect(() => { setVisible(20); }, [gender, selectedCultures, selectedAttrs]);

  // Ленивая загрузка реестра РТ, только если в выдаче есть таджикские/персидские имена
  const needsRegistry = step === "results" && results.some(r => isRegistryCulture(r.name.culture));
  useEffect(() => {
    if (!needsRegistry || registry) return;
    const ctrl = new AbortController();
    fetchRegistry(ctrl.signal).then(list => setRegistry(buildRegistryLookup(list))).catch(() => { /* бейдж просто не покажем */ });
    return () => ctrl.abort();
  }, [needsRegistry, registry]);

  const badgeFor = (n: { name: string; culture: string }) =>
    registry && isRegistryCulture(n.culture) ? registryBadge(n.name, registry) : null;

  const speakFio = (text: string) => { speakName(text, "ru-RU"); };

  const addSibling = () => {
    const v = siblingInput.trim();
    if (!v || siblings.length >= 5 || siblings.some(s => s.toLowerCase() === v.toLowerCase())) return;
    setSiblings(prev => [...prev, v]); setSiblingInput("");
  };
  const opened = openId ? results.find(r => r.name.id === openId) ?? null : null;

  const buildNasab = (childName: string) => {
    const ibn = gender === "male" ? "ибн" : "бинт";
    let chain = childName;
    if (fatherName) chain += ` ${ibn} ${fatherName}`;
    if (grandfatherName) chain += ` ${ibn} ${grandfatherName}`;
    if (greatGrandfatherName) chain += ` ${ibn} ${greatGrandfatherName}`;
    return chain;
  };

  const buildKunya = () => {
    if (!firstChildName) return "";
    return gender === "male" ? `Абу ${firstChildName}` : `Умм ${firstChildName}`;
  };

  const buildFullIslamicName = (childName: string) => {
    const parts: string[] = [];
    const kunya = buildKunya();
    if (kunya) parts.push(kunya);
    parts.push(buildNasab(childName));
    if (selectedNisba) parts.push(selectedNisba);
    return parts.join(" ");
  };

  const toggleCulture = (c: string) => setSelectedCultures(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleAttr = (a: string) => setSelectedAttrs(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleFav = (id: string) => toggleFavorite(id);

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-12">
      <Header />
      <div className="container mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-8">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {(["info", "preferences", "results"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step === s ? "bg-primary text-primary-foreground" :
                (["info", "preferences", "results"].indexOf(step) > i) ? "bg-accent text-accent-foreground" :
                "bg-secondary text-muted-foreground"
              }`}>{i + 1}</div>
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
                <Input value={fatherName} onChange={e => setFatherName(e.target.value)} placeholder="Для отчества и насаба" className="mt-1" />
                {fatherName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Отчество: <span className="font-medium text-foreground">{generatePatronymic(fatherName, gender)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Имя матери <span className="text-muted-foreground font-normal">(опционально)</span></label>
                <Input value={motherName} onChange={e => setMotherName(e.target.value)} placeholder="Для подбора созвучных" className="mt-1" />
                {motherName && <p className="mt-1 text-xs text-muted-foreground">Учитывается в оценке гармонии (35%)</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground"><Users className="mr-1 inline h-4 w-4" />Старшие дети <span className="text-muted-foreground font-normal">(до 5, опционально)</span></label>
                <div className="mt-1 flex gap-2">
                  <Input value={siblingInput} onChange={e => setSiblingInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSibling(); } }}
                    placeholder="Имя брата или сестры" disabled={siblings.length >= 5} />
                  <Button type="button" variant="outline" size="icon" onClick={addSibling} aria-label="Добавить ребёнка" disabled={siblings.length >= 5}><Plus className="h-4 w-4" /></Button>
                </div>
                {siblings.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {siblings.map(s => (
                      <span key={s} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                        {s}<button onClick={() => setSiblings(prev => prev.filter(x => x !== s))} aria-label={`Убрать ${s}`}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Пол ребёнка</label>
                <div className="mt-2 flex gap-3">
                  <button onClick={() => setGender("male")}
                    className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                      gender === "male" ? "border-primary bg-coral-light text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                    }`}>♂ Мальчик</button>
                  <button onClick={() => setGender("female")}
                    className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                      gender === "female" ? "border-rose bg-rose-light text-rose" : "border-border text-muted-foreground hover:border-rose/30"
                    }`}>♀ Девочка</button>
                </div>
              </div>

              {/* Nasab section */}
              <div className="border-t border-border pt-4">
                <button onClick={() => setShowNasab(!showNasab)}
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  ☪️ {showNasab ? "Скрыть" : "Показать"} насаб / кунья / нисба
                </button>

                {showNasab && (
                  <div className="mt-4 space-y-3 rounded-lg bg-primary/5 p-4">
                    <p className="text-xs text-muted-foreground">Формирование полного мусульманского имени</p>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Имя деда</label>
                      <Input value={grandfatherName} onChange={e => setGrandfatherName(e.target.value)} placeholder="Для насаба (цепочки)" className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Имя прадеда</label>
                      <Input value={greatGrandfatherName} onChange={e => setGreatGrandfatherName(e.target.value)} placeholder="Опционально" className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Имя первенца (для куньи)</label>
                      <Input value={firstChildName} onChange={e => setFirstChildName(e.target.value)} placeholder="Абу/Умм + имя" className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Нисба (происхождение)</label>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {NISBA_OPTIONS.map(n => (
                          <button key={n.nisba} onClick={() => setSelectedNisba(selectedNisba === n.nisba ? "" : n.nisba)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                              selectedNisba === n.nisba ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                            }`}>{n.nisba}</button>
                        ))}
                      </div>
                    </div>

                    {fatherName && (
                      <div className="mt-3 rounded-lg bg-card p-3 border border-border">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Предпросмотр полного имени:</p>
                        <p className="text-sm font-bold text-foreground">{buildFullIslamicName("[Имя]")}</p>
                      </div>
                    )}
                  </div>
                )}
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
                      }`}>{c}</button>
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
                      }`}>{a}</button>
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
              {results.slice(0, visible).map(({ name, harmony, sibling }, i) => {
                const badge = badgeFor(name);
                return (
                <div key={name.id} role="button" tabIndex={0}
                  onClick={() => setOpenId(name.id)}
                  onKeyDown={e => { if (e.key === "Enter") setOpenId(name.id); }}
                  className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{i + 1}</span>
                        <h3 className="font-display text-xl font-bold text-foreground">{name.name}</h3>
                        {harmony.total >= 80 && <Star className="h-4 w-4 fill-gold text-gold" />}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{name.meaning}</p>
                      <p className="mt-1 flex items-center text-xs font-medium text-foreground">
                        {canSpeak && (
                          <button onClick={e => { e.stopPropagation(); speakFio(harmony.fullName); }}
                            aria-label={`Озвучить ${harmony.fullName}`} className="mr-1 rounded p-0.5 text-primary hover:bg-primary/10">
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {harmony.fullName}
                      </p>
                      {/* Full Islamic name if nasab enabled */}
                      {showNasab && fatherName && (
                        <p className="mt-1 text-xs text-primary font-medium">
                          ☪️ {buildFullIslamicName(name.name)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                        harmony.total >= 80 ? "bg-accent/10 text-accent" :
                        harmony.total >= 65 ? "bg-gold/10 text-gold" :
                        "bg-secondary text-muted-foreground"
                      }`}>{harmony.total}%</div>
                      <button onClick={e => { e.stopPropagation(); toggleFav(name.id); }} aria-label="Избранное" className="p-1 transition-colors">
                        <Heart className={`h-5 w-5 ${isFavorite(name.id) ? "fill-rose text-rose" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                  </div>

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
                    {sibling.sibling && sibling.score >= 40 && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"><Users className="mr-1 inline h-3 w-3" />Пара к {sibling.sibling}</span>
                    )}
                    {badge && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.status === "permitted" ? "bg-accent/10 text-accent" : badge.status === "likely" ? "bg-gold/10 text-gold" : "bg-secondary text-muted-foreground"}`}>
                        <ShieldCheck className="mr-1 inline h-3 w-3" />{badge.label}
                      </span>
                    )}
                    {name.attributes.slice(0, 3).map(a => (
                      <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{a}</span>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">{harmony.verdict}</p>
                </div>
              ); })}
            </div>

            {results.length > visible && (
              <Button variant="outline" className="w-full" onClick={() => setVisible(v => v + 20)}>
                Показать ещё ({results.length - visible})
              </Button>
            )}

            <WizardNameDetailDialog
              name={opened?.name ?? null}
              harmony={opened?.harmony ?? null}
              sibling={opened?.sibling}
              registry={opened ? badgeFor(opened.name) : null}
              isFavorite={opened ? isFavorite(opened.name.id) : false}
              onToggleFavorite={() => opened && toggleFav(opened.name.id)}
              onSpeak={() => opened && speakFio(opened.harmony.fullName)}
              canSpeak={canSpeak}
              onOpenChange={o => { if (!o) setOpenId(null); }}
            />

            {results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">Нет имён по заданным критериям</p>
                <Button variant="outline" onClick={() => setStep("preferences")} className="mt-4">Изменить фильтры</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NameWizard;
