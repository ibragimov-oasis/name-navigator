import { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { usePeople, formatFullName, Person } from "@/lib/people";
import { transliterateToArabic } from "@/lib/arabicTranslit";
import { speakName, ttsSupported } from "@/lib/tts";
import { Crown, Copy, Check, Volume2, ScrollText, ArrowRight, Users } from "lucide-react";
import { toast } from "sonner";

/**
 * Сборщик арабского ФИО (насаб + кунья + нисба + лакаб) на основе профилей.
 * Берёт активный профиль или позволяет выбрать любого. Авто-генерация куньи
 * по старшему ребёнку (если связан через parentId).
 */
const Nasab = () => {
  const { people, activePerson } = usePeople();
  const [selectedId, setSelectedId] = useState<string | null>(activePerson?.id ?? people[0]?.id ?? null);
  const person = useMemo(
    () => people.find((p) => p.id === selectedId) ?? activePerson ?? null,
    [people, selectedId, activePerson]
  );

  useEffect(() => {
    if (!selectedId && activePerson) setSelectedId(activePerson.id);
  }, [activePerson, selectedId]);

  const fatherName = person?.patronymic;
  // Find children linked to this person
  const children = useMemo(
    () => (person ? people.filter((p) => p.parentId === person.id) : []),
    [people, person]
  );
  const eldestChild = children[0];
  const autoKunya = useMemo(() => {
    if (person?.kunya) return person.kunya;
    if (!eldestChild) return "";
    const prefix = person?.gender === "female" ? "Умм" : "Абу";
    return `${prefix} ${eldestChild.fullName}`;
  }, [person, eldestChild]);

  const cyrillic = person ? buildArabicNasabCyrillic(person, autoKunya) : "";
  const arabic = useMemo(() => (cyrillic ? transliterateToArabic(cyrillic) : ""), [cyrillic]);

  const [copied, setCopied] = useState<"cyr" | "ar" | null>(null);
  const copy = (text: string, key: "cyr" | "ar") => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Скопировано");
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
            <Crown className="h-6 w-6 text-gold" />
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Арабское ФИО / насаб
          </h1>
          <p className="mt-2 text-muted-foreground">
            Кунья · Имя · ибн/бинт Отец · Нисба · Лакаб
          </p>
        </div>

        {people.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-foreground mb-3">
              Сначала создайте профиль — насаб строится из его данных.
            </p>
            <Link
              to="/people/profiles"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              К профилям <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {people.length > 0 && (
          <>
            <div className="rounded-2xl border border-border bg-card p-4 mb-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Профиль
              </label>
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(e.target.value || null)}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName}
                    {p.relation === "self" ? " (я)" : ""}
                  </option>
                ))}
              </select>
              {!fatherName && person && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Подсказка: добавьте имя отца в поле «Отчество / насаб» в{" "}
                  <Link to="/people/profiles" className="text-primary hover:underline">
                    профиле
                  </Link>
                  , чтобы получился полный ибн/бинт.
                </p>
              )}
              {eldestChild && !person?.kunya && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Авто-кунья по ребёнку «{eldestChild.fullName}»: <span className="font-semibold text-primary">{autoKunya}</span>
                </p>
              )}
            </div>

            {person && (
              <>
                <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 to-card p-6 space-y-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Кириллица
                      </p>
                      <button
                        onClick={() => copy(cyrillic, "cyr")}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Скопировать"
                      >
                        {copied === "cyr" ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="font-display text-xl font-bold text-foreground leading-snug">
                      {cyrillic || "—"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Арабская вязь
                      </p>
                      <div className="flex gap-1">
                        {ttsSupported() && (
                          <button
                            onClick={() => speakName(cyrillic, "ar-SA")}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            title="Произнести"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => copy(arabic, "ar")}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Скопировать"
                        >
                          {copied === "ar" ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <p
                      className="text-3xl leading-loose text-foreground mt-1"
                      style={{ fontFamily: '"Noto Naskh Arabic", serif', direction: "rtl" }}
                    >
                      {arabic || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    to={`/certificate?name=${encodeURIComponent(person.fullName)}${
                      person.birthDate ? `&date=${person.birthDate}` : ""
                    }&person=${encodeURIComponent(person.relation)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold bg-gold/10 px-4 py-3 text-sm font-semibold text-gold hover:bg-gold/20"
                  >
                    <ScrollText className="h-4 w-4" /> Сертификат имени
                  </Link>
                  <Link
                    to={`/tafsir?name=${encodeURIComponent(person.fullName)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
                  >
                    Тафсир имени <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <details className="mt-5 rounded-xl border border-border bg-card p-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    Что такое насаб?
                  </summary>
                  <div className="mt-3 space-y-2 text-muted-foreground leading-relaxed">
                    <p>
                      <strong>Кунья</strong> — почётное обращение «Абу/Умм X» по имени старшего ребёнка.
                    </p>
                    <p>
                      <strong>Имя</strong> — личное имя (исм).
                    </p>
                    <p>
                      <strong>Насаб</strong> — родословная: «ибн/бинт» (сын/дочь) + имя отца, дед, прадед.
                    </p>
                    <p>
                      <strong>Нисба</strong> — указание на местность/племя (аль-Бухари, ал-Мисри).
                    </p>
                    <p>
                      <strong>Лакаб</strong> — прозвище за качества (ас-Сиддик «Правдивейший»).
                    </p>
                  </div>
                </details>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

function buildArabicNasabCyrillic(p: Person, autoKunya: string): string {
  const parts: string[] = [];
  if (autoKunya) parts.push(autoKunya);
  parts.push(p.fullName);
  if (p.patronymic) {
    const link = p.gender === "female" ? "бинт" : "ибн";
    parts.push(`${link} ${p.patronymic}`);
  }
  if (p.surname) parts.push(p.surname);
  if (p.nisba) parts.push(`ал-${p.nisba}`);
  if (p.laqab) parts.push(`«${p.laqab}»`);
  return parts.join(" ");
}

export default Nasab;
