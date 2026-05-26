import { useState } from "react";
import { Sparkles, Check, X, HelpCircle, ExternalLink, Loader2, Copy } from "lucide-react";
import {
  generateNicknames,
  checkGithub,
  manualCheck,
  type AvailabilityResult,
} from "@/lib/socialAvailability";
import { toast } from "sonner";

type Row = {
  nick: string;
  github?: AvailabilityResult;
  instagram?: AvailabilityResult;
  twitter?: AvailabilityResult;
};

export default function NicknameGenerator({ initialName = "" }: { initialName?: string }) {
  const [name, setName] = useState(initialName);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!name.trim()) {
      toast.error("Введите имя");
      return;
    }
    setLoading(true);
    const nicks = generateNicknames(name);
    if (nicks.length === 0) {
      toast.error("Не получилось сгенерировать варианты");
      setLoading(false);
      return;
    }
    // Сначала покажем без статусов
    const base: Row[] = nicks.map((n) => ({ nick: n }));
    setRows(base);

    // Параллельно проверим GitHub (это единственный с CORS)
    const results = await Promise.all(
      nicks.map(async (nick) => {
        const gh = await checkGithub(nick);
        const ig = manualCheck("instagram", nick);
        const tw = manualCheck("twitter", nick);
        return { nick, github: gh, instagram: ig, twitter: tw } as Row;
      }),
    );
    setRows(results);
    setLoading(false);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success(`«${txt}» скопирован`);
  };

  const statusIcon = (s?: AvailabilityResult["status"]) => {
    if (s === "free") return <Check className="h-3.5 w-3.5 text-green-600" />;
    if (s === "taken") return <X className="h-3.5 w-3.5 text-destructive" />;
    return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" /> Никнейм для соцсетей
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Короткие брендовые варианты с проверкой занятости на GitHub.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Имя или базовое слово…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-input bg-background py-2 px-3 text-sm focus:border-accent focus:outline-none"
        />
        <button
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Сгенерировать
        </button>
      </div>

      {rows.length > 0 && (
        <div className="mt-4 space-y-2">
          {rows.map((r) => (
            <div
              key={r.nick}
              className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-foreground">@{r.nick}</span>
                <button
                  onClick={() => copy(r.nick)}
                  className="rounded p-1 text-muted-foreground hover:bg-secondary"
                  title="Копировать"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <a
                  href={r.github?.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent"
                  title={`GitHub: ${r.github?.status ?? "проверка…"}`}
                >
                  {statusIcon(r.github?.status)} GH
                </a>
                <a
                  href={r.instagram?.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent"
                  title="Открыть Instagram"
                >
                  <ExternalLink className="h-3 w-3" /> IG
                </a>
                <a
                  href={r.twitter?.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent"
                  title="Открыть X / Twitter"
                >
                  <ExternalLink className="h-3 w-3" /> X
                </a>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            <Check className="inline h-3 w-3 text-green-600" /> свободно ·{" "}
            <X className="inline h-3 w-3 text-destructive" /> занято ·{" "}
            <HelpCircle className="inline h-3 w-3" /> Instagram/X проверьте вручную по ссылке
          </p>
        </div>
      )}
    </section>
  );
}
