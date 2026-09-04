import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TAJIK_ALPHABET } from "@/data/tajikRegistry";
import { useTajikRegistry } from "@/hooks/useTajikRegistry";
import { TajikRegistryName } from "@/data/tajikTypes";
import { Dices, Sparkles, Heart, Volume2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { useFavorites } from "@/lib/favorites";
import { speakName } from "@/lib/tts";
import { toast } from "sonner";

interface TajikRandomGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectName: (name: TajikRegistryName) => void;
}

export const TajikRandomGeneratorDialog = ({
  open,
  onOpenChange,
  onSelectName,
}: TajikRandomGeneratorDialogProps) => {
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [currentName, setCurrentName] = useState<TajikRegistryName | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { names: tajikRegistryNames } = useTajikRegistry();

  const candidatePool = useMemo(() => {
    return tajikRegistryNames.filter((n) => {
      if (selectedGender !== "all" && n.gender !== selectedGender) return false;
      if (selectedLetter !== "all" && n.letter.toUpperCase() !== selectedLetter.toUpperCase()) return false;
      return true;
    });
  }, [tajikRegistryNames, selectedGender, selectedLetter]);


  const handleRoll = () => {
    if (candidatePool.length === 0) {
      toast.error("Бо чунин филтрҳо ном ёфт нашуд");
      return;
    }

    setIsRolling(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * candidatePool.length);
      setCurrentName(candidatePool[randomIdx]);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

  const handleSpeak = (text: string) => {
    speakName(text, "ru-RU");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Dices className="h-3.5 w-3.5" />
              Генератори номҳои расмӣ
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground font-display">
            Интихоби тасодуфии ном
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Барои интихоби номи зебо ва расман тасдиқшудаи миллии тоҷикӣ тугмаро пахш намоед.
          </DialogDescription>
        </DialogHeader>

        {/* Filter Controls */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Ҷинс:</span>
            <div className="flex items-center gap-1.5">
              <Button
                variant={selectedGender === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender("all")}
                className="h-8 text-xs rounded-lg px-3"
              >
                Ҳама
              </Button>
              <Button
                variant={selectedGender === "male" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender("male")}
                className={`h-8 text-xs rounded-lg px-3 ${selectedGender === "male" ? "bg-sky-600 text-white" : "text-sky-600 dark:text-sky-400"}`}
              >
                ♂ Писарона
              </Button>
              <Button
                variant={selectedGender === "female" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGender("female")}
                className={`h-8 text-xs rounded-lg px-3 ${selectedGender === "female" ? "bg-rose-600 text-white" : "text-rose-600 dark:text-rose-400"}`}
              >
                ♀ Духтарона
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Ҳарф:</span>
            <select
              value={selectedLetter}
              onChange={(e) => setSelectedLetter(e.target.value)}
              className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none"
            >
              <option value="all">Ҳамаи ҳарфҳо ({candidatePool.length})</option>
              {TAJIK_ALPHABET.map((l) => (
                <option key={l} value={l}>Ҳарфи «{l}»</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Name Slot Display */}
        <div className="mt-4 p-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/30 text-center space-y-3 relative overflow-hidden">
          {currentName ? (
            <div className={`space-y-2 transition-all ${isRolling ? "opacity-60 scale-95" : "opacity-100 scale-100 animate-fade-in"}`}>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-[11px] bg-background/80">
                  №{currentName.num} дар феҳрист
                </Badge>
                <Badge className={currentName.gender === "male" ? "bg-sky-500/10 text-sky-600 border-sky-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}>
                  {currentName.gender_tj}
                </Badge>
              </div>

              <div className="text-4xl font-black text-foreground font-display tracking-tight flex items-center justify-center gap-2">
                <span>{currentName.name_tj}</span>
                <button
                  onClick={() => handleSpeak(currentName.name_tj)}
                  className="p-1.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-primary transition-colors"
                  title="Озвучить"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground">
                Лотинӣ: <strong className="text-foreground">{currentName.name_latin}</strong> • Кириллӣ: <strong className="text-foreground">{currentName.name_cyrillic}</strong>
              </div>

              {currentName.meaning && (
                <p className="text-xs sm:text-sm text-foreground/90 pt-1 leading-relaxed max-w-sm mx-auto">
                  {currentName.meaning}
                </p>
              )}
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <Sparkles className="h-10 w-10 text-primary mx-auto opacity-70 animate-pulse" />
              <p className="text-xs text-muted-foreground">
                Барои интихоби тасодуфии номи расмӣ тугмаи поёнро пахш кунед
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <Button
            onClick={handleRoll}
            disabled={isRolling || candidatePool.length === 0}
            className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRolling ? "animate-spin" : ""}`} />
            <span>{currentName ? "Интихоби дигар (Тасодуфӣ)" : "Интихоби номи тасодуфӣ"}</span>
          </Button>

          {currentName && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => {
                  toggleFavorite({
                    id: currentName.id,
                    name: currentName.name_tj,
                    gender: currentName.gender,
                    origin: currentName.origin || "Тоҷикӣ",
                    culture: "Таджикская",
                    meaning: currentName.meaning || "Официальное разрешённое таджикское имя",
                    attributes: currentName.attributes || ["национальное", "официальное"],
                    popularity: 90,
                    history: currentName.legal_decree,
                    languages: ["tg", "ru"],
                  });
                  toast.success(isFavorite(currentName.id) ? "Аз мунтахаб хориҷ шуд" : "Ба мунтахаб илова шуд");
                }}
                className="flex-1 rounded-xl text-xs font-semibold border-border flex items-center justify-center gap-1.5"
              >
                <Heart className={`h-4 w-4 ${isFavorite(currentName.id) ? "fill-rose text-rose" : "text-muted-foreground"}`} />
                <span>{isFavorite(currentName.id) ? "Дар мунтахаб" : "Ба мунтахаб"}</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  onSelectName(currentName);
                  onOpenChange(false);
                }}
                className="flex-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Тафсилоти пурра</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
