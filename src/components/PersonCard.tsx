import { Person, formatFullName, RELATION_LABELS } from "@/lib/people";
import { Link } from "react-router-dom";
import {
  User,
  UserCircle2,
  Trash2,
  BookOpen,
  Hash,
  Dna,
  Pen,
  Star,
  StarOff,
  Pencil,
  History,
  Crown,
} from "lucide-react";

interface PersonCardProps {
  person: Person;
  active?: boolean;
  onActivate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const PersonCard = ({ person, active, onActivate, onDelete, onEdit }: PersonCardProps) => {
  const initial = person.fullName.charAt(0).toUpperCase();
  const Icon = person.gender === "female" ? UserCircle2 : User;
  const history = person.nameHistory ?? [];

  return (
    <article
      className={`relative rounded-2xl border bg-card p-5 shadow-sm transition-all ${
        active
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
            person.gender === "female"
              ? "bg-rose-light text-rose"
              : "bg-coral-light text-primary"
          }`}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-foreground truncate">
            {formatFullName(person)}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 flex-wrap">
            <Icon className="h-3.5 w-3.5" />
            {RELATION_LABELS[person.relation]}
            {person.birthDate && (
              <>
                <span aria-hidden>·</span>
                <span>{person.birthDate}</span>
              </>
            )}
          </p>
          {person.meaningPersonal && (
            <p className="mt-2 text-sm text-foreground italic">
              «{person.meaningPersonal}»
            </p>
          )}
          {person.notes && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {person.notes}
            </p>
          )}
          {person.tags && person.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {person.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {onActivate && (
            <button
              onClick={onActivate}
              className={`p-1.5 rounded-lg transition-colors ${
                active
                  ? "text-gold"
                  : "text-muted-foreground hover:text-gold hover:bg-gold/10"
              }`}
              aria-label={active ? "Активный профиль" : "Сделать активным"}
              title={active ? "Активный профиль" : "Сделать активным"}
            >
              {active ? <Star className="h-4 w-4 fill-gold" /> : <StarOff className="h-4 w-4" />}
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Редактировать"
              title="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Удалить профиль"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <History className="h-3 w-3" />
            История имени ({history.length})
          </summary>
          <ol className="mt-2 space-y-1 text-xs text-muted-foreground border-l-2 border-gold/30 pl-3">
            {history.map((h, i) => (
              <li key={i}>
                <span className="font-semibold text-foreground">{h.name}</span>
                {h.reason && <span> — {h.reason}</span>}
                <span className="text-muted-foreground/70"> · {h.date}</span>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <QuickAction
          to={`/tafsir?name=${encodeURIComponent(person.fullName)}`}
          icon={BookOpen}
          label="Тафсир"
          tone="primary"
        />
        <QuickAction
          to={`/numerology?name=${encodeURIComponent(person.fullName)}${
            person.birthDate ? `&date=${person.birthDate}` : ""
          }`}
          icon={Hash}
          label="Нумерология"
          tone="lavender"
        />
        <QuickAction
          to={`/dna?name=${encodeURIComponent(person.fullName)}`}
          icon={Dna}
          label="ДНК"
          tone="coral"
        />
        <QuickAction
          to={`/signature?name=${encodeURIComponent(person.fullName)}`}
          icon={Pen}
          label="Подпись"
          tone="teal"
        />
        <QuickAction
          to={`/people/nasab`}
          icon={Crown}
          label="Насаб"
          tone="gold"
        />
      </div>
    </article>
  );
};

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary hover:bg-primary/20",
  lavender: "bg-lavender-light text-lavender hover:bg-lavender/20",
  coral: "bg-coral-light text-primary hover:bg-coral-light/70",
  teal: "bg-teal-light text-accent hover:bg-teal-light/70",
  gold: "bg-gold/10 text-gold hover:bg-gold/20",
};

const QuickAction = ({
  to,
  icon: Icon,
  label,
  tone,
}: {
  to: string;
  icon: typeof BookOpen;
  label: string;
  tone: keyof typeof toneClasses;
}) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${toneClasses[tone]}`}
  >
    <Icon className="h-3 w-3" />
    {label}
  </Link>
);

export default PersonCard;
