import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TajikRegistryName } from "@/data/tajikTypes";
import { ShieldCheck, Printer, Copy, Check, Sparkles, Download, FileText, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface TajikCertificateDialogProps {
  name: TajikRegistryName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TajikCertificateDialog = ({ name, open, onOpenChange }: TajikCertificateDialogProps) => {
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!name) return null;

  const handleCopyText = () => {
    const text = `ИҚТИБОС АЗ ФЕҲРИСТИ РАСМИИ НОМҲОИ МИЛЛИИ ҶУМҲУРИИ ТОҶИКИСТОН
(Қарори Ҳукумати ҶТ аз 26.02.2026, №98)

1. Ном бо хати тоҷикӣ: ${name.name_tj}
2. Овонавишти кириллӣ: ${name.name_cyrillic}
3. Овонавишти лотинӣ (барои шиноснома): ${name.name_latin.toUpperCase()}
4. Ҷинс: ${name.gender_tj} (${name.gender_label})
5. Рақами тартибӣ дар феҳрист: №${name.num} (Ҳарфи «${name.letter}»)
6. Ҳолати ҳуқуқӣ: РАСМАН ИҶОЗАТ ДОДА ШУДААСТ барои сабти САҲШ (ЗАГС)
7. Маъно: ${name.meaning || 'Номи анъанавии миллии тоҷикӣ'}
8. Мансубият: ${name.origin || 'Тоҷикӣ / Форсӣ'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Матни расмӣ барои аризаи САҲШ нусхабардорӣ шуд!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Иқтибоси расмӣ барои САҲШ (ЗАГС)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">№{name.num} / {name.letter}</span>
          </div>

          <DialogTitle className="text-xl sm:text-3xl font-black text-foreground font-display">
            Санади расмии тасдиқи ном
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Выписка из Государственного реестра национальных имён для органов записи актов гражданского состояния (САҲШ / ЗАГС) и паспортного стола.
          </DialogDescription>
        </DialogHeader>

        {/* Printable Certificate Box */}
        <div
          ref={certRef}
          className="mt-4 relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-card via-card/90 to-emerald-500/5 p-4 sm:p-6 md:p-8 text-foreground shadow-md"
        >
          {/* Ornamental watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b border-border/60 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold tracking-tight text-foreground uppercase">
              Ҷумҳурии Тоҷикистон
            </h3>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Феҳристи номҳои миллии тоҷикӣ
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground max-w-md mx-auto">
              Тасдиқшуда бо Қарори Ҳукумати Ҷумҳурии Тоҷикистон аз 26 феврали соли 2026, №98 (моддаи 20¹ Қонуни ҶТ «Дар бораи бақайдгирии давлатии асноди ҳолати шаҳрвандӣ»)
            </p>
          </div>

          {/* Core Name Display */}
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-border/60 text-center space-y-2 sm:space-y-3 mb-4 sm:mb-6 shadow-sm">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-semibold">Номи тасдиқшуда</span>
            <div className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground font-display tracking-tight text-emerald-600 dark:text-emerald-400">
              {name.name_tj}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Лотинӣ: {name.name_latin.toUpperCase()}
              </Badge>
              <Badge className="bg-secondary text-secondary-foreground text-xs">
                Кириллӣ: {name.name_cyrillic}
              </Badge>
              <Badge className={name.gender === "male" ? "bg-sky-500/10 text-sky-600 border-sky-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}>
                {name.gender_tj} ({name.gender_label})
              </Badge>
            </div>
          </div>

          {/* Table of Official Details */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Рақами тартибӣ дар феҳрист:</span>
                <strong className="text-foreground text-base">№{name.num}</strong> (Ҳарфи «{name.letter}»)
              </div>
              <div className="p-3 rounded-lg bg-background/60 border border-border/40">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Ҳолати ҳуқуқӣ (Статус):</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> ИҶОЗАТ ДОДА ШУДААСТ
                </span>
              </div>
            </div>

            {name.meaning && (
              <div className="p-3.5 rounded-lg bg-background/60 border border-border/40">
                <span className="text-[11px] text-muted-foreground block mb-0.5 font-semibold uppercase tracking-wider">Маъно ва тафсири ном:</span>
                <p className="text-foreground leading-relaxed">{name.meaning}</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-100 text-[11px] leading-relaxed">
              <strong>Эзоҳ барои мақомоти САҲШ ва ШВКД:</strong> Номи мазкур ба талаботи қонунгузории Ҷумҳурии Тоҷикистон комилан мутобиқ буда, тибқи феҳристи расмии тасдиқшуда метавонад бемамониат дар шаҳодатномаи таваллуд ва шиноснома сабт карда шавад.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleCopyText}
            className="flex-1 sm:flex-initial rounded-xl text-xs font-semibold flex items-center gap-2 border-border"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Нусхабардорӣ шуд" : "Нусхабардории матн"}</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial rounded-xl text-xs font-semibold flex items-center gap-2 border-border"
            >
              <Printer className="h-4 w-4 text-primary" />
              <span>Чоп кардан (Print)</span>
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Пӯшидан
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
