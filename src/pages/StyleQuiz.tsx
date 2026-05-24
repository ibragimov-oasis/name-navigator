import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import NameCard from "@/components/NameCard";
import { Sparkles, RotateCcw, ChevronRight } from "lucide-react";
import { QUIZ, scoreQuiz, pickNamesForStyles, STYLE_META, type Style } from "@/lib/styleQuizEngine";

const StyleQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [done, setDone] = useState(false);

  const result = useMemo(() => (done ? scoreQuiz(answers) : null), [done, answers]);
  const names = useMemo(
    () => (result ? pickNamesForStyles(result.top, gender || undefined, 36) : []),
    [result, gender],
  );

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step, done]);

  const answer = (i: number) => {
    const next = [...answers, i];
    setAnswers(next);
    if (step + 1 >= QUIZ.length) setDone(true);
    else setStep(step + 1);
  };

  const reset = () => { setAnswers([]); setStep(0); setDone(false); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Стиль-тест" }]} />

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-light">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">DNA-тест стиля имени</h1>
            <p className="text-sm text-muted-foreground">
              10 вопросов о ваших вкусах → персональный набор имён, как у Nameberry, но на наших данных.
            </p>
          </div>
        </div>

        {!done && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
            {step === 0 && !gender && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Сначала укажите пол ребёнка (можно пропустить):</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setGender("male")} className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">♂ Мальчик</button>
                  <button onClick={() => setGender("female")} className="rounded-lg bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-100">♀ Девочка</button>
                  <button onClick={() => setGender("male")} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">Пропустить</button>
                </div>
              </div>
            )}
            {(gender || step > 0) && (
              <>
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Вопрос {step + 1} из {QUIZ.length}</span>
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
                  </div>
                </div>
                <h2 className="mb-4 font-display text-xl font-bold text-foreground">{QUIZ[step].q}</h2>
                <div className="space-y-2">
                  {QUIZ[step].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      className="group flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <span>{opt.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {done && result && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-coral-light/50 via-card to-teal-light/40 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Ваш стиль</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                    {result.top.map((s) => `${STYLE_META[s].emoji} ${STYLE_META[s].label}`).join(" + ")}
                  </h2>
                  <p className="mt-2 text-sm text-foreground/80">{STYLE_META[result.top[0]].desc}</p>
                  {result.top[1] && (
                    <p className="mt-1 text-sm text-muted-foreground">+ {STYLE_META[result.top[1]].desc}</p>
                  )}
                </div>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Пройти заново
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.keys(result.scores) as Style[])
                  .sort((a, b) => result.scores[b] - result.scores[a])
                  .map((s) => (
                    <span key={s} className="rounded-full bg-card px-3 py-1 text-xs">
                      {STYLE_META[s].emoji} {STYLE_META[s].label}: <b>{result.scores[s]}</b>
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                Подходящие имена ({names.length})
              </h3>
              {names.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  В базе пока мало имён под этот стиль — попробуйте пройти тест снова или загляните в общий каталог.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {names.map((n, i) => (
                    <NameCard key={n.id} item={n} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StyleQuiz;
