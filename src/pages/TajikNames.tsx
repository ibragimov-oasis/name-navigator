import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { TAJIK_ALPHABET, checkTajikNameLegality, tajikNameSlug, TAJIK_REGISTRY_DECREE } from "@/data/tajikRegistry";
import { useTajikRegistry, useDebouncedValue } from "@/hooks/useTajikRegistry";
import { hasRareLetters, countSyllables } from "@/lib/tajik/text";
import { TajikCardsSkeleton, TajikFiltersSkeleton, TajikRegistryError } from "@/components/tajik/TajikRegistrySkeleton";
import { TajikFioChecker } from "@/components/tajik/TajikFioChecker";
import { TajikRegistryName, NameCheckResult } from "@/data/tajikTypes";
import { TajikNameDetailDialog } from "@/components/TajikNameDetailDialog";
import { TajikCertificateDialog } from "@/components/TajikCertificateDialog";
import { TajikRandomGeneratorDialog } from "@/components/TajikRandomGeneratorDialog";
import { TajikAudioSettingsDialog } from "@/components/TajikAudioSettingsDialog";
import { TajikAudioPlayerBar } from "@/components/TajikAudioPlayerBar";
import { useTajikAudioReader } from "@/hooks/useTajikAudioReader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavorites } from "@/lib/favorites";
import { speakName } from "@/lib/tts";
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
  Check,
  Volume2,
  Dices,
  FileText,
  Scale,
  BarChart3,
  HelpCircle,
  Share2,
  ExternalLink,
  Flame,
  Star,
  Headphones,
  Play,
  Pause,
  Radio,
  UserSquare2,
  Filter,

} from "lucide-react";

type GenderFilter = "all" | "male" | "female";
type EnrichedFilter = "all" | "enriched" | "pending";
type ViewMode = "grid" | "table";
type SortOrder = "num-asc" | "alpha-asc" | "alpha-desc" | "length-asc" | "length-desc";
type ActiveTab = "catalog" | "checker" | "fio" | "analytics" | "legal";
type LengthFilter = "all" | "short" | "medium" | "long";

const ITEMS_PER_PAGE = 36;
const VALID_TABS: readonly ActiveTab[] = ["catalog", "checker", "fio", "analytics", "legal"];

