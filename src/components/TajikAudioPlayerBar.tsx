import { useState } from "react";
import { TajikRegistryName } from "@/data/tajikTypes";
import { AudioReaderSettings } from "@/hooks/useTajikAudioReader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  Sparkles,
  ChevronUp,
  ChevronDown,
  X,
  Radio,
  BookOpen,
} from "lucide-react";

interface TajikAudioPlayerBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentName: TajikRegistryName | null;
  currentIndex: number;
  totalCount: number;
  progress: number;
  settings: AudioReaderSettings;
  activeVoice: SpeechSynthesisVoice | null;
  onTogglePlay: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: (offset: number) => void;
  onUpdateSettings: (newSettings: Partial<AudioReaderSettings>) => void;
  onOpenSettings: () => void;
  currentPage: number;
  totalPages: number;
}

export function TajikAudioPlayerBar({
  isPlaying,
  isPaused,
  currentName,
  currentIndex,
  totalCount,
  progress,
  settings,
  activeVoice,
  onTogglePlay,
  onStop,
  onNext,
  onPrevious,
  onSkip,
  onUpdateSettings,
  onOpenSettings,
  currentPage,
  totalPages,
}: TajikAudioPlayerBarProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  // If nothing is playing and no active name, don't show the bar
  if (!isPlaying && !currentName) return null;

  // Voice Flag & Name resolver
  const getVoiceBadge = () => {
    if (settings.voicePreset === "english") return { flag: "🇬🇧", label: "Англисӣ (Латинӣ)" };
    if (settings.voicePreset === "persian") return { flag: "🇮🇷", label: "Форсӣ (fa-IR)" };
    if (settings.voicePreset === "arabic") return { flag: "🇸🇦", label: "Арабӣ (ar-SA)" };
    if (settings.voicePreset === "russian") return { flag: "🇷🇺", label: "Русӣ (ru-RU)" };
    if (settings.voicePreset === "system" && activeVoice) {
      return { flag: "🎙", label: activeVoice.name.slice(0, 14) };
    }
    return { flag: "🤖", label: "Худкор" };
  };

  const voiceInfo = getVoiceBadge();

  return (
    <aside
      aria-label="Аудиоплеери феҳристи номҳо"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl transition-all duration-300 ${
        isMinimized ? "translate-y-2" : ""
      }`}
    >
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-background/95 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/20">
        {/* Top Progress Line */}
        <div className="h-1.5 w-full bg-secondary/80 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Minimized Header Bar View */}
        {isMinimized ? (
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-3">
              {/* Dancing Wave Indicator */}
              <div className="flex items-end gap-0.5 h-4 w-5">
                {[40, 80, 50, 100].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full bg-emerald-500 transition-all ${
                      isPlaying && !isPaused ? "animate-pulse" : "opacity-40"
                    }`}
                    style={{ height: `${h}%`, animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>

              <div className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                <span>{currentName?.name_tj || "Хониши номҳо"}</span>
                <span className="text-muted-foreground font-normal ml-2">
                  (№{currentIndex + 1} аз {totalCount})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={onTogglePlay}
                className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                {isPlaying && !isPaused ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8 rounded-full text-muted-foreground"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onStop}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Full Expanded Player View */
          <div className="p-3.5 sm:p-4 space-y-3">
            {/* Upper row: Current Item Details + Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-3 min-w-0">
                {/* Audio Equalizer dancing wave box */}
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <div className="flex items-end gap-0.5 h-5">
                    {[30, 90, 60, 100, 45].map((h, i) => (
                      <span
                        key={i}
                        className={`w-0.5 sm:w-1 rounded-full bg-emerald-500 transition-all ${
                          isPlaying && !isPaused ? "animate-pulse" : "opacity-40"
                        }`}
                        style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Name info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black font-display text-foreground truncate">
                      {currentName?.name_tj || "—"}
                    </h3>
                    {currentName && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          currentName.gender === "male"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {currentName.gender_tj}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">
                      {currentName?.name_latin && `[${currentName.name_latin}]`}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate max-w-sm sm:max-w-xl">
                    {currentName?.meaning || "Номи расмии миллии Тоҷикистон • Тасдиқшудаи САҲШ"}
                  </p>
                </div>
              </div>

              {/* Right side controls: Voice badge, minimize, close */}
              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <button
                  onClick={onOpenSettings}
                  className="px-2.5 py-1 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Танзимоти диктор ва суръат"
                >
                  <span>{voiceInfo.flag}</span>
                  <span className="hidden sm:inline text-[11px]">{voiceInfo.label}</span>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                  title="Хурд кардан"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onStop}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                  title="Қатъ кардан"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lower row: Player Controls & Quick Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Progress & Page info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  №{currentIndex + 1} аз {totalCount}
                </span>
                <span>•</span>
                <span>Саҳифаи {currentPage} аз {totalPages}</span>
                <span className="hidden sm:inline font-mono">({progress}%)</span>
              </div>

              {/* Central Audio Playback Controls */}
              <div className="flex items-center gap-1 sm:gap-2 mx-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSkip(-5)}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hidden sm:inline-flex text-[11px] font-bold"
                  title="5 ном ба қафо"
                >
                  -5
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrevious}
                  disabled={currentIndex === 0}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                  title="Номи қаблӣ"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                {/* Big Primary Play/Pause Button */}
                <Button
                  onClick={onTogglePlay}
                  className="h-11 w-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center transition-transform hover:scale-105"
                  title={isPlaying && !isPaused ? "Таваққуф (Пауза)" : "Давом додан (Play)"}
                >
                  {isPlaying && !isPaused ? (
                    <Pause className="h-5 w-5 fill-white" />
                  ) : (
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                  title="Номи баъдӣ"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSkip(5)}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hidden sm:inline-flex text-[11px] font-bold"
                  title="5 ном ба пеш"
                >
                  +5
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onStop}
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
                  title="Ист (Стоп)"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              </div>

              {/* Right side Quick controls: Speed & Volume */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Speed Quick Selector */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 px-2.5 rounded-xl bg-secondary/70 hover:bg-secondary text-xs font-bold text-foreground flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{settings.speed}x</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 space-y-2 rounded-2xl" align="end">
                    <div className="text-xs font-bold text-foreground flex justify-between">
                      <span>Суръати хониш</span>
                      <span className="font-mono text-emerald-500">{settings.speed}x</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => onUpdateSettings({ speed: spd })}
                          className={`h-7 rounded-lg text-xs font-semibold ${
                            Math.abs(settings.speed - spd) < 0.01
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Volume Slider Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 w-8 rounded-xl bg-secondary/70 hover:bg-secondary text-foreground flex items-center justify-center">
                      {settings.volume === 0 ? (
                        <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 p-3 space-y-2 rounded-2xl" align="end">
                    <div className="text-xs font-bold text-foreground flex justify-between">
                      <span>Баландии овоз</span>
                      <span className="font-mono text-emerald-500">{Math.round(settings.volume * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.volume]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={(val) => onUpdateSettings({ volume: val[0] })}
                    />
                  </PopoverContent>
                </Popover>

                {/* Settings Dialog Trigger */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSettings}
                  className="h-8 px-2.5 rounded-xl text-xs font-semibold border-border bg-card"
                  title="Танзимоти пурра"
                >
                  <Sliders className="h-3.5 w-3.5 sm:mr-1 text-emerald-500" />
                  <span className="hidden sm:inline">Танзимот</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
