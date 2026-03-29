import { useState, useCallback } from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Globe, Users, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { analyzeNameFull, getCountryName, type NameAnalysis } from "@/lib/api/nameAnalysisApi";

const QUICK_NAMES = ["Мухаммад", "Фатима", "Али", "Аиша", "Юсуф", "Марьям", "Омар", "Хадиджа"];

const NameAnalytics = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NameAnalysis | null>(null);
  const [analyzedName, setAnalyzedName] = useState("");
  const [error, setError] = useState("");

  const analyze = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setAnalyzedName(name.trim());
    setInput(name.trim());
    try {
      const data = await analyzeNameFull(name.trim());
      if (!data) {
        setError("Не удалось получить данные. Попробуйте позже.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Ошибка сети. Проверьте подключение к интернету.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze(input);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <BarChart3 className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Аналитика имени
          </h1>
          <p className="mt-2 text-muted-foreground">
            Узнайте пол, возраст и географию имени по мировым данным
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Данные от Genderize.io • Nationalize.io • Agify.io
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите имя для анализа..."
            className="pl-10 pr-24 text-lg h-12"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1.5 h-9"
          >
            {loading ? "Анализ..." : "Анализ"}
          </Button>
        </form>

        {/* Quick buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {QUICK_NAMES.map((n) => (
            <button
              key={n}
              onClick={() => analyze(n)}
              className="rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-foreground hover:bg-primary/10 transition-colors"
            >
              {n}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-center font-display text-2xl font-bold text-foreground">
              Результаты для «{analyzedName}»
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              На основе {result.gender.count.toLocaleString("ru-RU")} записей в мировых базах данных
            </p>

            {/* Gender */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
                <Users className="h-5 w-5 text-primary" /> Пол
              </h3>
              {result.gender.gender ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {result.gender.gender === "male" ? "♂ Мужское" : "♀ Женское"}
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {Math.round(result.gender.probability * 100)}%
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${result.gender.probability * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Вероятность на основе {result.gender.count.toLocaleString("ru-RU")} носителей
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Пол не определён</p>
              )}
            </div>

            {/* Age */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
                <Calendar className="h-5 w-5 text-accent" /> Средний возраст
              </h3>
              {result.age.age !== null ? (
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                    <span className="text-3xl font-bold text-accent">{result.age.age}</span>
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      Средний возраст носителя: <strong>{result.age.age} лет</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      На основе {result.age.count.toLocaleString("ru-RU")} записей
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Возраст не определён</p>
              )}
            </div>

            {/* Nationality */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
                <Globe className="h-5 w-5 text-primary" /> География
              </h3>
              {result.nationality.country.length > 0 ? (
                <div className="space-y-3">
                  {result.nationality.country.slice(0, 5).map((c, i) => (
                    <div key={c.country_id} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {getCountryName(c.country_id)}
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {Math.round(c.probability * 100)}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all duration-500"
                            style={{ width: `${c.probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Топ-{Math.min(5, result.nationality.country.length)} стран
                    из {result.nationality.count.toLocaleString("ru-RU")} записей
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Географические данные недоступны</p>
              )}
            </div>

            {/* Insight */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <TrendingUp className="mx-auto h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-foreground">
                Имя <strong>«{analyzedName}»</strong> встречается в{" "}
                <strong>{result.nationality.country.length}</strong> странах мира.
                {result.gender.gender && (
                  <> Преимущественно{" "}
                    <strong>
                      {result.gender.gender === "male" ? "мужское" : "женское"}
                    </strong>{" "}
                    ({Math.round(result.gender.probability * 100)}%).
                  </>
                )}
                {result.age.age && (
                  <> Средний возраст носителя — <strong>{result.age.age} лет</strong>.</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="text-center py-12">
            <Globe className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">
              Введите любое имя, чтобы узнать его статистику по всему миру
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameAnalytics;
