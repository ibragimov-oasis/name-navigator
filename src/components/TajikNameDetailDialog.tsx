import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TajikRegistryName } from "@/data/tajikTypes";
import { ShieldCheck, Heart, Copy, Check, Sparkles, BookOpen, Clock, Tag } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites";
import { toast } from "sonner";

interface TajikNameDetailDialogProps {
  name: TajikRegistryName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TajikNameDetailDialog = ({ name, open, onOpenChange }: TajikNameDetailDialogProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  if (!name) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Нусхабардорӣ шуд: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isFav = isFavorite(name.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl">
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

          <div className="pt-2">
            <DialogTitle className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-display">
              {name.name_tj}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Рақами тартибӣ дар реестр: <span className="font-semibold text-foreground">№{name.num}</span> • Ҳарф: <span className="font-semibold text-foreground">{name.letter}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Spellings & Transliterations */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-card border border-border/70 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Тоҷикӣ (расмӣ)</span>
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

          <div className="p-3 rounded-xl bg-card border border-border/70 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Кириллӣ (русӣ)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-semibold text-foreground text-base">{name.name_cyrillic}</span>
              <button
                onClick={() => handleCopy(name.name_cyrillic, "cyr")}
                className="text-muted-foreground hover:text-foreground p-1"
                title="Нусхабардорӣ"
              >
                {copiedField === "cyr" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/70 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Лотинӣ (шиноснома)</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-semibold text-foreground text-base tracking-wide">{name.name_latin}</span>
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

        {/* Legal Authority Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-foreground">Ҳуҷҷати расмии тасдиқкунанда:</p>
            <p className="text-muted-foreground leading-relaxed">{name.legal_decree}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
              ✓ Барои сабт дар мақомоти Сабти асноди ҳолати шаҳрвандӣ (САҲШ / ЗАГС) пурра иҷозат дода шудааст.
            </p>
          </div>
        </div>

        {/* Meaning & Information */}
        <div className="mt-5 space-y-4">
          {name.is_enriched && name.meaning ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> Маъно ва решаи ном
                </h4>
                <p className="mt-1.5 text-sm sm:text-base text-foreground leading-relaxed font-medium bg-card/60 p-3.5 rounded-xl border border-border/60">
                  {name.meaning}
                </p>
              </div>

              {name.origin && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Пайдоиш:</span>
                  <span>{name.origin}</span>
                </div>
              )}

              {name.attributes && name.attributes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Tag className="h-3.5 w-3.5 text-primary" /> Хислатҳо ва сифатҳо
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {name.attributes.map((attr, i) => (
                      <Badge key={i} variant="secondary" className="px-2.5 py-0.5 text-xs bg-secondary/80 font-normal">
                        {attr}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {name.history && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Таърих ва маълумоти иловагӣ
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                    {name.history}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <Clock className="h-4 w-4" />
                <span>Интизори такмили маълумот (Обогащение запланировано)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ин ном расман дар феҳристи миллии Тоҷикистон тасдиқ шудааст. Тавсифи муфассали маъноӣ ва луғавии ин ном тавассути парсер ва крони навбатӣ пурра мегардад.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const fullText = `Ном: ${name.name_tj} (${name.name_latin})\nРеестр: ${name.legal_decree}\nМаъно: ${name.meaning || "Номи расмии миллии тоҷикӣ"}`;
              navigator.clipboard.writeText(fullText);
              toast.success("Ҳама маълумот нусхабардорӣ шуд!");
            }}
            className="text-xs rounded-xl"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Нусхаи пурра
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5"
          >
            Пӯшидан
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
