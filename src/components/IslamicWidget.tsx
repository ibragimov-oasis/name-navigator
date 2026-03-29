import { useState, useEffect } from "react";
import { fetchHijriDate, formatHijriRu, getWeekdayRu, type HijriDateApi } from "@/lib/api/aladhanApi";
import { fetchRandomAyah } from "@/lib/api/quranApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Moon, BookOpen, RefreshCw } from "lucide-react";

interface DailyAyah {
  arabic: string;
  russian: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

const IslamicWidget = () => {
  const [hijri, setHijri] = useState<HijriDateApi | null>(null);
  const [ayah, setAyah] = useState<DailyAyah | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [h, a] = await Promise.all([fetchHijriDate(), fetchRandomAyah()]);
      if (!cancelled) {
        setHijri(h);
        setAyah(a);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const refreshAyah = async () => {
    setRefreshing(true);
    const a = await fetchRandomAyah();
    if (a) setAyah(a);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <section className="border-t border-border bg-gradient-to-r from-primary/5 via-card to-accent/5 py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl space-y-3">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-border bg-gradient-to-r from-primary/5 via-card to-accent/5 py-6">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Hijri date */}
          {hijri && (
            <div className="flex items-center justify-center gap-3 text-center">
              <Moon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-display text-lg font-bold text-foreground">
                  {formatHijriRu(hijri)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getWeekdayRu(hijri)} • {hijri.weekday.ar}
                </p>
              </div>
            </div>
          )}

          {/* Daily ayah */}
          {ayah && (
            <div className="rounded-2xl border border-primary/20 bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-primary">Аят дня</span>
                </div>
                <button
                  onClick={refreshAyah}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  Другой
                </button>
              </div>
              <p
                className="text-xl leading-relaxed text-foreground text-center mb-3"
                style={{ fontFamily: '"Noto Naskh Arabic", serif', direction: "rtl" }}
              >
                {ayah.arabic}
              </p>
              <p className="text-sm text-muted-foreground italic text-center">
                «{ayah.russian}»
              </p>
              <p className="mt-2 text-xs text-primary text-center font-semibold">
                Сура {ayah.surahNumber}, аят {ayah.ayahNumber}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default IslamicWidget;
