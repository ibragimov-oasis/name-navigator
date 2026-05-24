// Панель «Фамилия + имя отца + пол» — сохраняет в localStorage,
// показывает короткий вердикт гармонии и предупреждения по инициалам.
// Используется NameCard через ключи localStorage (без prop-drill).
import { useEffect, useState } from "react";
import { Users, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { calculateHarmony } from "@/lib/nameHarmony";
import { checkInitials } from "@/lib/initialsCheck";

const LS_KEY = "family-context";

export interface FamilyContext {
  surname: string;
  fatherName: string;
  gender: "male" | "female";
}

export function getFamilyContext(): FamilyContext | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v?.surname && !v?.fatherName) return null;
    return v;
  } catch {
    return null;
  }
}

const FamilyNameBar = ({ sampleName = "Ахмад" }: { sampleName?: string }) => {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<FamilyContext>(() => getFamilyContext() ?? { surname: "", fatherName: "", gender: "male" });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(ctx));
      window.dispatchEvent(new Event("family-context-changed"));
    } catch {}
  }, [ctx]);

  const harmony = calculateHarmony(sampleName, ctx.fatherName, ctx.surname, ctx.gender);
  const initials = checkInitials(sampleName, ctx.fatherName, ctx.surname);
  const hasData = ctx.surname || ctx.fatherName;

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-coral-light/40 to-teal-light/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">Фамилия и отчество</h3>
            <p className="text-xs text-muted-foreground">
              {hasData
                ? "Используются для оценки совместимости каждого имени"
                : "Заполните, чтобы видеть совместимость с каждым именем"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {open ? "Свернуть" : hasData ? "Изменить" : "Заполнить"}
        </button>
      </div>

      {open && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Фамилия"
            value={ctx.surname}
            onChange={(e) => setCtx({ ...ctx, surname: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            placeholder="Имя отца (для отчества)"
            value={ctx.fatherName}
            onChange={(e) => setCtx({ ...ctx, fatherName: e.target.value })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <select
            value={ctx.gender}
            onChange={(e) => setCtx({ ...ctx, gender: e.target.value as "male" | "female" })}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="male">Мальчик</option>
            <option value="female">Девочка</option>
          </select>
        </div>
      )}

      {hasData && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-card px-2 py-1 text-foreground">
            Пример: <b>{harmony.fullName}</b>
          </span>
          <span className="rounded-full bg-card px-2 py-1 text-foreground">
            Гармония: <b>{harmony.total}%</b> {harmony.verdict}
          </span>
          {ctx.surname && (
            <button
              onClick={() => setCtx({ surname: "", fatherName: "", gender: ctx.gender })}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
              title="Очистить"
            >
              <X className="h-3 w-3" /> Очистить
            </button>
          )}
        </div>
      )}

      {hasData && initials.warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {initials.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-rose-light/60 p-2 text-xs text-rose">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> {w}
            </div>
          ))}
        </div>
      )}
      {hasData && initials.ok && initials.initials && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Инициалы «{initials.initials}» — без проблем.
        </div>
      )}
    </div>
  );
};

export default FamilyNameBar;
