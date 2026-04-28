import { useState } from "react";
import Header from "@/components/Header";
import { Users, Sparkles, Loader2, Copy, RefreshCw, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePeople } from "@/lib/people";
import { toast } from "sonner";

const CULTURES = ["Арабская", "Тюркская", "Персидская", "Русская", "Японская", "Скандинавская", "Кельтская", "Греческая"];
const ERAS = ["Древний мир", "Средневековье", "Золотой век ислама", "Новое время", "Современность", "Будущее / киберпанк"];
const ARCHETYPES = [
  { key: "hero", label: "Герой", desc: "Лидер, защитник, борец" },
  { key: "sage", label: "Мудрец", desc: "Учёный, наставник" },
  { key: "shadow", label: "Тень", desc: "Антагонист, тёмный спутник" },
  { key: "rebel", label: "Бунтарь", desc: "Революционер, изгой" },
  { key: "lover", label: "Влюблённый", desc: "Поэт, романтик" },
  { key: "trickster", label: "Трикстер", desc: "Шут, плут, манипулятор" },
];

const CharacterName = () => {
  const { addPerson } = usePeople();
  const [culture, setCulture] = useState(CULTURES[0]);
  const [era, setEra] = useState(ERAS[0]);
  const [archetype, setArchetype] = useState(ARCHETYPES[0].key);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const generate = async () => {
    setLoading(true);
    setResult("");
    const arch = ARCHETYPES.find((a) => a.key === archetype)?.label ?? archetype;
    const query = `Придумай имя для персонажа: культура — ${culture}, эпоха — ${era}, архетип — ${arch}, пол — ${gender === "male" ? "мужской" : "женский"}. Дай: 1) Имя и фамилию, 2) Этимологию имени, 3) Краткую биографию (3-4 предложения) — кто этот персонаж, его конфликт и черта характера. Будь креативным, избегай клише, имя должно звучать аутентично для культуры и эпохи.`;
    try {
      const { data, error } = await supabase.functions.invoke("rag-query", {
        body: { query, mode: "creative", stream: false },
      });
      if (error) throw error;
      const answer = (data as any)?.answer ?? (data as any)?.text ?? JSON.stringify(data);
      setResult(answer);
    } catch (e) {
      toast.error("Не удалось сгенерировать. Попробуйте ещё раз.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Скопировано");
  };

  const saveAsProfile = () => {
    // Extract first non-empty line as the name guess
    const firstLine = result.split("\n").find((l) => l.trim()) ?? "";
    const nameGuess = firstLine.replace(/^[\d\.\)\-\s«"]+/, "").replace(/[«"].+$/, "").trim().slice(0, 60);
    if (!nameGuess) {
      toast.error("Не удалось извлечь имя из ответа");
      return;
    }
    addPerson({
      fullName: nameGuess,
      gender,
      relation: "character",
      notes: `${culture} · ${era} · ${ARCHETYPES.find((a) => a.key === archetype)?.label}\n\n${result}`.slice(0, 1000),
      tags: [culture.toLowerCase(), era.toLowerCase(), "персонаж"],
    });
    toast.success(`Персонаж «${nameGuess}» сохранён в «Мои профили»`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender-light">
            <Users className="h-6 w-6 text-lavender" />
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Имя для персонажа
          </h1>
          <p className="mt-2 text-muted-foreground">
            Для писателей, RPG-мастеров и сценаристов
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Культура
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CULTURES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCulture(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    culture === c
                      ? "bg-lavender text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Эпоха
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ERAS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEra(e)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    era === e
                      ? "bg-lavender text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Архетип
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ARCHETYPES.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setArchetype(a.key)}
                  className={`rounded-xl border-2 p-3 text-left text-sm transition-all ${
                    archetype === a.key
                      ? "border-lavender bg-lavender/5"
                      : "border-border hover:border-lavender/30"
                  }`}
                >
                  <div className="font-semibold text-foreground">{a.label}</div>
                  <div className="text-xs text-muted-foreground">{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Пол
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`rounded-xl border-2 p-2 text-sm font-medium transition-all ${
                    gender === g
                      ? "border-lavender bg-lavender/5 text-lavender"
                      : "border-border text-foreground hover:border-lavender/30"
                  }`}
                >
                  {g === "male" ? "♂ Мужской" : "♀ Женский"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lavender px-4 py-3 font-semibold text-white hover:bg-lavender/90 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Генерирую…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Сгенерировать персонажа
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-lavender/20 bg-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-foreground">Ваш персонаж</h2>
              <div className="flex gap-1">
                <button
                  onClick={saveAsProfile}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                  title="Сохранить как профиль персонажа"
                >
                  <UserPlus className="h-3.5 w-3.5" /> В профили
                </button>
                <button
                  onClick={copy}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title="Копировать"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={generate}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title="Сгенерировать заново"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CharacterName;
