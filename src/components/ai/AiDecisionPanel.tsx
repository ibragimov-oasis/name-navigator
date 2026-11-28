import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import type { DecisionResult } from "@/lib/ai/geminiDecisions";

interface Props {
  title: string;
  buttonLabel: string;
  run: () => Promise<DecisionResult>;
  render: (r: DecisionResult) => ReactNode;
  note?: string;
}

/** Click-to-run AI decision block: never fires automatically, falls back gracefully. */
export default function AiDecisionPanel({ title, buttonLabel, run, render, note }: Props) {
  const [state, setState] = useState<{ loading: boolean; result: DecisionResult | null; error: string | null }>({ loading: false, result: null, error: null });
  const go = async () => {
    setState({ loading: true, result: null, error: null });
    try { setState({ loading: false, result: await run(), error: null }); }
    catch (e) { setState({ loading: false, result: null, error: e instanceof Error ? e.message : "ИИ недоступен" }); }
  };
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-foreground"><Sparkles className="h-4 w-4 text-primary" />{title}</span>
        <Button size="sm" variant="outline" onClick={go} disabled={state.loading}>
          {state.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : buttonLabel}
        </Button>
      </div>
      {state.result && (
        <div className="mt-2 space-y-1.5">
          {render(state.result)}
          {state.result.reason && <p className="text-xs text-muted-foreground">{state.result.reason}</p>}
          <p className="text-[10px] text-muted-foreground">Модель: {state.result.model}</p>
        </div>
      )}
      {state.error && <p className="mt-2 text-xs text-muted-foreground">{state.error}</p>}
      {note && <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>}
    </div>
  );
}

export function ProbBars({ r }: { r: DecisionResult }) {
  return (
    <div className="space-y-1">
      {[...r.options].sort((a, b) => b.p - a.p).map((o) => (
        <div key={o.label} className="flex items-center gap-2 text-xs">
          <span className="w-44 truncate text-foreground">{o.label}</span>
          <div className="h-1.5 flex-1 rounded bg-secondary"><div className="h-1.5 rounded bg-primary" style={{ width: `${Math.round(o.p * 100)}%` }} /></div>
          <span className="w-9 text-right tabular-nums text-muted-foreground">{Math.round(o.p * 100)}%</span>
        </div>
      ))}
    </div>
  );
}