const TajikNames = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- Состояние, синхронизированное с URL (шэрится ссылкой) ----
  const activeTab = (VALID_TABS.includes(searchParams.get("tab") as ActiveTab)
    ? (searchParams.get("tab") as ActiveTab)
    : "catalog");
  const search = searchParams.get("q") ?? "";
  const selectedGender = (["all", "male", "female"].includes(searchParams.get("gender") ?? "")
    ? (searchParams.get("gender") as GenderFilter)
    : "all");
  const selectedLetter = searchParams.get("letter") ?? "all";
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const patchParams = useCallback(
    (patch: Record<string, string | null>, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === "" || value === "all") next.delete(key);
            else next.set(key, value);
          }
          if (resetPage && !("page" in patch)) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setActiveTab = useCallback((tab: ActiveTab) => patchParams({ tab: tab === "catalog" ? null : tab }, false), [patchParams]);
  const setSearch = useCallback((value: string) => patchParams({ q: value }), [patchParams]);
  const setSelectedGender = useCallback((value: GenderFilter) => patchParams({ gender: value }), [patchParams]);
  const setSelectedLetter = useCallback((value: string) => patchParams({ letter: value }), [patchParams]);
  const setCurrentPage = useCallback(
    (updater: number | ((p: number) => number)) => {
      const value = typeof updater === "function" ? updater(currentPage) : updater;
      patchParams({ page: value <= 1 ? null : String(value) }, false);
    },
    [patchParams, currentPage]
  );

  // ---- Локальное состояние ----
  const [selectedEnriched, setSelectedEnriched] = useState<EnrichedFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("num-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>("all");
  const [rareOnly, setRareOnly] = useState(false);

  // Checker tool state
  const [checkerQuery, setCheckerQuery] = useState("");
  const [checkResult, setCheckResult] = useState<NameCheckResult | null>(null);

  // Detail & Certificate & Generator Dialog states
  const [selectedName, setSelectedName] = useState<TajikRegistryName | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { names: tajikRegistryNames, loading, error, reload, counts, alphabetStats } = useTajikRegistry();

  const debouncedSearch = useDebouncedValue(search, 200);

  // Открытие имени по пермалинку ?name=<slug>
  const nameSlug = searchParams.get("name");
  useEffect(() => {
    if (!nameSlug || tajikRegistryNames.length === 0) return;
    const target = tajikRegistryNames.find((n) => tajikNameSlug(n) === nameSlug.toLowerCase());
    if (target) {
      setSelectedName(target);
      setDetailOpen(true);
    }
  }, [nameSlug, tajikRegistryNames]);

  // Filtered & sorted names
  const filteredNames = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

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
      // Умный фильтр по длине имени
      if (lengthFilter !== "all") {
        const len = item.name_tj.length;
        if (lengthFilter === "short" && len > 5) return false;
        if (lengthFilter === "medium" && (len < 6 || len > 8)) return false;
        if (lengthFilter === "long" && len < 9) return false;
      }
      // Только имена с редкими таджикскими буквами
      if (rareOnly && !hasRareLetters(item.name_tj)) {
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
      if (sortOrder === "length-asc") {
        return a.name_tj.length - b.name_tj.length;
      }
      if (sortOrder === "length-desc") {
        return b.name_tj.length - a.name_tj.length;
      }
      return a.num - b.num;
    });
  }, [tajikRegistryNames, debouncedSearch, selectedGender, selectedLetter, selectedEnriched, lengthFilter, rareOnly, sortOrder]);

  // Total pages
  const totalPages = Math.ceil(filteredNames.length / ITEMS_PER_PAGE) || 1;

  // Страница не должна выходить за пределы результата
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages, setCurrentPage]);


  // Audio Reader Hook Integration
  const {
    isPlaying: isAudioPlaying,
    isPaused: isAudioPaused,
    currentIndex: audioCurrentIndex,
    currentName: audioCurrentName,
    totalCount: audioTotalCount,
    progress: audioProgress,
    settings: audioSettings,
    activeVoice,
    availableVoices,
    isAudioSettingsOpen,
    setIsAudioSettingsOpen,
    startReading,
    startReadingPages,
    pause: pauseAudio,
    resume: resumeAudio,
    togglePlay: toggleAudioPlay,
    stop: stopAudio,
    next: nextAudio,
    previous: prevAudio,
    skip: skipAudio,
    updateSettings: updateAudioSettings,
  } = useTajikAudioReader({
    itemsPerPage: ITEMS_PER_PAGE,
    onPageChange: (newPage) => {
      setCurrentPage(newPage);
    },
  });

  const paginatedNames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNames, currentPage]);

  const handleRunChecker = (overrideQuery?: string) => {
    const target = (overrideQuery ?? checkerQuery).trim();
    if (!target) {
      setCheckResult(null);
      return;
    }
    const res = checkTajikNameLegality(target, tajikRegistryNames);
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

  const handleSpeakCard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakName(text, "ru-RU");
  };

  // Start reading from a specific card index in current filtered list
  const handleStartAudioFromCard = (e: React.MouseEvent, nameItem: TajikRegistryName) => {
    e.stopPropagation();
    const indexInFiltered = filteredNames.findIndex((n) => n.id === nameItem.id);
    if (indexInFiltered !== -1) {
      startReading(filteredNames, indexInFiltered);
      toast.info(`Хониш аз номи «${nameItem.name_tj}» сар шуд`);
    }
  };

  // Поделиться текущей выборкой (фильтры уже в URL)
  const handleShareView = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title: "Феҳристи номҳои миллии тоҷикӣ", url });
      return;
    }
    navigator.clipboard.writeText(url);
    toast.success("Пайванд нусхабардорӣ шуд");
  }, []);

  const openName = useCallback(
    (item: TajikRegistryName) => {
      setSelectedName(item);
      setDetailOpen(true);
      patchParams({ name: tajikNameSlug(item) }, false);
    },
    [patchParams]
  );

  useEffect(() => {
    if (!detailOpen) patchParams({ name: null }, false);
  }, [detailOpen, patchParams]);


  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/20 pb-36 sm:pb-28">
      <SEO
        title="Феҳристи номҳои миллии тоҷикӣ 2026 — реестр разрешённых имён Таджикистана"
        description={`Официальный реестр национальных имён Таджикистана: ${counts.total || 3461} имён, проверка имени для ЗАГС, значения, транслитерация и правила ФИО. ${TAJIK_REGISTRY_DECREE}.`}
        canonical={typeof window !== "undefined" ? `${window.location.origin}/tajik-names` : undefined}
      />
      <Header />


      {/* Detail Dialog */}
      <TajikNameDetailDialog
        name={selectedName}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Certificate Extract Dialog */}
      <TajikCertificateDialog
        name={selectedName}
        open={certOpen}
        onOpenChange={setCertOpen}
      />

      {/* Random Generator Dialog */}
      <TajikRandomGeneratorDialog
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        onSelectName={(name) => {
          setSelectedName(name);
          setDetailOpen(true);
        }}
      />

      {/* TTS Audio Reader Settings Dialog */}
      <TajikAudioSettingsDialog
        open={isAudioSettingsOpen}
        onOpenChange={setIsAudioSettingsOpen}
        settings={audioSettings}
        onUpdateSettings={updateAudioSettings}
        allNames={tajikRegistryNames}
        initialGender={selectedGender}
        initialLetter={selectedLetter}
        itemsPerPage={ITEMS_PER_PAGE}
        availableVoices={availableVoices}
        onStartReading={(scopedNames, startPage, endPage) => {
          startReadingPages(scopedNames, startPage, endPage);
        }}
        sampleName={selectedName || paginatedNames[0]}
      />

      {/* Floating Docked Audio Player Bar */}
      <TajikAudioPlayerBar
        isPlaying={isAudioPlaying}
        isPaused={isAudioPaused}
        currentName={audioCurrentName}
        currentIndex={audioCurrentIndex}
        totalCount={audioTotalCount}
        progress={audioProgress}
        settings={audioSettings}
        activeVoice={activeVoice}
        onTogglePlay={toggleAudioPlay}
        onStop={stopAudio}
        onNext={nextAudio}
        onPrevious={prevAudio}
        onSkip={skipAudio}
        onUpdateSettings={updateAudioSettings}
        onOpenSettings={() => setIsAudioSettingsOpen(true)}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-secondary/30 p-4 sm:p-8 md:p-10 mb-6 sm:mb-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] sm:text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                Тасдиқшуда бо Қарори Ҳукумати ҶТ №98
              </div>
              <Badge variant="outline" className="text-[10px] sm:text-xs bg-background/80 border-border">
                Моддаи 20¹ Қонуни САҲШ
              </Badge>
              {isAudioPlaying && (
                <Badge className="bg-emerald-600 text-white text-[10px] sm:text-xs animate-pulse font-bold flex items-center gap-1">
                  <Radio className="h-3 w-3" />
                  Хониши овозӣ фаъол аст
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-display">
              Феҳристи номҳои миллии тоҷикӣ
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed">
              Ягона феҳристи расмии номҳои миллии тасдиқшуда ва иҷозатдодашудаи Тоҷикистон.
              Танҳо номҳои ин феҳрист барои сабти асноди ҳолати шаҳрвандӣ (САҲШ / ЗАГС) ва шиноснома иҷозат доранд.
            </p>

            {/* Quick Stats Badges & Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                <div className="px-3 py-2 rounded-xl bg-card border border-border/80 text-xs font-medium flex items-center gap-2 shadow-sm">
                  <span className="font-bold text-foreground text-sm">{counts.total.toLocaleString()}</span>
                  <span className="text-muted-foreground text-[11px]">ҳамагӣ</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-medium flex items-center gap-2">
                  <span className="font-bold text-sm">{counts.male.toLocaleString()}</span>
                  <span className="text-[11px]">писарона</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <span className="font-bold text-sm">{counts.female.toLocaleString()}</span>
                  <span className="text-[11px]">духтарона</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <span className="font-bold text-sm">{counts.enriched.toLocaleString()}</span>
                  <span className="text-[11px]">бо маъно</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Audio Reader Launch Button */}
                <Button
                  onClick={() => {
                    if (isAudioPlaying) {
                      toggleAudioPlay();
                    } else {
                      setIsAudioSettingsOpen(true);
                    }
                  }}
                  className={`rounded-xl font-bold text-xs h-10 px-3.5 flex items-center justify-center gap-1.5 shadow-md transition-all ${
                    isAudioPlaying
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400"
                      : "bg-card border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                  }`}
                >
                  <Headphones className="h-4 w-4 text-emerald-500" />
                  <span>{isAudioPlaying ? (isAudioPaused ? "Идомаи аудио" : "Таваққуфи аудио") : "🎧 Автохониш (TTS)"}</span>
                </Button>

                <Button
                  onClick={() => setGeneratorOpen(true)}
                  className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-10 px-3.5 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Dices className="h-4 w-4" />
                  <span>Интихоби тасодуфӣ</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-Tools Tabs Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 border-b border-border/60 overflow-x-auto pb-2 scrollbar-none touch-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: "catalog", label: "Каталог ва Ҷустуҷӯ", icon: Search, count: counts.total },
              { id: "audio", label: "Аудиохонӣ (TTS)", icon: Headphones, badge: "Овозӣ" },
              { id: "checker", label: "Санҷиши ном (ЗАГС)", icon: Scale, badge: "Муҳим" },
              { id: "fio", label: "Санҷиши НИН (ФИО)", icon: UserSquare2, badge: "Нав" },
              { id: "generator", label: "Генератори ном", icon: Dices },
              { id: "analytics", label: "Инфографика ва таҳлил", icon: BarChart3 },
              { id: "legal", label: "Қонунгузорӣ ва қоидаҳо", icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "generator") {
                      setGeneratorOpen(true);
                    } else if (tab.id === "audio") {
                      setIsAudioSettingsOpen(true);
                    } else {
                      setActiveTab(tab.id as ActiveTab);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"}`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ошибка загрузки реестра */}
        {error && <TajikRegistryError message={error} onRetry={reload} />}

        {/* Скелетон первичной загрузки */}
        {loading && !error && activeTab === "catalog" && (
          <>
            <TajikFiltersSkeleton />
            <TajikCardsSkeleton count={12} />
          </>
        )}

        {/* TAB 1: CATALOG */}
        {activeTab === "catalog" && !loading && !error && (
          <>

            {/* Quick Check & Audio Play Mini-Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Хониши худкори номҳо (Аудиоплеер)</h2>
                  <p className="text-xs text-muted-foreground">
                    Номҳоро пайдарпай бо овози форсӣ, арабӣ ё русӣ аз дилхоҳ саҳифа то ба охир гӯш кунед
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => setIsAudioSettingsOpen(true)}
                  className="h-9 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Танзими аудиоплеер</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab("checker")}
                  className="h-9 px-3 rounded-xl text-xs font-semibold border-border text-foreground hover:bg-secondary"
                >
                  Санҷиши ном
                </Button>
              </div>
            </div>

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

              <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto gap-1.5 p-2 rounded-2xl bg-card border border-border scrollbar-none touch-scroll -mx-4 px-4 sm:mx-0 sm:px-2">
                <Button
                  variant={selectedLetter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedLetter("all")}
                  className={`h-9 px-3 text-xs rounded-xl font-semibold transition-all shrink-0 ${
                    selectedLetter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
                    className={`h-9 min-w-[38px] px-2 text-xs rounded-xl font-bold transition-all flex items-center gap-1 shrink-0 ${
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
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto] gap-2.5 items-center">
                {/* Live Search Input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ҷустуҷӯ аз рӯи навишти тоҷикӣ, русӣ, лотинӣ ё маъно..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-card border-border text-xs sm:text-sm"
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
                  className="w-full sm:w-auto"
                >
                  <TabsList className="h-11 w-full sm:w-auto grid grid-cols-3 sm:flex rounded-xl bg-card border border-border p-1">
                    <TabsTrigger value="all" className="rounded-lg text-[11px] sm:text-xs font-semibold px-2">
                      Ҳама ({counts.total})
                    </TabsTrigger>
                    <TabsTrigger value="male" className="rounded-lg text-[11px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 px-2">
                      Писарона ({counts.male})
                    </TabsTrigger>
                    <TabsTrigger value="female" className="rounded-lg text-[11px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 px-2">
                      Духтарона ({counts.female})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Export CSV Button */}
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-11 px-4 rounded-xl text-xs font-semibold items-center gap-2 border-border bg-card hover:bg-secondary text-foreground"
                >
                  <Download className="h-4 w-4 text-primary" />
                  <span>Экспорт CSV</span>
                </Button>
              </div>

              {/* Умные фильтры и быстрые пресеты */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" /> Филтрҳои зирак:
                </span>
                {([
                  { id: "all", label: "Ҳар дарозӣ" },
                  { id: "short", label: "Кӯтоҳ (≤5)" },
                  { id: "medium", label: "Миёна (6–8)" },
                  { id: "long", label: "Дароз (9+)" },
                ] as const).map((opt) => (
                  <Button
                    key={opt.id}
                    variant={lengthFilter === opt.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setLengthFilter(opt.id)}
                    className="h-7 text-xs rounded-lg px-2"
                  >
                    {opt.label}
                  </Button>
                ))}
                <Button
                  variant={rareOnly ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setRareOnly((v) => !v)}
                  className="h-7 text-xs rounded-lg px-2"
                  title="Танҳо номҳо бо ҳарфҳои хоси тоҷикӣ: Ғ Қ Ҷ Ӯ Ӣ Ҳ"
                >
                  Ҳарфҳои хос (Ғ Қ Ҷ Ӯ Ӣ Ҳ)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareView}
                  className="h-7 text-xs rounded-lg px-2 gap-1.5 text-primary"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Мубодилаи ҷустуҷӯ
                </Button>
                {(lengthFilter !== "all" || rareOnly || selectedLetter !== "all" || search || selectedGender !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLengthFilter("all");
                      setRareOnly(false);
                      setSelectedEnriched("all");
                      patchParams({ q: null, gender: null, letter: null, page: null });
                    }}
                    className="h-7 text-xs rounded-lg px-2 text-muted-foreground"
                  >
                    Тоза кардани филтрҳо
                  </Button>
                )}
              </div>



              {/* Secondary Sub-filters & View Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-border/50 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground font-medium text-[11px]">Ҳолат:</span>
                  <Button
                    variant={selectedEnriched === "all" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedEnriched("all")}
                    className="h-7 text-xs rounded-lg px-2"
                  >
                    Ҳама
                  </Button>
                  <Button
                    variant={selectedEnriched === "enriched" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedEnriched("enriched")}
                    className="h-7 text-xs rounded-lg px-2 text-emerald-600 dark:text-emerald-400"
                  >
                    Бо маълумот ({counts.enriched})
                  </Button>
                  <Button
                    variant={selectedEnriched === "pending" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedEnriched("pending")}
                    className="h-7 text-xs rounded-lg px-2 text-amber-600 dark:text-amber-400"
                  >
                    Интизор ({counts.total - counts.enriched})
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
                      <option value="length-asc">Аз рӯи дарозии ном (кӯтоҳ)</option>
                      <option value="length-desc">Аз рӯи дарозии ном (дароз)</option>
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
                  const isCurrentlyPlaying = audioCurrentName?.id === item.id;

                  return (
                    <Card
                      key={item.id}
                      id={`name-card-${item.id}`}
                      onClick={() => openName(item)}
                      className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-card hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${
                        isCurrentlyPlaying
                          ? "border-emerald-500 shadow-xl shadow-emerald-500/20 bg-emerald-500/5 ring-2 ring-emerald-500/50"
                          : "border-border/80"
                      }`}
                    >
                      <CardContent className="p-4 sm:p-5 space-y-3">
                        {/* Top Row: Gender Badge + Number + Favorite + Audio Actions */}
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
                            <span className="text-[11px] font-mono text-muted-foreground">
                              №{item.num}
                            </span>
                            {isCurrentlyPlaying && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                                <Radio className="h-3 w-3" />
                                Овоз
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-0.5">
                            {/* Start Continuous Audio Reading from this item */}
                            <button
                              onClick={(e) => handleStartAudioFromCard(e, item)}
                              className={`p-1.5 rounded-full transition-colors ${
                                isCurrentlyPlaying
                                  ? "bg-emerald-600 text-white"
                                  : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                              }`}
                              title="Хониши худкорро аз ин ном оғоз кунед"
                            >
                              <Headphones className="h-3.5 w-3.5" />
                            </button>

                            {/* Quick single-speak button */}
                            <button
                              onClick={(e) => handleSpeakCard(e, item.name_tj)}
                              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title="Талаффузи ном"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Favorite */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite({
                                  id: item.id,
                                  name: item.name_tj,
                                  gender: item.gender,
                                  origin: item.origin || "Тоҷикӣ",
                                  culture: "Таджикская",
                                  meaning: item.meaning || "Официальное разрешённое таджикское имя",
                                  attributes: item.attributes || ["национальное", "официальное"],
                                  popularity: 90,
                                  history: item.legal_decree,
                                  languages: ["tg", "ru"]
                                });
                                toast.success(isFav ? "Аз мунтахаб хориҷ шуд" : "Ба мунтахаб илова шуд");
                              }}
                              className="p-1.5 rounded-full text-muted-foreground hover:text-rose hover:bg-rose-500/10 transition-colors"
                              title={isFav ? "Дар мунтахаб" : "Илова ба мунтахаб"}
                            >
                              <Heart
                                className={`h-4 w-4 transition-transform ${isFav ? "fill-rose text-rose scale-110" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Middle: Name in Tajik + Latin + Cyrillic */}
                        <div>
                          <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.name_tj}
                          </h2>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Лотинӣ: <strong className="font-medium text-foreground">{item.name_latin}</strong></span>
                            <span>•</span>
                            <span>Ҳарф: <strong>{item.letter}</strong></span>
                          </div>
                        </div>

                        {/* Meaning Preview or Fallback */}
                        <div className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                          {item.meaning ? (
                            <span className="text-foreground/90">{item.meaning}</span>
                          ) : (
                            <span className="italic opacity-60">Номи миллии расмӣ • Барои САҲШ тасдиқ шудааст</span>
                          )}
                        </div>

                        {/* Bottom Row: Badges & Quick Action */}
                        <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Қонунӣ
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedName(item);
                                setCertOpen(true);
                              }}
                              className="p-1 text-muted-foreground hover:text-emerald-600 transition-colors"
                              title="Санади САҲШ (Выписка)"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleCopyCard(e, item.name_tj, item.id)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                              title="Нусхабардорӣ"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card mb-8 shadow-sm">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-secondary/60 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="p-3.5 w-16">Т/Р</th>
                      <th className="p-3.5">Ном (Тоҷикӣ)</th>
                      <th className="p-3.5">Кириллӣ</th>
                      <th className="p-3.5">Лотинӣ</th>
                      <th className="p-3.5">Ҷинс</th>
                      <th className="p-3.5">Маъно</th>
                      <th className="p-3.5 text-right">Амалҳо</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedNames.map((item) => {
                      const isCurrentlyPlaying = audioCurrentName?.id === item.id;

                      return (
                        <tr
                          key={item.id}
                          id={`name-row-${item.id}`}
                          onClick={() => openName(item)}
                          className={`hover:bg-secondary/40 cursor-pointer transition-colors ${
                            isCurrentlyPlaying
                              ? "bg-emerald-500/10 border-l-4 border-l-emerald-500 font-medium"
                              : ""
                          }`}
                        >
                          <td className="p-3.5 font-mono text-muted-foreground">№{item.num}</td>
                          <td className="p-3.5 font-bold text-foreground text-base">
                            <div className="flex items-center gap-2">
                              <span>{item.name_tj}</span>
                              <button
                                onClick={(e) => handleStartAudioFromCard(e, item)}
                                className={`p-1 rounded-full ${
                                  isCurrentlyPlaying ? "text-emerald-600 animate-pulse" : "text-muted-foreground hover:text-foreground"
                                }`}
                                title="Аз ин ном сар карда гӯш кардан"
                              >
                                <Headphones className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5 text-muted-foreground">{item.name_cyrillic}</td>
                          <td className="p-3.5 font-medium text-foreground">{item.name_latin}</td>
                          <td className="p-3.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold ${
                                item.gender === "male"
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {item.gender_tj}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                            {item.meaning || "—"}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedName(item);
                                  setCertOpen(true);
                                }}
                                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-emerald-600"
                                title="Санади САҲШ"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleCopyCard(e, item.name_tj, item.id)}
                                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                                title="Нусхабардорӣ"
                              >
                                {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 rounded-xl text-xs border-border"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Қаблӣ
                </Button>

                <div className="flex items-center gap-1 text-xs font-semibold px-2">
                  <span>Саҳифаи {currentPage} аз {totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-3 rounded-xl text-xs border-border"
                >
                  Баъдӣ <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* TAB 2: NAME LEGALITY CHECKER */}
        {/* TAB: FIO (ФИО) CHECKER */}
        {activeTab === "fio" && !loading && !error && (
          <TajikFioChecker names={tajikRegistryNames} onOpenName={openName} />
        )}

        {activeTab === "checker" && !loading && !error && (
          <section className="space-y-6 max-w-3xl mx-auto py-4">
            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-md space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Scale className="h-6 w-6" />
                <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                  Санҷиши ном ба феҳристи расмӣ (Проверка имени в ЗАГС)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Тибқи қонунгузории Ҷумҳурии Тоҷикистон (Қарори №98 ва моддаи 20¹ Қонун дар бораи САҲШ), сабти номҳое, ки ба фарҳанги миллии тоҷикӣ бегонаанд ё дар феҳристи расмӣ вуҷуд надоранд, манъ аст. Номи дилхоҳро ворид кунед, то санҷед:
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Номро ворид кунед (масалан: Абирафшон, Абдуллоҳ, Сабрина, Фотима, Сомон)..."
                    value={checkerQuery}
                    onChange={(e) => {
                      setCheckerQuery(e.target.value);
                      if (!e.target.value.trim()) setCheckResult(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRunChecker();
                    }}
                    className="pl-10 h-12 rounded-xl bg-background text-sm"
                  />
                </div>
                <Button
                  onClick={() => handleRunChecker()}
                  className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-md"
                >
                  Санҷидан
                </Button>
              </div>

              {/* Sample Quick Searches */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>Намунаҳо:</span>
                {["Абдуллоҳ", "Фотима", "Рустам", "Заррина", "Сомон", "Фирӯз", "Мадина"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setCheckerQuery(ex);
                      handleRunChecker(ex);
                    }}
                    className="px-2 py-1 rounded-md bg-secondary hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Checker Result Box */}
              {checkResult && (
                <div
                  className={`mt-6 p-5 sm:p-6 rounded-2xl border transition-all animate-fade-in ${
                    checkResult.status === "permitted"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : checkResult.status === "likely"
                      ? "bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-100"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {checkResult.status === "permitted" ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : checkResult.status === "likely" ? (
                      <Info className="h-8 w-8 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-lg">
                          {checkResult.status === "permitted"
                            ? "✓ НОМ РАСМАН ИҶОЗАТ ДОДА ШУДААСТ"
                            : checkResult.status === "likely"
                            ? "≈ НОМИ НАЗДИК ДАР ФЕҲРИСТ ҲАСТ"
                            : "⚠ ДАР ФЕҲРИСТИ РАСМӢ ЁФТ НАШУД"}
                        </span>

                        {checkResult.exactMatch && (
                          <Badge className="text-xs bg-emerald-600 text-white font-bold">
                            №{checkResult.exactMatch.num} • {checkResult.exactMatch.gender_tj}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed">{checkResult.recommendation}</p>

                      {checkResult.exactMatch && (
                        <div className="p-3.5 rounded-xl bg-background/80 border border-border/60 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground block">Овонавишти дуруст барои шиноснома:</span>
                            <span className="font-bold text-foreground text-sm">
                              {checkResult.exactMatch.name_tj} / {checkResult.exactMatch.name_latin.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedName(checkResult.exactMatch!);
                                setCertOpen(true);
                              }}
                              className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Санади САҲШ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedName(checkResult.exactMatch!);
                                setDetailOpen(true);
                              }}
                              className="h-8 text-xs rounded-lg border-border"
                            >
                              Тафсилот
                            </Button>
                          </div>
                        </div>
                      )}

                      {checkResult.closeMatches.length > 0 && !checkResult.exactMatch && (
                        <div className="pt-3 border-t border-border/40 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider opacity-90">Вариантҳои наздиктарини расмӣ дар феҳрист:</p>
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
            </div>
          </section>
        )}

        {/* TAB 3: ANALYTICS & INFOGRAPHICS */}
        {activeTab === "analytics" && !loading && !error && (
          <section className="space-y-6 max-w-5xl mx-auto py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
                <span className="text-xs text-muted-foreground">Шумораи умумии номҳо</span>
                <div className="text-3xl font-black text-foreground font-display">{counts.total.toLocaleString()}</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">100% расман тасдиқшуда</p>
              </div>
              <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                <span className="text-xs text-sky-700 dark:text-sky-300">Номҳои писарона</span>
                <div className="text-3xl font-black text-sky-900 dark:text-sky-100 font-display">{counts.male.toLocaleString()}</div>
                <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">{Math.round((counts.male / counts.total) * 100)}% аз тамоми феҳрист</p>
              </div>
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-xs text-rose-700 dark:text-rose-300">Номҳои духтарона</span>
                <div className="text-3xl font-black text-rose-900 dark:text-rose-100 font-display">{counts.female.toLocaleString()}</div>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{Math.round((counts.female / counts.total) * 100)}% аз тамоми феҳрист</p>
              </div>
            </div>

            {/* Letter Frequency Chart */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground">
                Тақсимоти номҳо аз рӯи алифбои тоҷикӣ
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {alphabetStats.map((st) => {
                  return (
                    <div
                      key={st.letter}
                      onClick={() => {
                        setSelectedLetter(st.letter);
                        setActiveTab("catalog");
                      }}
                      className="p-3 rounded-xl bg-background border border-border/80 hover:border-primary hover:shadow-md cursor-pointer transition-all text-center space-y-1 group"
                    >
                      <span className="font-display text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                        {st.letter}
                      </span>
                      <div className="text-xs font-bold text-muted-foreground">
                        {st.count} ном
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                        <span className="text-sky-600 dark:text-sky-400">♂ {st.maleCount}</span>
                        <span>•</span>
                        <span className="text-rose-600 dark:text-rose-400">♀ {st.femaleCount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: LEGAL & RULES */}
        {activeTab === "legal" && (
          <section className="space-y-6 max-w-4xl mx-auto py-4">
            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm space-y-5">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-8 w-8" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    Асосҳои ҳуқуқӣ ва қоидаҳои номгузорӣ дар Тоҷикистон
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Қарори Ҳукумати Ҷумҳурии Тоҷикистон аз 26 феврали соли 2026, №98</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-foreground/90">
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-2">
                  <h4 className="font-bold text-foreground">1. Моддаи 20¹ Қонуни ҶТ дар бораи САҲШ:</h4>
                  <p>
                    Тибқи қонунгузорӣ ба ҳар як кӯдак бояд номи миллии тоҷикӣ мутобиқи арзишҳои фарҳангӣ ва анъанаҳои миллии халқи тоҷик гузошта шавад.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-2">
                  <h4 className="font-bold text-foreground">2. Номҳои мамнӯъ ва номатлуб:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Гузоштани номҳое, ки ба шаъну шарафи инсон паст мезананд (масалан номи ашё, ҳайвонот ва ғайра);</li>
                    <li>Гузоштани номҳое, ки ба фарҳанг ва забони миллӣ бегона мебошанд;</li>
                    <li>Номҳое, ки дорои маънои манфӣ ё таҳқиромез мебошанд.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-2">
                  <h4 className="font-bold text-foreground">3. Тартиби насаб ва номи падар:</h4>
                  <p>
                    Насаби кӯдак бо пасвандҳои миллии <strong>-зода</strong>, <strong>-зод</strong>, <strong>-ӣ</strong>, <strong>-пур</strong>, <strong>-духт</strong>, <strong>-фар</strong> ва ё бо номи падар бе пасванд ташаккул дода мешавад.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TajikNames;
