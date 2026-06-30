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
  errors: any;
};
type Quota = { model: string; day: string; requests: number };

export default function AdminEnrich() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [quota, setQuota] = useState<Quota[]>([]);
  const [count, setCount] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [r, q, n] = await Promise.all([
      supabase.from("enrich_runs").select("*").order("started_at", { ascending: false }).limit(30),
      supabase.from("llm_quota_usage").select("*").eq("day", new Date().toISOString().slice(0, 10)),
      supabase.from("names_enriched").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);
    setRuns((r.data as any) ?? []);
    setQuota((q.data as any) ?? []);
    setCount(n.count ?? 0);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const runNow = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("enrich-names", { body: { trigger: "manual" } });
      if (error) throw error;
      toast.success(`Готово: ${JSON.stringify(data)}`);
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-3xl font-bold">Авто-обогащение имён</h1>
        <div className="flex gap-2">
          <Button onClick={runNow} disabled={busy} variant="default">
            {busy ? "…" : "Запустить сейчас"}
          </Button>
          <Button onClick={downloadDump} disabled={busy} variant="secondary">
            Скачать JSON-дамп
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Опубликовано AI-имён в БД</div>
        <div className="text-3xl font-bold">{count}</div>
        <div className="text-xs text-muted-foreground mt-1">
          Cron каждые 15 мин. Для разгрузки БД скачайте дамп и положите в <code>public/data/ai-names.json</code> — сайт будет читать имена статически из репо.
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
              <span className="text-xs text-muted-foreground">{new Date(r.started_at).toLocaleString()}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  r.status === "done"
                    ? "bg-green-100 text-green-800"
                    : r.status === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100"
                }`}
              >
                {r.status}
              </span>
              <span className="text-xs">{r.model ?? "—"}</span>
              <span className="text-xs">{r.source ?? "—"}</span>
              <span className="ml-auto text-xs">+{r.added} / skip {r.skipped}</span>
              {r.errors && <span className="w-full text-xs text-red-600">{JSON.stringify(r.errors)}</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
