import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Volume2,
  Gauge,
  UserCheck,
  Play,
  Sparkles,
  Sliders,
  Radio,
  Clock,
  BookOpen,
  VolumeX,
  Filter,
  Users,
  User,
  Star,
} from "lucide-react";
import { AudioReaderSettings } from "@/hooks/useTajikAudioReader";
import { VoicePreset, SpeechReadingMode, speakName } from "@/lib/tts";
import { TajikRegistryName } from "@/data/tajikTypes";
import { TAJIK_ALPHABET } from "@/data/tajikRegistry";

type GenderScope = "all" | "male" | "female";
type EnrichedScope = "all" | "enriched" | "pending";

interface TajikAudioSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AudioReaderSettings;
  onUpdateSettings: (newSettings: Partial<AudioReaderSettings>) => void;
  allNames: TajikRegistryName[];
  initialGender?: GenderScope;
  initialLetter?: string;
  itemsPerPage?: number;
  availableVoices: SpeechSynthesisVoice[];
  onStartReading: (scopedNames: TajikRegistryName[], startPage: number, endPage: number) => void;
  sampleName?: TajikRegistryName;
}

export function TajikAudioSettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  allNames,
  initialGender = "all",
  initialLetter = "all",
  itemsPerPage = 36,
  availableVoices,
  onStartReading,
  sampleName,
}: TajikAudioSettingsDialogProps) {
  // Local Filter Scope State
  const [selectedGender, setSelectedGender] = useState<GenderScope>(initialGender);
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter);
  const [selectedEnriched, setSelectedEnriched] = useState<EnrichedScope>("all");

  // Sync initial props when opened
  useEffect(() => {
    if (open) {
      setSelectedGender(initialGender);
      setSelectedLetter(initialLetter);
    }
  }, [open, initialGender, initialLetter]);

  // Compute filtered list based on audio dialog filters
  const filteredList = useMemo(() => {
    return allNames.filter((item) => {
      if (selectedGender !== "all" && item.gender !== selectedGender) {
        return false;
      }
      if (selectedLetter !== "all" && item.letter.toUpperCase() !== selectedLetter.toUpperCase()) {
        return false;
      }
      if (selectedEnriched === "enriched" && !item.is_enriched) {
        return false;
      }
      if (selectedEnriched === "pending" && item.is_enriched) {
        return false;
      }
      return true;
    });
  }, [allNames, selectedGender, selectedLetter, selectedEnriched]);

  // Dynamic total pages for this filter
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));

  // Local Page Range State
  const [localStartPage, setLocalStartPage] = useState<number>(1);
  const [localEndPage, setLocalEndPage] = useState<number>(totalPages);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Recalculate end page whenever totalPages shrinks/expands
  useEffect(() => {
    setLocalStartPage(1);
    setLocalEndPage(totalPages);
  }, [totalPages]);

  // Counts for Badges
  const genderCounts = useMemo(() => {
    return {
      all: allNames.length,
      male: allNames.filter((n) => n.gender === "male").length,
      female: allNames.filter((n) => n.gender === "female").length,
    };
  }, [allNames]);

  // Group system voices by language
  const categorizedVoices = useMemo(() => {
    const english = availableVoices.filter((v) => v.lang.startsWith("en"));
    const persian = availableVoices.filter((v) => v.lang.startsWith("fa"));
    const arabic = availableVoices.filter((v) => v.lang.startsWith("ar"));
    const russian = availableVoices.filter((v) => v.lang.startsWith("ru"));
    const others = availableVoices.filter(
      (v) =>
        !v.lang.startsWith("en") &&
        !v.lang.startsWith("fa") &&
        !v.lang.startsWith("ar") &&
        !v.lang.startsWith("ru")
    );

    return { english, persian, arabic, russian, others };
  }, [availableVoices]);

  // Voice presets config with English/Latin on top as recommended
  const voicePresets: {
    id: VoicePreset;
    title: string;
    sub: string;
    flag: string;
    badge: string;
    isRecommended?: boolean;
    description: string;
  }[] = [
    {
      id: "english",
      title: "Англисӣ / Латинӣ (Романджи)",
      sub: "Latin Passport (Samantha / Google / Siri)",
      flag: "🇬🇧",
      badge: "⭐ Тавсияшаванда (100% равшан)",
      isRecommended: true,
      description: "Дикторони олии англисӣ овонавишти лотинии номҳоро (passport Latin) 100% ҳарф ба ҳарф бе партофтани ҳарфҳои тоҷикӣ мехонанд",
    },
    {
      id: "auto",
      title: "Худкор (Автоподбор)",
      sub: "Оптималӣ барои номҳо",
      flag: "🤖",
      badge: "Системавӣ",
      description: "Интихоби худкори овози беҳтарини мавҷуда дар компютер ё телефони шумо",
    },
    {
      id: "persian",
      title: "Форсӣ / Персидский",
      sub: "Farsi (fa-IR)",
      flag: "🇮🇷",
      badge: categorizedVoices.persian.length > 0 ? "Дар дастгоҳ ҳаст" : "Аутентикӣ",
      description: "Талаффузи шарқӣ ва оҳангдор барои номҳои форсӣ ва тоҷикӣ",
    },
    {
      id: "arabic",
      title: "Арабӣ / Арабский",
      sub: "Arabic (ar-SA)",
      flag: "🇸🇦",
      badge: categorizedVoices.arabic.length > 0 ? "Дар дастгоҳ ҳаст" : "Исломӣ",
      description: "Хониши махориҷи ҳуруф барои номҳои решаи арабӣ",
    },
    {
      id: "russian",
      title: "Русӣ / Кириллӣ",
      sub: "Cyrillic (ru-RU)",
      flag: "🇷🇺",
      badge: categorizedVoices.russian.length > 0 ? "Дар дастгоҳ ҳаст" : "Кириллӣ",
      description: "Хониши кириллии тоҷикӣ (барои баъзе ҳарфҳои махсус маҳдудият дорад)",
    },
  ];

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    const testName = sampleName?.name_latin || sampleName?.name_tj || "Abirafshon";
    const testText =
      settings.voicePreset === "english"
        ? `${testName}. Meaning: ${sampleName?.meaning || "National official name"}`
        : sampleName
        ? `Номи расмӣ: ${sampleName.name_tj}. ${sampleName.meaning ? "Маъно: " + sampleName.meaning : ""}`
        : "Ассалому алайкум! Номи зебо ва расмии тоҷикӣ бо маъно ва талаффузи дуруст.";

    speakName(testText, settings.voicePreset === "english" ? "en-US" : "ru-RU", {
      rate: settings.speed,
      pitch: settings.pitch,
      volume: settings.volume,
      onEnd: () => setIsTestingVoice(false),
      onError: () => setIsTestingVoice(false),
    });
  };

  const handleStart = () => {
    const sPage = Math.max(1, Math.min(localStartPage, totalPages));
    const ePage = Math.min(totalPages, Math.max(sPage, localEndPage));

    onUpdateSettings({
      startPage: sPage,
      endPage: ePage,
    });

    onStartReading(filteredList, sPage, ePage);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-emerald-500/20 p-6 sm:p-8">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black font-display text-foreground">
              Танзимоти хониши худкор (Аудиохонӣ)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Филтри номҳо (писарона/духтарона), диктор (овози равшани лотинӣ/англисӣ, форсӣ, арабӣ), суръат аз 0.25x ва баландиро танзим кунед.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3 text-sm">
          {/* SECTION 1: GENDER & SCOPE FILTERS */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-card via-background to-secondary/30 border border-border space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-emerald-500" />
                Филтри хониш (Интихоби ҷинс ва категория):
              </Label>
              <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                {filteredList.length} ном интихоб шуд
              </Badge>
            </div>

            {/* Gender Selection Chips */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedGender("all")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedGender === "all"
                    ? "bg-primary text-primary-foreground border-transparent shadow-sm scale-[1.02]"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>Ҳамаи номҳо</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">({genderCounts.all})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGender("male")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedGender === "male"
                    ? "bg-sky-600 text-white border-transparent shadow-sm scale-[1.02]"
                    : "bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20"
                }`}
              >
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Писарона (♂)</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">({genderCounts.male})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGender("female")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  selectedGender === "female"
                    ? "bg-rose-600 text-white border-transparent shadow-sm scale-[1.02]"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                }`}
              >
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Духтарона (♀)</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">({genderCounts.female})</span>
              </button>
            </div>

            {/* Sub-Filters: Letter & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium text-[11px]">Ҳарф:</span>
                <select
                  value={selectedLetter}
                  onChange={(e) => setSelectedLetter(e.target.value)}
                  className="h-8 px-2 rounded-lg bg-card border border-border text-xs text-foreground font-semibold focus:outline-none"
                >
                  <option value="all">Ҳамаи ҳарфҳо (А-Я)</option>
                  {TAJIK_ALPHABET.map((l) => (
                    <option key={l} value={l}>
                      Ҳарфи {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium text-[11px]">Шарҳи маъно:</span>
                <select
                  value={selectedEnriched}
                  onChange={(e) => setSelectedEnriched(e.target.value as EnrichedScope)}
                  className="h-8 px-2 rounded-lg bg-card border border-border text-xs text-foreground font-semibold focus:outline-none"
                >
                  <option value="all">Ҳамаи номҳо</option>
                  <option value="enriched">Танҳо бо маълумот</option>
                  <option value="pending">Интизори такмил</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Page Range (Откуда и до куда читать) */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                Диапазони хониш (Саҳифаҳо):
              </Label>
              <span className="text-[11px] text-muted-foreground font-medium">
                {totalPages} саҳифа барои интихоби ҷорӣ ({filteredList.length} ном)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Саҳифаи оғоз:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {localStartPage}
                  </span>
                </div>
                <Slider
                  value={[localStartPage]}
                  min={1}
                  max={totalPages}
                  step={1}
                  onValueChange={(val) => {
                    const next = val[0];
                    setLocalStartPage(next);
                    if (next > localEndPage) setLocalEndPage(next);
                  }}
                  className="py-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Саҳифаи интиҳо:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {localEndPage}
                  </span>
                </div>
                <Slider
                  value={[localEndPage]}
                  min={1}
                  max={totalPages}
                  step={1}
                  onValueChange={(val) => {
                    const next = val[0];
                    setLocalEndPage(next);
                    if (next < localStartPage) setLocalStartPage(next);
                  }}
                  className="py-1"
                />
              </div>
            </div>

            {/* Quick Presets for Pages */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] text-muted-foreground">Интихоби фаврӣ:</span>
              <button
                type="button"
                onClick={() => {
                  setLocalStartPage(1);
                  setLocalEndPage(totalPages);
                }}
                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-emerald-500/10 hover:text-emerald-600 text-[11px] font-semibold transition-colors"
              >
                Аз аввал то охир (1 .. {totalPages})
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalEndPage(Math.min(totalPages, localStartPage + 4));
                }}
                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-emerald-500/10 hover:text-emerald-600 text-[11px] font-semibold transition-colors"
              >
                +5 саҳифа
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalEndPage(Math.min(totalPages, localStartPage + 9));
                }}
                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-emerald-500/10 hover:text-emerald-600 text-[11px] font-semibold transition-colors"
              >
                +10 саҳифа
              </button>
            </div>
          </div>

          {/* SECTION 3: Voice & Speaker Preset */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-500" />
                Интихоби диктор ва лаҳҷа (Голос):
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {availableVoices.length} овози дастрас дар система
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {voicePresets.map((preset) => {
                const isSelected = settings.voicePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onUpdateSettings({
                        voicePreset: preset.id,
                        selectedVoiceUri: "auto",
                      });
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm ring-2 ring-emerald-500/50"
                        : preset.isRecommended
                        ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60"
                        : "bg-card border-border/80 hover:border-emerald-500/40 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{preset.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-foreground">{preset.title}</h4>
                          </div>
                          <span className="text-[10px] text-muted-foreground block">{preset.sub}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-emerald-600 text-white border-transparent"
                            : preset.isRecommended
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {preset.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Optional Specific Voice Selector from System */}
            {availableVoices.length > 0 && (
              <div className="pt-2">
                <Label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Ё овози мушаххаси системаро интихоб кунед:
                </Label>
                <select
                  value={settings.selectedVoiceUri}
                  onChange={(e) => {
                    onUpdateSettings({
                      selectedVoiceUri: e.target.value,
                      voicePreset: e.target.value === "auto" ? settings.voicePreset : "system",
                    });
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="auto">✨ Худкор мувофиқи танзимоти боло</option>
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang}) {v.default ? "— [Пешфарз]" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SECTION 4: Speed (0.25x - 2.0x), Volume, Pitch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-card border border-border">
            {/* Speed Control */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-primary" />
                  Суръати хониш (Скорость):
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                  {settings.speed.toFixed(2)}x
                </span>
              </div>
              <Slider
                value={[settings.speed]}
                min={0.25}
                max={1.75}
                step={0.05}
                onValueChange={(val) => onUpdateSettings({ speed: val[0] })}
                className="py-1"
              />
              {/* Quick speed buttons including 0.25x and 0.5x */}
              <div className="flex flex-wrap items-center gap-1 pt-1">
                {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onUpdateSettings({ speed: spd })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                      Math.abs(settings.speed - spd) < 0.01
                        ? "bg-emerald-600 text-white border-transparent"
                        : "bg-secondary text-muted-foreground hover:text-foreground border-border/80"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  {settings.volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-emerald-500" />
                  )}
                  Баландии овоз (Громкость):
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.volume]}
                min={0.0}
                max={1.0}
                step={0.05}
                onValueChange={(val) => onUpdateSettings({ volume: val[0] })}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>0% (Хомӯш)</span>
                <span>50%</span>
                <span>100% (Пурра)</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Reading Mode & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reading Mode */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Тарзи хониш (Режим):
              </Label>
              <div className="space-y-1.5">
                {[
                  { id: "name_only", label: "Танҳо ном", desc: "«Abirafshon»" },
                  { id: "name_meaning", label: "Ном ва маъно", desc: "«Abirafshon. Meaning: ...»" },
                  { id: "full", label: "Хониши пурра", desc: "«Number 1. Abirafshon. Male name...»" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onUpdateSettings({ mode: m.id as SpeechReadingMode })}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      settings.mode === m.id
                        ? "bg-emerald-500/10 border-emerald-500 font-bold text-foreground"
                        : "bg-background border-border/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-[10px] opacity-70 italic">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pause & Toggles */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Таваққуф байни номҳо:
                </Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { ms: 300, label: "0.3с" },
                    { ms: 700, label: "0.7с" },
                    { ms: 1200, label: "1.2с" },
                    { ms: 2000, label: "2.0с" },
                  ].map((p) => (
                    <button
                      key={p.ms}
                      type="button"
                      onClick={() => onUpdateSettings({ pauseBetween: p.ms })}
                      className={`h-8 rounded-lg text-xs font-semibold border transition-all ${
                        settings.pauseBetween === p.ms
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Худкор варақ задани саҳифа:</span>
                  <Switch
                    checked={settings.autoFlipPage}
                    onCheckedChange={(checked) => onUpdateSettings({ autoFlipPage: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Пайгирии карточка (Scroll):</span>
                  <Switch
                    checked={settings.autoScroll}
                    onCheckedChange={(checked) => onUpdateSettings({ autoScroll: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestVoice}
            disabled={isTestingVoice}
            className="h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 border-border"
          >
            <Radio className={`h-4 w-4 ${isTestingVoice ? "text-emerald-500 animate-pulse" : ""}`} />
            <span>{isTestingVoice ? "Овоз санҷида мешавад..." : "Санҷиши овоз (Тест)"}</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-11 px-4 rounded-xl text-xs"
            >
              Бекор кардан
            </Button>
            <Button
              type="button"
              onClick={handleStart}
              className="h-11 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 flex-1 sm:flex-initial"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>
                Оғоз ({selectedGender === "male" ? "♂ Писарона" : selectedGender === "female" ? "♀ Духтарона" : "Ҳама"}: {localStartPage}..{localEndPage})
              </span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
