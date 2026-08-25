import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import { tajikRegistryNames, TAJIK_ALPHABET, checkTajikNameLegality, getTajikAlphabetStats } from "@/data/tajikRegistry";
import { TajikRegistryName, NameCheckResult } from "@/data/tajikTypes";
import { TajikNameDetailDialog } from "@/components/TajikNameDetailDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/lib/favorites";
import { toast } from "sonner";
import {
  ShieldCheck,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Heart,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Info,
  Clock,
  ArrowUpDown,
  Copy,
  Check
} from "lucide-react";

type GenderFilter = "all" | "male" | "female";
type EnrichedFilter = "all" | "enriched" | "pending";
type ViewMode = "grid" | "table";
type SortOrder = "num-asc" | "alpha-asc" | "alpha-desc";

const ITEMS_PER_PAGE = 36;

const TajikNames = () => {
  const [search, setSearch] = useState("");
  const [selectedGender, setSelectedGender] = useState<GenderFilter>("all");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [selectedEnriched, setSelectedEnriched] = useState<EnrichedFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("num-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Checker tool state
  const [checkerQuery, setCheckerQuery] = useState("");
  const [checkResult, setCheckResult] = useState<NameCheckResult | null>(null);

  // Detail Modal state
  const [selectedName, setSelectedName] = useState<TajikRegistryName | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const alphabetStats = useMemo(() => getTajikAlphabetStats(), []);

  // Filtered & sorted names
  const filteredNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    
    return tajikRegistryNames.filter((item) => {
      // Gender filter
      if (selectedGender !== "all" && item.gender !== selectedGender) {
        return false;
      }
      // Letter filter
      if (selectedLetter !== "all" && item.letter.toUpperCase() !== selectedLetter.toUpperCase()) {
        return false;
      }
      // Enriched filter
      if (selectedEnriched === "enriched" && !item.is_enriched) {
        return false;
      }
      if (selectedEnriched === "pending" && item.is_enriched) {
        return false;
      }
      // Search filter
      if (q) {
        const matchTj = item.name_tj.toLowerCase().includes(q) || item.name_tj_raw.toLowerCase().includes(q);
        const matchCyr = item.name_cyrillic.toLowerCase().includes(q) || item.name_cyrillic_raw.toLowerCase().includes(q);
        const matchLat = item.name_latin.toLowerCase().includes(q) || item.name_latin_raw.toLowerCase().includes(q);
        const matchMeaning = item.meaning ? item.meaning.toLowerCase().includes(q) : false;
        if (!matchTj && !matchCyr && !matchLat && !matchMeaning) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortOrder === "alpha-asc") {
        return a.name_tj.localeCompare(b.name_tj, "tg");
      }
      if (sortOrder === "alpha-desc") {
        return b.name_tj.localeCompare(a.name_tj, "tg");
      }
      return a.num - b.num;
    });
  }, [search, selectedGender, selectedLetter, selectedEnriched, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGender, selectedLetter, selectedEnriched, sortOrder]);

  const totalPages = Math.ceil(filteredNames.length / ITEMS_PER_PAGE) || 1;
  const paginatedNames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNames, currentPage]);

  const handleRunChecker = () => {
    if (!checkerQuery.trim()) {
      setCheckResult(null);
      return;
    }
    const res = checkTajikNameLegality(checkerQuery);
    setCheckResult(res);
  };

  const handleExportCSV = () => {
    const headers = ["Т/Р", "Тоҷикӣ", "Овонавишти кириллӣ", "Овонавишти лотинӣ", "Ҷинс", "Ҳарф", "Маъно", "Ҳолат"];
    const rows = filteredNames.map((n) => [
      n.num,
      `"${n.name_tj}"`,
      `"${n.name_cyrillic}"`,
      `"${n.name_latin}"`,
      `"${n.gender_tj}"`,
      `"${n.letter}"`,
      `"${(n.meaning || '').replace(/"/g, '""')}"`,
      `"${n.is_enriched ? 'Обогащённое' : 'Ожидает обогащения'}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Фехристи_номхои_милли_РТ_${selectedGender}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Файли CSV бомуваффақият сабт шуд (${filteredNames.length} ном)`);
  };

  const handleCopyCard = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Нусхабардорӣ: ${text}`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const counts = useMemo(() => {
    return {
      total: tajikRegistryNames.length,
      male: tajikRegistryNames.filter((n) => n.gender === "male").length,
      female: tajikRegistryNames.filter((n) => n.gender === "female").length,
      enriched: tajikRegistryNames.filter((n) => n.is_enriched).length,
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/30 p-6 sm:p-10 mb-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Тасдиқшуда бо Қарори Ҳукумати Ҷумҳурии Тоҷикистон №98
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground font-display">
              Феҳристи номҳои миллии тоҷикӣ
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
              Ягона феҳристи расмии номҳои миллии тасдиқшуда ва иҷозатдодашудаи Тоҷикистон.
              Тибқи қонунгузории ҶТ танҳо номҳои расмии ин феҳрист барои сабти асноди ҳолати шаҳрвандӣ (САҲШ / ЗАГС) иҷозат доранд.
            </p>

            {/* Quick Stats Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-card border border-border/80 text-xs font-medium flex items-center gap-2 shadow-sm">
                <span className="font-bold text-foreground text-sm">{counts.total.toLocaleString()}</span>
                <span className="text-muted-foreground">ҳамагӣ ном</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-medium flex items-center gap-2">
                <span className="font-bold text-sm">{counts.male.toLocaleString()}</span>
                <span>писарона</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <span className="font-bold text-sm">{counts.female.toLocaleString()}</span>
                <span>духтарона</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                <span className="font-bold text-sm">{counts.enriched.toLocaleString()}</span>
                <span>бо маълумоти пурра</span>
              </div>
            </div>
          </div>
        </section>

        {/* Name Legality Checker Tool (Санҷиши ном) */}
        <section className="mb-10 p-6 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground font-display">
              Санҷиши ном ба феҳристи расмӣ (Проверка имени на разрешение)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Номеро ворид кунед, то санҷед, ки оё он дар феҳристи иҷозатдодашудаи ҶТ ҳаст ва чӣ тавр дуруст навишта мешавад:
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Номро ворид кунед (масалан: Абирафшон, Абдуваҳҳоб, Мадина, Юсуф)..."
                value={checkerQuery}
                onChange={(e) => {
                  setCheckerQuery(e.target.value);
                  if (!e.target.value.trim()) setCheckResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRunChecker();
                }}
                className="pl-10 h-11 rounded-xl bg-background text-sm"
              />
            </div>
            <Button
              onClick={handleRunChecker}
              className="h-11 px-6 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              Санҷидан
            </Button>
          </div>

          {/* Checker Result Box */}
          {checkResult && (
            <div
              className={`mt-4 p-4 rounded-xl border transition-all animate-fade-in ${
                checkResult.isPermitted
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
              }`}
            >
              <div className="flex items-start gap-3">
                {checkResult.isPermitted ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base">
                      {checkResult.isPermitted ? "✓ НОМ РАСМАН ИҶОЗАТ ДОДА ШУДААСТ" : "⚠ ДАР ФЕҲРИСТИ РАСМӢ ЁФТ НАШУД"}
                    </span>
                    {checkResult.exactMatch && (
                      <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        {checkResult.exactMatch.gender_tj}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{checkResult.recommendation}</p>

                  {checkResult.closeMatches.length > 0 && (
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs font-semibold mb-1.5 opacity-90">Вариантҳои расмӣ дар феҳрист:</p>
                      <div className="flex flex-wrap gap-2">
                        {checkResult.closeMatches.map((m) => (
                          <Button
                            key={m.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedName(m);
                              setDetailOpen(true);
                            }}
                            className="h-8 text-xs rounded-lg border-current bg-background/50 hover:bg-background"
                          >
                            {m.name_tj} ({m.name_latin}) — №{m.num}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Tajik Alphabet Bar */}
        <section className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Интихоби ҳарф (Алфавитный указатель):
            </span>
            {selectedLetter !== "all" && (
              <button
                onClick={() => setSelectedLetter("all")}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Ҳамаи ҳарфҳоро нишон деҳ
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-card border border-border">
            <Button
              variant={selectedLetter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedLetter("all")}
              className={`h-9 px-3 text-xs rounded-xl font-semibold transition-all ${
                selectedLetter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ҳама ({counts.total})
            </Button>
            {alphabetStats.map((stat) => (
              <Button
                key={stat.letter}
                variant={selectedLetter === stat.letter ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedLetter(stat.letter)}
                className={`h-9 min-w-[38px] px-2 text-xs rounded-xl font-bold transition-all flex items-center gap-1 ${
                  selectedLetter === stat.letter
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                title={`Ҳарфи ${stat.letter}: ${stat.count} ном`}
              >
                <span>{stat.letter}</span>
                <span className="text-[10px] opacity-60 font-normal">({stat.count})</span>
              </Button>
            ))}
          </div>
        </section>

        {/* Filter Controls & Search */}
        <section className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
            {/* Live Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ҷустуҷӯ аз рӯи навишти тоҷикӣ, русӣ, лотинӣ ё маъно..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-card border-border text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Тоза кардан
                </button>
              )}
            </div>

            {/* Gender Switcher */}
            <Tabs
              value={selectedGender}
              onValueChange={(v) => setSelectedGender(v as GenderFilter)}
              className="w-full md:w-auto"
            >
              <TabsList className="h-10 rounded-xl bg-card border border-border p-1">
                <TabsTrigger value="all" className="rounded-lg text-xs font-semibold">
                  Ҳама ({counts.total})
                </TabsTrigger>
                <TabsTrigger value="male" className="rounded-lg text-xs font-semibold text-sky-600 dark:text-sky-400">
                  Писарона ({counts.male})
                </TabsTrigger>
                <TabsTrigger value="female" className="rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400">
                  Духтарона ({counts.female})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Export CSV Button */}
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 border-border bg-card hover:bg-secondary text-foreground"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>Экспорт CSV</span>
            </Button>
          </div>

          {/* Secondary Sub-filters & View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground font-medium">Ҳолат:</span>
              <Button
                variant={selectedEnriched === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedEnriched("all")}
                className="h-7 text-xs rounded-lg px-2.5"
              >
                Ҳама
              </Button>
              <Button
                variant={selectedEnriched === "enriched" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedEnriched("enriched")}
                className="h-7 text-xs rounded-lg px-2.5 text-emerald-600 dark:text-emerald-400"
              >
                Бо маълумот ({counts.enriched})
              </Button>
              <Button
                variant={selectedEnriched === "pending" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedEnriched("pending")}
                className="h-7 text-xs rounded-lg px-2.5 text-amber-600 dark:text-amber-400"
              >
                Интизори такмил ({counts.total - counts.enriched})
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="num-asc">Аз рӯи рақам (1..N)</option>
                  <option value="alpha-asc">Аз рӯи алифбо (А-Я)</option>
                  <option value="alpha-desc">Аз рӯи алифбо (Я-А)</option>
                </select>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Намуди кортҳо"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Намуди ҷадвал"
                >
                  <TableIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Results Count Bar */}
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Ёфт шуд: <strong className="text-foreground font-semibold">{filteredNames.length}</strong> ном
            {search && ` бо дархости «${search}»`}
            {selectedLetter !== "all" && ` ба ҳарфи «${selectedLetter}»`}
          </span>
          <span>
            Саҳифаи <strong className="text-foreground">{currentPage}</strong> аз <strong>{totalPages}</strong>
          </span>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {paginatedNames.map((item) => {
              const isFav = isFavorite(item.id);
              return (
                <Card
                  key={item.id}
                  onClick={() => {
                    setSelectedName(item);
                    setDetailOpen(true);
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border-border/80 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    {/* Top Row: Gender Badge + Number + Favorite */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            item.gender === "male"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {item.gender_tj}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">№{item.num}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleCopyCard(e, item.name_tj, item.id)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          title="Нусхабардорӣ"
                        >
                          {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite({
                              id: item.id,
                              name: item.name_tj,
                              gender: item.gender,
                              origin: item.origin || "Тоҷикӣ",
                              culture: "Таджикская",
                              meaning: item.meaning || "Номи миллии тоҷикӣ",
                              attributes: item.attributes || [],
                              popularity: 90,
                              history: item.legal_decree,
                              languages: ["tg", "ru"]
                            });
                          }}
                          className="p-1 text-muted-foreground hover:text-rose transition-colors"
                          title="Илова ба мунтахаб"
                        >
                          <Heart className={`h-4 w-4 ${isFav ? "fill-rose text-rose" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Main Name Heading */}
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors font-display">
                        {item.name_tj}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{item.name_cyrillic}</span>
                        <span>•</span>
                        <span className="font-mono">{item.name_latin}</span>
                      </div>
                    </div>

                    {/* Meaning preview or Pending badge */}
                    {item.is_enriched && item.meaning ? (
                      <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed bg-muted/30 p-2 rounded-lg">
                        {item.meaning}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>Номи расмӣ (№98)</span>
                      </div>
                    )}
                  </CardContent>

                  {/* Card bottom bar */}
                  <div className="px-4 py-2 border-t border-border/40 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="h-3 w-3" /> Қонунӣ
                    </span>
                    <span className="text-primary group-hover:underline">Тафсилот →</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="mb-8 rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-center w-14">№</th>
                    <th className="p-3">Тоҷикӣ (расмӣ)</th>
                    <th className="p-3">Кириллӣ</th>
                    <th className="p-3">Лотинӣ</th>
                    <th className="p-3">Ҷинс</th>
                    <th className="p-3">Ҳарф</th>
                    <th className="p-3">Маъно / Тавсиф</th>
                    <th className="p-3 text-center">Амал</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedNames.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedName(item);
                        setDetailOpen(true);
                      }}
                      className="hover:bg-secondary/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3 text-center font-mono text-muted-foreground">{item.num}</td>
                      <td className="p-3 font-bold text-foreground text-sm">{item.name_tj}</td>
                      <td className="p-3 text-foreground">{item.name_cyrillic}</td>
                      <td className="p-3 font-mono text-muted-foreground">{item.name_latin}</td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            item.gender === "male" ? "text-sky-600 bg-sky-500/10" : "text-rose-600 bg-rose-500/10"
                          }`}
                        >
                          {item.gender_tj}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold">{item.letter}</td>
                      <td className="p-3 max-w-xs truncate text-muted-foreground">
                        {item.meaning || "—"}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedName(item);
                            setDetailOpen(true);
                          }}
                          className="h-7 text-[11px] rounded-lg"
                        >
                          Кушодан
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNames.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50">
            <Info className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">Ҳеҷ номе ёфт нашуд</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Бо филтрҳо ё калимаи ҷустуҷӯии дигар санҷед.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedGender("all");
                setSelectedLetter("all");
                setSelectedEnriched("all");
              }}
              className="rounded-xl text-xs"
            >
              Тоза кардани филтрҳо
            </Button>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl h-9 px-3 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Қаблӣ
            </Button>

            <div className="flex items-center gap-1 mx-2 text-xs font-semibold">
              <span>{currentPage}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl h-9 px-3 text-xs"
            >
              Баъдӣ <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Detail Modal */}
        <TajikNameDetailDialog
          name={selectedName}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </main>
    </div>
  );
};

export default TajikNames;
