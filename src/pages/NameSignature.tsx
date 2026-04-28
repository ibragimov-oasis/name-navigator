import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { getChildNames } from "@/lib/namesStore";
import { SIGNATURE_STYLES, generateSignature, downloadSignature } from "@/lib/signatureGenerator";
import type { SignatureStyle } from "@/lib/signatureGenerator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeople } from "@/lib/people";
import { Pen, Download, Search, RotateCcw, Star, Copy, Check } from "lucide-react";

const QUICK_NAMES = ["Мухаммад", "Али", "Фатима", "Аиша", "Юсуф", "Ибрахим", "Марьям", "Омар"];

interface GeneratedSig {
  style: SignatureStyle;
  dataUrl: string;
}

const NameSignature = () => {
  const [searchParams] = useSearchParams();
  const { activePerson } = usePeople();
  const fallbackName = searchParams.get("name") || activePerson?.fullName || "";
  const [inputName, setInputName] = useState(fallbackName);
  const [activeName, setActiveName] = useState("");
  const [signatures, setSignatures] = useState<GeneratedSig[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favSigs, setFavSigs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("sig_favs");
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set<string>();
    } catch { return new Set<string>(); }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [seedOffset, setSeedOffset] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allNames = useMemo(() => getChildNames(), []);

  const suggestions = useMemo(() => {
    if (!inputName.trim()) return [];
    const q = inputName.toLowerCase();
    return allNames.filter(n => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [inputName, allNames]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-generate if URL param or active profile present
  useEffect(() => {
    if (fallbackName && canvasRef.current && !signatures.length) {
      setInputName(fallbackName);
      generateAll(fallbackName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackName]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("sig_favs", JSON.stringify([...favSigs]));
  }, [favSigs]);

  const generateAll = useCallback((name: string) => {
    if (!name.trim() || !canvasRef.current) return;
    setActiveName(name);
    setShowSuggestions(false);
    setIsGenerating(true);

    // Use requestAnimationFrame to not block UI
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const results = SIGNATURE_STYLES.map(style => ({
        style,
        dataUrl: generateSignature(name + (seedOffset > 0 ? String(seedOffset) : ""), style, canvas),
      }));
      setSignatures(results);
      setIsGenerating(false);
    });
  }, [seedOffset]);

  const toggleFav = (styleId: string) => {
    setFavSigs(prev => {
      const next = new Set(prev);
      const key = `${activeName}_${styleId}`;
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const copyToClipboard = async (dataUrl: string, styleId: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopiedId(styleId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: just open in new tab
      window.open(dataUrl, "_blank");
    }
  };

  const regenerate = () => {
    setSeedOffset(prev => prev + 1);
    if (activeName) {
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const newOffset = seedOffset + 1;
        const results = SIGNATURE_STYLES.map(style => ({
          style,
          dataUrl: generateSignature(activeName + (newOffset > 0 ? String(newOffset) : ""), style, canvas),
        }));
        setSignatures(results);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <Pen className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Генератор подписей</h1>
          <p className="mt-1 text-muted-foreground">Реалистичные подписи с имитацией пера — 8 уникальных стилей</p>
        </div>

        {/* Quick name buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {QUICK_NAMES.map(qn => (
            <button
              key={qn}
              onClick={() => { setInputName(qn); generateAll(qn); }}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {qn}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="relative max-w-md mx-auto mb-8" ref={dropdownRef}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={inputName}
                onChange={e => { setInputName(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => e.key === "Enter" && generateAll(inputName)}
                placeholder="Введите имя..."
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map(n => (
                    <button key={n.id} onClick={() => { setInputName(n.name); generateAll(n.name); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors">
                      {n.name} <span className="text-muted-foreground text-xs">— {n.meaning}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => generateAll(inputName)}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Создать
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Loading skeletons */}
        {isGenerating && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!isGenerating && signatures.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                Подписи для «{activeName}»
              </h2>
              <button
                onClick={regenerate}
                title="Новый вариант"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {signatures.map(({ style, dataUrl }, idx) => {
                const favKey = `${activeName}_${style.id}`;
                const isFav = favSigs.has(favKey);
                return (
                  <div
                    key={style.id}
                    className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md animate-fade-in"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">{style.label}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleFav(style.id)} title="В избранное">
                          <Star className={`h-3.5 w-3.5 transition-colors ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`} />
                        </button>
                        <button onClick={() => copyToClipboard(dataUrl, style.id)} title="Копировать">
                          {copiedId === style.id
                            ? <Check className="h-3.5 w-3.5 text-green-500" />
                            : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          }
                        </button>
                        <button onClick={() => downloadSignature(dataUrl, activeName, style.id)}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          <Download className="h-3.5 w-3.5" /> PNG
                        </button>
                      </div>
                    </div>
                    <img src={dataUrl} alt={`${activeName} — ${style.label}`} className="w-full rounded-lg" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isGenerating && signatures.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-4xl">✍️</p>
            <p className="mt-2 text-muted-foreground">Введите имя и нажмите «Создать»</p>
            <p className="mt-1 text-xs text-muted-foreground">
              8 стилей: деловая, президентская, каллиграфическая, быстрая, королевская, арабская, минималистичная, артистическая
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameSignature;
