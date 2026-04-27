import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Search, X, ArrowRight, Loader2, BookOpen, User, Crown, Star, Filter, Compass, Users as UsersIcon, Brain } from "lucide-react";
import {
  searchKnowledgeDetailed,
  getTopFacets,
  type RagSearchHit,
  type RagSourceKind,
} from "@/lib/rag/knowledgeIndex";
import { Link } from "react-router-dom";
import { usePeople, formatFullName, RELATION_LABELS } from "@/lib/people";

const KIND_ICON: Record<string, typeof Star> = {
  name: User,
  prophet: Crown,
  dua: Star,
  guide: BookOpen,
  "revert-guide": Compass,
  "historical-figure": UsersIcon,
  "name-impression": Brain,
};

const KIND_LABEL: Record<string, string> = {
  name: "Имя",
  prophet: "Пророк / сахаба",
  dua: "Дуа",
  guide: "Раздел",
  "revert-guide": "Новообращённому",
  "historical-figure": "Историческая личность",
  "name-impression": "Восприятие имени",
};

const KIND_TABS: { id: RagSourceKind | "all"; label: string }[] = [
  { id: "all", label: "Всё" },
  { id: "name", label: "Имена" },
  { id: "prophet", label: "Пророки" },
  { id: "historical-figure", label: "Личности" },
  { id: "revert-guide", label: "Новообращ." },
  { id: "dua", label: "Дуа" },
  { id: "guide", label: "Разделы" },
];

/** Curated quick-attribute chips (mapped to tags present in the index) */
const QUICK_ATTRS = [
  "красивое",
  "высокое",
  "справедливое",
  "весёлое",
  "сильное",
  "мудрое",
  "светлое",
  "благородное",
];

