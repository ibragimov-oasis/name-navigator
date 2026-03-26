import { useState, useRef, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { getChildNames } from "@/lib/namesStore";
import { SIGNATURE_STYLES, generateSignature, downloadSignature } from "@/lib/signatureGenerator";
import { Pen, Download, Search, RotateCcw } from "lucide-react";

const NameSignature = () => {
  const [inputName, setInputName] = useState("");
  const [activeName, setActiveName] = useState("");
  const [signatures, setSignatures] = useState<{ style: typeof SIGNATURE_STYLES[0]; dataUrl: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allNames = getChildNames();

  const suggestions = useMemo(() => {
    if (!inputName.trim()) return [];
    const q = inputName.toLowerCase();
    return allNames.filter(n => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [inputName, allNames]);

  const generateAll = (name: string) => {
    if (!name.trim() || !canvasRef.current) return;
    setActiveName(name);
    setShowSuggestions(false);
    const canvas = canvasRef.current;
    const results = SIGNATURE_STYLES.map(style => ({
      style,
      dataUrl: generateSignature(name, style, canvas),
    }));
    setSignatures(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <Pen className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Генератор подписей</h1>
          <p className="mt-1 text-muted-foreground">Реалистичные подписи с имитацией пера — 8 уникальных стилей</p>
        </div>

        {/* Input */}
        <div className="relative max-w-md mx-auto mb-8">
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
              className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Создать
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Results */}
        {signatures.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-semibold text-foreground">
              Подписи для «{activeName}»
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {signatures.map(({ style, dataUrl }) => (
                <div key={style.id} className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">{style.label}</p>
                    <button onClick={() => downloadSignature(dataUrl, activeName, style.id)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      <Download className="h-3.5 w-3.5" /> PNG
                    </button>
                  </div>
                  <img src={dataUrl} alt={`${activeName} — ${style.label}`} className="w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {signatures.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-4xl">✍️</p>
            <p className="mt-2 text-muted-foreground">Введите имя и нажмите «Создать»</p>
            <p className="mt-1 text-xs text-muted-foreground">8 стилей: деловая, президентская, каллиграфическая, быстрая, королевская, арабская, минималистичная, артистическая</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameSignature;
