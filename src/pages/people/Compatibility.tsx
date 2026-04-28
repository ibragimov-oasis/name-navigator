import { useMemo, useState } from "react";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import ShareButton from "@/components/ShareButton";
import PersonForm from "@/components/PersonForm";
import { usePeople, Person, PersonInput, formatFullName, RELATION_LABELS } from "@/lib/people";
import { calculatePersonCompatibility, compareWithFamily } from "@/lib/personCompatibility";
import { Heart, ArrowLeftRight, Sparkles, Plus, Loader2, Users } from "lucide-react";

const PersonPicker = ({
  label,
  value,
  onPick,
  onCreate,
  excludeId,
}: {
  label: string;
  value: Person | null;
  onPick: (p: Person | null) => void;
  onCreate: (input: PersonInput) => Person;
  excludeId?: string;
}) => {
  const { people } = usePeople();
  const [creating, setCreating] = useState(false);
  const list = people.filter((p) => p.id !== excludeId);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {value ? (
        <div className="space-y-2">
          <div className="font-display text-lg font-bold text-foreground">
            {formatFullName(value)}
          </div>
          <div className="text-xs text-muted-foreground">
            {RELATION_LABELS[value.relation]} · {value.gender === "male" ? "♂" : "♀"}{" "}
            {value.birthDate ? `· ${value.birthDate}` : ""}
          </div>
          <button
            onClick={() => onPick(null)}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            сменить
          </button>
        </div>
      ) : creating ? (
        <PersonForm
          onSubmit={(input) => {
            const p = onCreate(input);
            onPick(p);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <div className="space-y-2">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет сохранённых профилей.</p>
          )}
          <div className="max-h-44 space-y-1 overflow-y-auto">
            {list.map((p) => (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div className="font-medium">{p.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {RELATION_LABELS[p.relation]}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Новый профиль
          </button>
        </div>
      )}
    </div>
  );
};

const ScoreBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
    <div
      className={`h-full transition-all ${
        value >= 75 ? "bg-accent" : value >= 55 ? "bg-primary" : "bg-rose"
      }`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const Compatibility = () => {
  const { addPerson, activePerson, people } = usePeople();
  const [a, setA] = useState<Person | null>(activePerson);
  const [b, setB] = useState<Person | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const result = useMemo(() => (a && b ? calculatePersonCompatibility(a, b) : null), [a, b]);
  const familyMatches = useMemo(
    () => (a && people.length > 1 ? compareWithFamily(a, people) : []),
    [a, people]
  );

  const askAI = async () => {
    if (!a || !b || !result) return;
    setAiOpen(true);
    setAiLoading(true);
    setAiText("");
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `${supabaseUrl}/functions/v1/rag-query`;
      const query = `Объясни совместимость пары: ${formatFullName(a)} (${RELATION_LABELS[a.relation]}, ${a.gender}) и ${formatFullName(b)} (${RELATION_LABELS[b.relation]}, ${b.gender}). Числовой балл: ${result.total}/100. Сильные оси: ${result.strengths.slice(0, 2).join("; ")}. Зоны внимания: ${result.watchOuts.join("; ")}. Дай 3 совета для гармонии.`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({
          query,
          context: [],
          personContext: { a, b, compatibility: result.summary },
        }),
      });
      if (!resp.ok) throw new Error(`Ошибка ${resp.status}`);
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("нет потока");
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const d = line.slice(5).trim();
          if (d === "[DONE]") continue;
          try {
            const j = JSON.parse(d);
            const delta = j.choices?.[0]?.delta?.content;
            if (delta) setAiText((p) => p + delta);
          } catch {
            /* skip */
          }
        }
      }
    } catch (err: any) {
      setAiText(`Не удалось получить AI-ответ: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Совместимость имён двух человек — Имяген"
        description="Проверьте совместимость имён по звучанию, нумерологии Абджад, культуре и жизненному пути. Подходит для супругов, родителей, партнёров."
      />
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-light">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-black text-foreground sm:text-4xl">
            Совместимость двух человек
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Звучание имён, нумерология Абджад, культурный код, жизненный путь и роли —
            всё в одной карточке.
          </p>
        </div>

        <div className="grid items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <PersonPicker
            label="Первый человек"
            value={a}
            onPick={setA}
            onCreate={addPerson}
            excludeId={b?.id}
          />
          <div className="hidden items-center justify-center sm:flex">
            <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
          </div>
          <PersonPicker
            label="Второй человек"
            value={b}
            onPick={setB}
            onCreate={addPerson}
            excludeId={a?.id}
          />
        </div>

        {result && a && b && (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Общая совместимость
                  </div>
                  <div className="font-display text-5xl font-black text-foreground">
                    {result.total}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ShareButton
                    title={`Совместимость ${a.fullName} и ${b.fullName}`}
                    text={result.summary}
                  />
                  <button
                    onClick={askAI}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    AI-объяснение
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {result.axes.map((ax) => (
                  <div key={ax.axis}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{ax.label}</span>
                      <span className="tabular-nums text-muted-foreground">{ax.score}</span>
                    </div>
                    <ScoreBar value={ax.score} />
                    <p className="mt-1 text-xs text-muted-foreground">{ax.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-accent/5 p-4">
                <h3 className="mb-2 text-sm font-semibold text-accent">Сильные стороны</h3>
                {result.strengths.length === 0 ? (
                  <p className="text-xs text-muted-foreground">—</p>
                ) : (
                  <ul className="space-y-1 text-xs text-foreground">
                    {result.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-rose-light/40 p-4">
                <h3 className="mb-2 text-sm font-semibold text-rose">Зоны внимания</h3>
                {result.watchOuts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Ничего критичного</p>
                ) : (
                  <ul className="space-y-1 text-xs text-foreground">
                    {result.watchOuts.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-primary/5 p-4">
                <h3 className="mb-2 text-sm font-semibold text-primary">Совет</h3>
                <ul className="space-y-1 text-xs text-foreground">
                  {result.advice.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {aiOpen && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI-объяснение
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {aiText || (aiLoading ? "Думаю…" : "")}
                  {aiLoading && (
                    <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary/60" />
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {a && familyMatches.length > 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Совместимость {a.fullName} со всей семьёй
            </h3>
            <div className="space-y-2">
              {familyMatches.map((m) => (
                <button
                  key={m.person.id}
                  onClick={() => setB(m.person)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {m.person.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {RELATION_LABELS[m.person.relation]}
                    </div>
                  </div>
                  <div
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      m.score >= 75
                        ? "bg-accent/20 text-accent"
                        : m.score >= 55
                        ? "bg-primary/15 text-primary"
                        : "bg-rose/15 text-rose"
                    }`}
                  >
                    {m.score}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(!a || !b) && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Выберите двух человек, чтобы увидеть результат.
          </div>
        )}
      </main>
    </div>
  );
};

export default Compatibility;
