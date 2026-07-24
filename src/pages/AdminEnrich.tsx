import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Run = {
  id: string;
  started_at: string;
  finished_at: string | null;
  model: string | null;
  source: string | null;
  added: number;
  skipped: number;
  status: string;
  errors: { reason?: string; msg?: string } | null;
};
type Quota = { model: string; day: string; requests: number };
type CultureRow = { culture: string; count: number };

export default function AdminEnrich() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [quota, setQuota] = useState<Quota[]>([]);
  const [count, setCount] = useState<number>(0);
  const [cultures, setCultures] = useState<CultureRow[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [r, q, n, c] = await Promise.all([
      supabase.from("enrich_runs").select("*").order("started_at", { ascending: false }).limit(30),
      supabase.from("llm_quota_usage").select("*").eq("day", new Date().toISOString().slice(0, 10)),
      supabase.from("names_enriched").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("names_enriched").select("culture").eq("status", "published"),
    ]);
    setRuns((r.data as any) ?? []);
    setQuota((q.data as any) ?? []);
    setCount(n.count ?? 0);
    const counts = new Map<string, number>();
    for (const row of ((c.data as any) ?? [])) {
      counts.set(row.culture, (counts.get(row.culture) ?? 0) + 1);
    }
    setCultures(
      [...counts.entries()]
        .map(([culture, count]) => ({ culture, count }))
        .sort((a, b) => a.count - b.count),
    );
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const invoke = async (batches: number, label: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("enrich-names", {
        body: { trigger: "manual", batches },
      });
      if (error) throw error;
      const added = (data as any)?.added ?? 0;
      const exhausted = (data as any)?.exhausted;
      toast.success(
        `${label}: +${added} имён${exhausted ? " (лимиты моделей на сегодня исчерпаны)" : ""}`,
      );
      load();
    } catch (e: any) {
      toast.error(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const downloadDump = async () => {
    setBusy(true);
    try {
      const url = `https://xvpngscmnasjuwxjoqyp.supabase.co/functions/v1/names-dump`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ai-names.json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Скачано. Положите файл в public/data/ai-names.json и закоммитьте.");
    } catch (e: any) {
      toast.error(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const lastRun = runs[0];
  const noCredits =
    lastRun?.errors?.reason === "no_quota_left" ||
    (lastRun?.errors?.msg ?? "").includes("402");

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-3xl font-bold">Авто-обогащение имён</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => invoke(3, "Запуск")} disabled={busy} variant="default">
            {busy ? "…" : "Запустить (3 культуры)"}
          </Button>
          <Button onClick={() => invoke(10, "Буст")} disabled={busy} variant="secondary">
            🚀 Прогнать 10 батчей
          </Button>
          <Button onClick={downloadDump} disabled={busy} variant="outline">
            Скачать JSON-дамп
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Опубликовано AI-имён в БД</div>
        <div className="text-3xl font-bold">{count}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Источник: <b>Google Gemini API</b> напрямую (Lovable AI Gateway отключён).
          Cron дёргается каждые 15 минут и подкидывает имена в наименее покрытые культуры.
          Для полной разгрузки БД скачайте дамп и положите в{" "}
          <code>public/data/ai-names.json</code>.
        </div>
        {noCredits && (
          <div className="mt-3 text-xs bg-yellow-100 text-yellow-900 rounded p-2">
            ⚠️ Последний запуск: модели на сегодня исчерпаны. Дневные лимиты Gemini сбросятся в
            00:00 PT. Если хотите ускорить — подключите ещё один API-ключ или дождитесь сброса.
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Покрытие по культурам ({cultures.length})</h2>
        {cultures.length === 0 && (
          <div className="text-muted-foreground text-sm">Пока пусто</div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {cultures.map((c) => (
            <div
              key={c.culture}
              className="flex justify-between border rounded px-2 py-1"
              title={`${c.culture}: ${c.count} имён`}
            >
              <span className="truncate">{c.culture}</span>
              <span
                className={`font-mono ${
                  c.count < 30
                    ? "text-red-600"
                    : c.count < 100
                    ? "text-yellow-700"
                    : "text-green-700"
                }`}
              >
                {c.count}
              </span>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Красным подсвечены слабо покрытые (&lt;30) — cron автоматически подтягивает их первыми.
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Лимиты Gemini (сегодня)</h2>
        <div className="space-y-1 text-sm">
          {quota.length === 0 && <div className="text-muted-foreground">Пока пусто</div>}
          {quota.map((q) => (
            <div key={q.model} className="flex justify-between">
              <span>{q.model}</span>
              <span className="font-mono">{q.requests}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Последние запуски</h2>
        <div className="space-y-2 text-sm">
          {runs.map((r) => (
            <div key={r.id} className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="text-xs text-muted-foreground">
                {new Date(r.started_at).toLocaleString()}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  r.status === "done"
                    ? "bg-green-100 text-green-800"
                    : r.status === "error"
                    ? "bg-red-100 text-red-800"
                    : r.status === "skipped"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100"
                }`}
              >
                {r.status}
              </span>
              <span className="text-xs">{r.model ?? "—"}</span>
              <span className="text-xs truncate max-w-[300px]">{r.source ?? "—"}</span>
              <span className="ml-auto text-xs">
                +{r.added} / skip {r.skipped}
              </span>
              {r.errors?.msg && (
                <span className="w-full text-xs text-red-600 truncate">{r.errors.msg}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
