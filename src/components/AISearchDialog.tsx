import { useEffect, useRef, useState } from "react";
import { Sparkles, Search, X, ArrowRight, Loader2, BookOpen, User, Crown, Star } from "lucide-react";
import { searchKnowledge, type RagDoc } from "@/lib/rag/knowledgeIndex";
import { Link } from "react-router-dom";

const KIND_ICON: Record<string, typeof Star> = {
  name: User,
  prophet: Crown,
  dua: Star,
  guide: BookOpen,
};

const KIND_LABEL: Record<string, string> = {
  name: "Имя",
  prophet: "Пророк / сахаба",
  dua: "Дуа",
  guide: "Раздел",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AISearchDialog({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RagDoc[]>([]);
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setAiAnswer("");
      setError(null);
      abortRef.current?.abort();
    }
  }, [open]);

  // Live keyword search (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setResults(searchKnowledge(query, 8));
    }, 120);
    return () => clearTimeout(t);
  }, [query]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleAskAI = async () => {
    if (!query.trim() || loading) return;
    setAiAnswer("");
    setError(null);
    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const context = searchKnowledge(query, 6).map((d) => ({
        id: d.id,
        kind: d.kind,
        title: d.title,
        body: d.body,
        url: d.url,
      }));

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `${supabaseUrl}/functions/v1/rag-query`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ query, context }),
        signal: ctrl.signal,
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || `Ошибка ${resp.status}`);
      }

      // Stream SSE chunks
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("Нет потока ответа");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) setAiAnswer((prev) => prev + delta);
          } catch {
            /* skip */
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Ошибка генерации ответа");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background/80 backdrop-blur-sm pt-[10vh] px-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAskAI();
            }}
            placeholder="Спросите: «имя для девочки со значением свет»…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center rounded border border-border px-1.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* AI ask CTA */}
          {query.trim() && (
            <button
              onClick={handleAskAI}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm">
                {loading ? "Думаю…" : "Спросить AI про"}{" "}
                <span className="font-semibold">«{query}»</span>
              </span>
              <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </button>
          )}

          {/* AI Answer */}
          {(aiAnswer || error) && (
            <div className="px-4 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" /> AI ответ
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {aiAnswer}
                  {loading && <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />}
                </p>
              )}
            </div>
          )}

          {/* Keyword results */}
          {results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Из базы знаний
              </div>
              {results.map((r) => {
                const Icon = KIND_ICON[r.kind] ?? Search;
                return (
                  <Link
                    key={r.id}
                    to={r.url}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{r.title}</span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          {KIND_LABEL[r.kind]}
                        </span>
                      </div>
                      {r.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                      )}
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {r.body}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!query.trim() && (
            <div className="px-4 py-8 text-center">
              <Sparkles className="h-8 w-8 mx-auto text-primary/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Спросите что угодно про имена, пророков, дуа и традиции
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  "имя для мальчика со значением сила",
                  "что такое акика",
                  "дуа при рождении ребёнка",
                  "имена пророков",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.length === 0 && !aiAnswer && !loading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Ничего не найдено по ключевым словам. Нажмите Enter, чтобы спросить AI.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>RAG поиск по {/* fixed */}базе сайта</span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-background">↵</kbd>
            спросить AI
          </span>
        </div>
      </div>
    </div>
  );
}
