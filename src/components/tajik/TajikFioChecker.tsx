import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkTajikFio, type FioCheckResult } from "@/lib/tajik/fio";
import { checkTajikNameLegality } from "@/data/tajikRegistry";
import type { TajikRegistryName } from "@/data/tajikTypes";
import { AlertTriangle, CheckCircle2, Copy, Info, UserSquare2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  names: readonly TajikRegistryName[];
  onOpenName?: (name: TajikRegistryName) => void;
}

const levelStyles: Record<string, string> = {
  error: "border-destructive/30 bg-destructive/5",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-sky-500/30 bg-sky-500/10",
};

export const TajikFioChecker = ({ names, onOpenName }: Props) => {
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [lastName, setLastName] = useState("");
  const [result, setResult] = useState<FioCheckResult | null>(null);

  const nameCheck = useMemo(() => {
    if (!result?.input.firstName) return null;
    return checkTajikNameLegality(result.input.firstName, names);
  }, [result, names]);

  const run = () => {
    setResult(checkTajikFio({ firstName, patronymic, lastName }));
  };

  return (
    <section className="space-y-6 max-w-3xl mx-auto py-4">
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-md space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <UserSquare2 className="h-6 w-6" />
          <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
            Санҷиши НИН (ФИО) аз рӯи қоидаҳои миллӣ
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Ном, номи падар ва насабро ворид кунед — мо мувофиқати онҳоро ба феҳристи расмӣ ва
          ба анъанаи миллии номгузорӣ (шаклҳои «-зода», «-иён», «-ӣ») месанҷем.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Ном (Фирӯз)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-11 rounded-xl"
            aria-label="Ном"
          />
          <Input
            placeholder="Номи падар (Сомон)"
            value={patronymic}
            onChange={(e) => setPatronymic(e.target.value)}
            className="h-11 rounded-xl"
            aria-label="Номи падар"
          />
          <Input
            placeholder="Насаб (Раҳимзода)"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            className="h-11 rounded-xl"
            aria-label="Насаб"
          />
        </div>

        <Button onClick={run} className="h-11 px-8 rounded-xl font-bold">
          Санҷидан
        </Button>

        {result && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border">
              <div className="text-3xl font-black font-display text-foreground">{result.score}%</div>
              <div className="text-xs text-muted-foreground flex-1">
                мувофиқат ба қоидаҳои миллии номгузорӣ
              </div>
              {nameCheck && (
                <Badge
                  className={
                    nameCheck.status === "permitted"
                      ? "bg-emerald-600 text-white"
                      : nameCheck.status === "likely"
                      ? "bg-amber-500 text-white"
                      : "bg-destructive text-destructive-foreground"
                  }
                >
                  {nameCheck.status === "permitted"
                    ? "Ном дар феҳрист ҳаст"
                    : nameCheck.status === "likely"
                    ? "Ном шабеҳ ёфт шуд"
                    : "Ном дар феҳрист нест"}
                </Badge>
              )}
            </div>

            {nameCheck && nameCheck.status !== "permitted" && nameCheck.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nameCheck.suggestions.slice(0, 6).map((s) => (
                  <Button
                    key={s.name.id}
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg text-xs"
                    onClick={() => onOpenName?.(s.name)}
                  >
                    {s.name.name_tj} · {Math.round(s.score * 100)}%
                  </Button>
                ))}
              </div>
            )}

            {result.issues.map((issue, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${levelStyles[issue.level]}`}>
                <div className="flex items-start gap-3">
                  {issue.level === "info" ? (
                    <Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                  ) : issue.level === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{issue.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{issue.detail}</p>
                    {issue.suggestion && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Тавсия: {issue.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {result.issues.length === 0 && (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm text-foreground">
                  НИН ба қоидаҳои миллӣ пурра мувофиқ аст.
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-muted-foreground block">Шакли тавсияшуда:</span>
                <span className="font-bold text-foreground">{result.suggestedFio || "—"}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg gap-1.5 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(result.suggestedFio);
                  toast.success("Нусхабардорӣ шуд");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Нусха
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
