import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Volume2, Users, ShieldCheck } from "lucide-react";
import type { ChildName } from "@/data/childNames";
import type { HarmonyResult, SiblingMatch } from "@/lib/nameHarmony";
import type { RegistryBadge } from "./RegistryBadge";

interface Props {
  name: ChildName | null;
  harmony: HarmonyResult | null;
  sibling?: SiblingMatch;
  registry?: RegistryBadge | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSpeak: () => void;
  canSpeak: boolean;
  onOpenChange: (open: boolean) => void;
}

const WizardNameDetailDialog = ({ name, harmony, sibling, registry, isFavorite, onToggleFavorite, onSpeak, canSpeak, onOpenChange }: Props) => {
  const parts: { label: string; val: number | undefined }[] = harmony ? [
    { label: "С отчеством (отец, 45%)", val: harmony.details.father },
    { label: "С именем матери (35%)", val: harmony.details.mother },
    { label: "С фамилией (20%)", val: harmony.details.surname },
  ] : [];
  return (
    <Dialog open={!!name} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {name && harmony && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">{name.name}</DialogTitle>
              <DialogDescription>{name.meaning || "Значение уточняется"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Полное звучание</p>
                <p className="font-semibold text-foreground">{harmony.fullName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{harmony.verdict} · {harmony.total}%</p>
              </div>
              {parts.some(p => p.val !== undefined) && (
                <div className="space-y-2">
                  {parts.filter(p => p.val !== undefined).map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{p.label}</span><span className="font-semibold">{p.val}%</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-secondary"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${p.val}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
              {sibling?.sibling && sibling.score > 0 && (
                <p className="flex items-center gap-2 text-foreground"><Users className="h-4 w-4 text-accent" /> Пара к имени «{sibling.sibling}»: {sibling.reason} ({sibling.score}%)</p>
              )}
              {registry && (
                <p className="flex items-center gap-2 text-foreground"><ShieldCheck className="h-4 w-4 text-accent" /> {registry.label}{" "}
                  <Link to={`/tajik-names?tab=checker&q=${encodeURIComponent(name.name)}`} className="text-primary underline">проверить в реестре</Link>
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Происхождение</p><p className="font-medium text-foreground">{name.origin}</p></div>
                <div><p className="text-muted-foreground">Культура</p><p className="font-medium text-foreground">{name.culture}</p></div>
                {name.religion && <div><p className="text-muted-foreground">Традиция</p><p className="font-medium text-foreground">{name.religion}</p></div>}
                {name.nameDay && <div><p className="text-muted-foreground">Именины</p><p className="font-medium text-foreground">{name.nameDay}</p></div>}
              </div>
              {name.history && (
                <div><p className="text-xs font-semibold text-muted-foreground">История и тафсир</p><p className="mt-1 leading-relaxed text-foreground">{name.history}</p></div>
              )}
              {name.famousPeople && name.famousPeople.length > 0 && (
                <div><p className="text-xs font-semibold text-muted-foreground">Известные носители</p><p className="mt-1 text-foreground">{name.famousPeople.join(", ")}</p></div>
              )}
              {name.attributes.length > 0 && (
                <div className="flex flex-wrap gap-1">{name.attributes.map(a => <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{a}</span>)}</div>
              )}
              <div className="flex gap-2 pt-2">
                {canSpeak && <Button variant="outline" className="flex-1" onClick={onSpeak}><Volume2 className="mr-2 h-4 w-4" /> Озвучить ФИО</Button>}
                <Button variant={isFavorite ? "default" : "outline"} className="flex-1" onClick={onToggleFavorite}>
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> {isFavorite ? "В избранном" : "В избранное"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WizardNameDetailDialog;