/** Persona quick filters — switch UI focus by audience */
const PERSONA_PRESETS: { id: string; label: string; kinds: RagSourceKind[]; tags?: string[] }[] = [
  { id: "self", label: "Для себя", kinds: ["name", "name-impression"], tags: [] },
  { id: "character", label: "Для персонажа", kinds: ["historical-figure", "name"], tags: [] },
  { id: "revert", label: "Для новообращённого", kinds: ["revert-guide", "name", "prophet"], tags: [] },
  { id: "child", label: "Для ребёнка", kinds: ["name", "dua", "prophet"], tags: [] },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Highlight matched substrings inside text */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length || !text) return <>{text}</>;
  const escaped = terms
    .filter((t) => t && t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!escaped.length) return <>{text}</>;
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function AISearchDialog({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeKind, setActiveKind] = useState<RagSourceKind | "all">("all");
  const [activeAttrs, setActiveAttrs] = useState<string[]>([]);
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { activePerson } = usePeople();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setAiAnswer("");
      setError(null);
      setActiveKind("all");
      setActiveAttrs([]);
      setActivePersona(null);
      abortRef.current?.abort();
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Persona-derived kind scope (overrides single-kind tabs when active)
  const personaKinds = useMemo(() => {
    const p = PERSONA_PRESETS.find((x) => x.id === activePersona);
    return p?.kinds;
  }, [activePersona]);

  // Discovered facets within current kind scope
  const discoveredFacets = useMemo(
    () => getTopFacets(personaKinds ?? (activeKind === "all" ? undefined : [activeKind]), 12),
    [activeKind, personaKinds]
  );

  // Hybrid keyword + facet search
  const hits: RagSearchHit[] = useMemo(() => {
    if (!query.trim() && activeAttrs.length === 0 && !activePersona) return [];
    return searchKnowledgeDetailed(query, {
      limit: 12,
      kinds: personaKinds ?? (activeKind === "all" ? undefined : [activeKind]),
      tags: activeAttrs,
    });
  }, [query, activeKind, activeAttrs, activePersona, personaKinds]);

  const toggleAttr = (a: string) =>
    setActiveAttrs((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const handleAskAI = async () => {
    if (!query.trim() || loading) return;
    setAiAnswer("");
    setError(null);
    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const context = hits.slice(0, 6).map((h) => ({
        id: h.doc.id,
        kind: h.doc.kind,
        title: h.doc.title,
        body: h.doc.body,
        url: h.doc.url,
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `${supabaseUrl}/functions/v1/rag-query`;

      const personContext = activePerson
        ? {
            fullName: formatFullName(activePerson),
            gender: activePerson.gender,
            relation: RELATION_LABELS[activePerson.relation],
            birthDate: activePerson.birthDate,
          }
        : null;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          query,
          context,
          filters: { kind: activeKind, attrs: activeAttrs, persona: activePersona },
          personContext,
        }),
        signal: ctrl.signal,
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || `Ошибка ${resp.status}`);
      }

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

  const hasFilters = activeKind !== "all" || activeAttrs.length > 0 || activePersona !== null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background/80 backdrop-blur-sm pt-[8vh] px-4 animate-in fade-in"
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

        {/* Active person banner */}
        {activePerson && (
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-1.5 text-[11px] text-primary">
            <User className="h-3 w-3" />
            <span>
              Контекст: <strong>{formatFullName(activePerson)}</strong> · {RELATION_LABELS[activePerson.relation]}
            </span>
          </div>
        )}

        {/* Persona presets */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto bg-muted/10">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground mr-1 shrink-0">Я ищу</span>
          {PERSONA_PRESETS.map((p) => {
            const on = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersona(on ? null : p.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                  on
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Kind tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto">
          {KIND_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveKind(t.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                activeKind === t.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Attribute facets */}
        <div className="px-4 py-2 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Filter className="h-3 w-3" /> Каким должно быть имя
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ATTRS.map((a) => {
              const on = activeAttrs.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAttr(a)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    on
                      ? "bg-primary/10 text-primary border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              );
            })}
            {discoveredFacets
              .filter((f) => !QUICK_ATTRS.includes(f.tag.toLowerCase()))
              .slice(0, 6)
              .map((f) => {
                const on = activeAttrs.includes(f.tag);
                return (
                  <button
                    key={f.tag}
                    onClick={() => toggleAttr(f.tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      on
                        ? "bg-primary/10 text-primary border-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {f.tag}
                    <span className="ml-1 text-[10px] opacity-60">{f.count}</span>
                  </button>
                );
              })}
            {hasFilters && (
              <button
                onClick={() => {
                  setActiveAttrs([]);
                  setActiveKind("all");
                }}
                className="text-xs px-2.5 py-1 rounded-full text-muted-foreground hover:text-destructive transition-colors"
              >
                сбросить
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[55vh] overflow-y-auto">
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

          {/* Hits with reasons */}
          {hits.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {hits.length} {hits.length === 1 ? "результат" : "результатов"}
              </div>
              {hits.map(({ doc: r, reasons, score }) => {
                const Icon = KIND_ICON[r.kind] ?? Search;
                const highlightTerms = [...reasons.matchedTokens, ...activeAttrs];
                const reasonChips: { label: string; tone: "primary" | "muted" }[] = [];
                if (reasons.titleHit)
                  reasonChips.push({ label: "совпало в названии", tone: "primary" });
                for (const tag of reasons.matchedTags.slice(0, 3))
                  reasonChips.push({ label: `атрибут: ${tag}`, tone: "primary" });
                for (const t of reasons.matchedTokens.slice(0, 2))
                  reasonChips.push({ label: `«${t}»`, tone: "muted" });

                return (
                  <Link
                    key={r.id}
                    to={r.url}
                    onClick={onClose}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors border-l-2 border-transparent hover:border-primary"
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          <Highlight text={r.title} terms={highlightTerms} />
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          {KIND_LABEL[r.kind]}
                        </span>
                        <span
                          className="ml-auto text-[10px] text-muted-foreground tabular-nums"
                          title="Релевантность"
                        >
                          {score.toFixed(1)}
                        </span>
                      </div>
                      {r.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          <Highlight text={r.subtitle} terms={highlightTerms} />
                        </div>
                      )}
                      <div className="text-xs text-foreground/80 line-clamp-2 mt-0.5">
                        <Highlight text={reasons.snippet || r.body} terms={highlightTerms} />
                      </div>
                      {reasonChips.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {reasonChips.map((c, i) => (
                            <span
                              key={i}
                              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                                c.tone === "primary"
                                  ? "border-primary/40 text-primary bg-primary/5"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {c.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!query.trim() && activeAttrs.length === 0 && (
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

          {(query.trim() || activeAttrs.length > 0) &&
            hits.length === 0 &&
            !aiAnswer &&
            !loading && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Ничего не найдено по фильтрам. Попробуйте снять часть атрибутов или нажмите Enter,
                чтобы спросить AI.
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            RAG поиск
            {hasFilters && (
              <span className="ml-1 text-primary">
                · {activeKind !== "all" ? KIND_LABEL[activeKind] : "все"}
                {activeAttrs.length > 0 && ` · ${activeAttrs.length} атр.`}
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-background">↵</kbd>
            спросить AI
          </span>
        </div>
      </div>
    </div>
  );
}
