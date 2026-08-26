import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TajikRegistryName } from "@/data/tajikTypes";
import { ShieldCheck, Heart, Copy, Check, Sparkles, BookOpen, Volume2, FileText, Share2, Tag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { speakName } from "@/lib/tts";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TajikCertificateDialog } from "@/components/TajikCertificateDialog";

interface TajikNameDetailDialogProps {
  name: TajikRegistryName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TajikNameDetailDialog = ({ name, open, onOpenChange }: TajikNameDetailDialogProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [certOpen, setCertOpen] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  if (!name) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Нусхабардорӣ шуд: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSpeak = () => {
    speakName(name.name_tj, "ru-RU");
  };

  const handleShare = () => {
    const url = window.location.origin + `/tajik-names?name=${encodeURIComponent(name.name_tj)}`;
    if (navigator.share) {
      navigator.share({
        title: `Номи «${name.name_tj}» — Феҳристи расмии Тоҷикистон`,
        text: `Номи расман иҷозатдодашудаи «${name.name_tj}» (№${name.num}): ${name.meaning}`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Пайванд нусхабардорӣ шуд!");
    }
  };

  const isFav = isFavorite(name.id);

  return (
    <>
      <TajikCertificateDialog
        name={name}
        open={certOpen}
        onOpenChange={setCertOpen}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    name.gender === "male"
                      ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {name.gender_tj} ({name.gender_label})
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Қонунӣ (№98)
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Ирсол кардан"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    toggleFavorite({
                      id: name.id,
                      name: name.name_tj,
                      gender: name.gender,
                      origin: name.origin || "Тоҷикӣ",
                      culture: "Таджикская",
                      meaning: name.meaning || "Официальное разрешённое таджикское имя",
                      attributes: name.attributes || ["национальное", "официальное"],
                      popularity: 90,
                      history: name.legal_decree,
                      languages: ["tg", "ru"]
                    });
                    toast.success(isFav ? "Аз мунтахаб хориҷ шуд" : "Ба мунтахаб илова шуд");
                  }}
                  className="rounded-full hover:bg-rose-500/10 text-muted-foreground hover:text-rose"
                  aria-label="Илова ба мунтахаб"
                >
                  <Heart className={`h-5 w-5 transition-transform ${isFav ? "fill-rose text-rose scale-110" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-display">
                  {name.name_tj}
                </DialogTitle>
                <button
                  onClick={handleSpeak}
                  className="p-2 rounded-full bg-secondary/80 hover:bg-primary hover:text-primary-foreground text-foreground transition-colors"
                  title="Озвучить имя"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                Рақами тартибӣ дар реестр: <strong className="text-foreground">№{name.num}</strong> • Ҳарф: <strong className="text-foreground">{name.letter}</strong>
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Spellings & Transliterations */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-card border border-border/70 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Тоҷикӣ (расмӣ)</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-foreground text-lg">{name.name_tj}</span>
                <button
                  onClick={() => handleCopy(name.name_tj, "tj")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  title="Нусхабардорӣ"
                >
                  {copiedField === "tj" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-border/70 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Овонавишти кириллӣ</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-foreground text-lg">{name.name_cyrillic}</span>
                <button
                  onClick={() => handleCopy(name.name_cyrillic, "cyr")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  title="Нусхабардорӣ"
                >
                  {copiedField === "cyr" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-border/70 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Лотинӣ (шиноснома)</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-foreground text-lg">{name.name_latin}</span>
                <button
                  onClick={() => handleCopy(name.name_latin, "lat")}
                  className="text-muted-foreground hover:text-foreground p-1"
                  title="Нусхабардорӣ"
                >
                  {copiedField === "lat" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Meaning & Origin Block */}
          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/70 space-y-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Маъно ва тафсири ном</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {name.meaning || "Номи анъанавии миллии тоҷикӣ, ки дар фарҳанг ва таърихи халқи тоҷик мақоми хоса дорад."}
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Мансубият:</span>
                <strong className="text-foreground">{name.origin || "Тоҷикӣ / Форсӣ"}</strong>
              </div>
            </div>

            {/* Personality Attributes */}
            {name.attributes && name.attributes.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Хислатҳои маънавии ном:</span>
                <div className="flex flex-wrap gap-1.5">
                  {name.attributes.map((attr) => (
                    <Badge key={attr} variant="secondary" className="text-xs py-1 px-2.5 rounded-lg bg-secondary/80 text-secondary-foreground">
                      <Tag className="h-3 w-3 mr-1 opacity-70" />
                      {attr}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Legal decree notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-100 flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Асоси ҳуқуқӣ (Қарори №98):</p>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {name.legal_decree}. Тибқи қонунгузории ҶТ ин ном расман барои бақайдгирии таваллуд ва шиноснома иҷозат дорад.
                </p>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
            <Button
              onClick={() => setCertOpen(true)}
              className="flex-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>Санади САҲШ (Выписка)</span>
            </Button>

            <Link
              to={`/tafsir?name=${encodeURIComponent(name.name_tj)}`}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border-border"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Тафсири қуръонӣ</span>
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
