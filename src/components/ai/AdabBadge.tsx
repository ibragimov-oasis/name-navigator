import AiDecisionPanel, { ProbBars } from "./AiDecisionPanel";
import { adabLevel, evaluateAdabScore } from "@/lib/ai/geminiDecisions";

export default function AdabBadge({ name, meaning }: { name: string; meaning?: string }) {
  return (
    <AiDecisionPanel
      title="Агент сунны и адаба"
      buttonLabel="Оценить"
      run={() => evaluateAdabScore(name, meaning)}
      note="Оценка ИИ, не фетва. Спорные случаи уточняйте у имама."
      render={(r) => {
        const l = adabLevel(r);
        return (
          <>
            <p className="font-bold text-foreground">{l.index} · {l.label} <span className="font-normal text-muted-foreground">({Math.round(r.confidence * 100)}%)</span></p>
            <ProbBars r={{ ...r, options: r.options.map((o) => ({ ...o, label: `${o.label} · ${adabLevel({ ...r, decision: o.label }).label}` })) }} />
          </>
        );
      }}
    />
  );
}
