import { useState, useMemo } from "react";
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
  RotateCcw,
  Sparkles,
  Sliders,
  Radio,
  Clock,
  BookOpen,
  VolumeX,
} from "lucide-react";
import {
  AudioReaderSettings,
} from "@/hooks/useTajikAudioReader";
import { VoicePreset, SpeechReadingMode, speakName } from "@/lib/tts";
import { TajikRegistryName } from "@/data/tajikTypes";

interface TajikAudioSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AudioReaderSettings;
  onUpdateSettings: (newSettings: Partial<AudioReaderSettings>) => void;
  totalPages: number;
  totalNames: number;
  availableVoices: SpeechSynthesisVoice[];
  onStartReading: (startPage: number, endPage: number) => void;
  sampleName?: TajikRegistryName;
}

export function TajikAudioSettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
  totalPages,
  totalNames,
  availableVoices,
  onStartReading,
  sampleName,
}: TajikAudioSettingsDialogProps) {
  const [localStartPage, setLocalStartPage] = useState<number>(settings.startPage || 1);
  const [localEndPage, setLocalEndPage] = useState<number>(settings.endPage || totalPages);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Group system voices by language
  const categorizedVoices = useMemo(() => {
    const persian = availableVoices.filter((v) => v.lang.startsWith("fa"));
    const arabic = availableVoices.filter((v) => v.lang.startsWith("ar"));
    const russian = availableVoices.filter((v) => v.lang.startsWith("ru"));
    const others = availableVoices.filter(
      (v) => !v.lang.startsWith("fa") && !v.lang.startsWith("ar") && !v.lang.startsWith("ru")
    );

    return { persian, arabic, russian, others };
  }, [availableVoices]);

  // Voice presets config
  const voicePresets: {
    id: VoicePreset;
    title: string;
    sub: string;
    flag: string;
    badge: string;
    description: string;
  }[] = [
    {
      id: "auto",
      title: "Худкор (Автоподбор)",
      sub: "Мутобиқсозии беҳтарин",
      flag: "🤖",
      badge: "Тавсияшаванда",
      description: "Система овози беҳтарини мавҷударо (форсӣ, арабӣ ё русӣ) интихоб мекунад",
    },
    {
      id: "persian",
      title: "Форсӣ / Персидский",
      sub: "Farsi (fa-IR)",
      flag: "🇮🇷",
      badge: categorizedVoices.persian.length > 0 ? "Дар дастгоҳ ҳаст" : "Аутентикӣ",
      description: "Талаффузи классикии шарқӣ барои номҳои форсӣ ва тоҷикӣ",
    },
    {
      id: "arabic",
      title: "Арабӣ / Арабский",
      sub: "Arabic (ar-SA)",
      flag: "🇸🇦",
      badge: categorizedVoices.arabic.length > 0 ? "Дар дастгоҳ ҳаст" : "Исломӣ",
      description: "Хониши дурусти махориҷи ҳуруф барои номҳои решаи арабӣ",
    },
    {
      id: "russian",
      title: "Русӣ / Тоҷикӣ",
      sub: "Cyrillic (ru-RU)",
      flag: "🇷🇺",
      badge: categorizedVoices.russian.length > 0 ? "Дар дастгоҳ ҳаст" : "Кириллӣ",
      description: "Хониши равони алифбои кириллии тоҷикӣ (Ғ, Ӣ, Қ, Ӯ, Ҳ, Ҷ)",
    },
  ];

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    const testText = sampleName
      ? `Номи расмӣ: ${sampleName.name_tj}. ${sampleName.meaning ? "Маъно: " + sampleName.meaning : ""}`
      : "Ассалому алайкум! Номи зебо ва расмии тоҷикӣ бо маъно ва талаффузи дуруст.";

    speakName(testText, "ru-RU", {
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

    onStartReading(sPage, ePage);
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
            Диапазони саҳифаҳо, диктор (овозҳои форсӣ, арабӣ, русӣ), суръат ва баландии садоро муайян кунед.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3 text-sm">
          {/* SECTION 1: Page Range (Откуда и до куда читать) */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                Диапазони хониш (Аз куҷо то куҷо):
              </Label>
              <span className="text-[11px] text-muted-foreground font-medium">
                Ҳамагӣ {totalPages} саҳифа ({totalNames.toLocaleString()} ном)
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

          {/* SECTION 2: Voice & Speaker Preset */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-500" />
                Интихоби диктор ва забон (Голос):
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
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500/40"
                        : "bg-card border-border/80 hover:border-emerald-500/40 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{preset.flag}</span>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">{preset.title}</h4>
                          <span className="text-[10px] text-muted-foreground block">{preset.sub}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-emerald-600 text-white border-transparent"
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

          {/* SECTION 3: Speed, Volume, Pitch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-card border border-border">
            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-primary" />
                  Суръати хониш (Скорость):
                </span>
                <span className="font-bold text-primary font-mono text-xs">{settings.speed.toFixed(2)}x</span>
              </div>
              <Slider
                value={[settings.speed]}
                min={0.5}
                max={1.75}
                step={0.05}
                onValueChange={(val) => onUpdateSettings({ speed: val[0] })}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>0.5x (оҳиста)</span>
                <span>1.0x (муқаррарӣ)</span>
                <span>1.75x (тез)</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
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
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Reading Mode & Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reading Mode */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Тарзи хониш (Режим):
              </Label>
              <div className="space-y-1.5">
                {[
                  { id: "name_only", label: "Танҳо ном", desc: "«Абирафшон»" },
                  { id: "name_meaning", label: "Ном ва маъно", desc: "«Абирафшон. Маъно: Рӯи тобон»" },
                  { id: "full", label: "Хониши пурра", desc: "«№1. Абирафшон. Номи писарона...»" },
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
              <span>Оғоз кардан ({localStartPage}..{localEndPage})</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
