import { useState, useRef, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { getChildNames } from "@/lib/namesStore";
import { analyzeNameDNA, renderDNACard } from "@/lib/nameDNA";
import { usePeople } from "@/lib/people";
import { Dna, Download, Search } from "lucide-react";

const NameDNA = () => {
  const [searchParams] = useSearchParams();
  const { activePerson } = usePeople();
  const fallbackName = searchParams.get("name") || activePerson?.fullName || "";
  const [inputName, setInputName] = useState(fallbackName);
  const [activeName, setActiveName] = useState("");
  const [cardUrl, setCardUrl] = useState("");
  const [dnaData, setDnaData] = useState<ReturnType<typeof analyzeNameDNA> | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allNames = getChildNames();

  const suggestions = useMemo(() => {
    if (!inputName.trim()) return [];
    const q = inputName.toLowerCase();
    return allNames.filter(n => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [inputName, allNames]);

  const generate = (name: string) => {
    if (!name.trim() || !canvasRef.current) return;
    setActiveName(name);
    setShowSuggestions(false);

    const nameEntry = allNames.find(n => n.name.toLowerCase() === name.toLowerCase());
    const dna = analyzeNameDNA(name);
    setDnaData(dna);

    const url = renderDNACard(
      dna,
      canvasRef.current,
      nameEntry?.meaning,
      nameEntry?.origin
    );
    setCardUrl(url);
  };

  const downloadCard = () => {
    if (!cardUrl) return;
    const link = document.createElement("a");
    link.download = `dna_${activeName}.png`;
    link.href = cardUrl;
    link.click();
  };

  // Auto-generate when arriving from a profile/URL
  useEffect(() => {
    if (fallbackName && !activeName && canvasRef.current) {
      generate(fallbackName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackName]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <Dna className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">ДНК Имени</h1>
          <p className="mt-1 text-muted-foreground">Визуальный генетический код любого имени</p>
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
                onKeyDown={e => e.key === "Enter" && generate(inputName)}
                placeholder="Введите имя..."
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map(n => (
                    <button key={n.id} onClick={() => { setInputName(n.name); generate(n.name); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors">
                      {n.name} <span className="text-muted-foreground text-xs">— {n.meaning}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => generate(inputName)}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Создать
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Result */}
        {cardUrl && dnaData && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <img src={cardUrl} alt={`ДНК ${activeName}`} className="w-full rounded-lg" />
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Уникальный генетический код имени «{activeName}»</p>
                <button onClick={downloadCard}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Download className="h-4 w-4" /> Скачать PNG
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{dnaData.numerology}</p>
                <p className="text-xs text-muted-foreground mt-1">Число судьбы</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{Math.round(dnaData.vowelRatio * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Гласные</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{Object.keys(dnaData.letterFreq).length}</p>
                <p className="text-xs text-muted-foreground mt-1">Уникальных букв</p>
              </div>
            </div>

            {/* Letter frequency */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-3">Частота букв</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dnaData.letterFreq)
                  .sort(([, a], [, b]) => b - a)
                  .map(([letter, count]) => (
                    <div key={letter} className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1">
                      <span className="text-sm font-bold text-foreground uppercase">{letter}</span>
                      <span className="text-xs text-muted-foreground">×{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {!cardUrl && (
          <div className="mt-12 text-center">
            <p className="text-4xl">🧬</p>
            <p className="mt-2 text-muted-foreground">Введите имя, чтобы увидеть его генетический код</p>
            <p className="mt-1 text-xs text-muted-foreground">Визуальная спираль ДНК + нумерология + фонетический анализ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameDNA;
