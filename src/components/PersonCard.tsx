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
} from "lucide-react";

interface PersonCardProps {
  person: Person;
  active?: boolean;
  onActivate?: () => void;
  onDelete?: () => void;
}

const PersonCard = ({ person, active, onActivate, onDelete }: PersonCardProps) => {
  const initial = person.fullName.charAt(0).toUpperCase();
  const Icon = person.gender === "female" ? UserCircle2 : User;

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
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Icon className="h-3.5 w-3.5" />
            {RELATION_LABELS[person.relation]}
            {person.birthDate && (
              <>
                <span aria-hidden>·</span>
                <span>{person.birthDate}</span>
              </>
            )}
          </p>
          {person.notes && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {person.notes}
            </p>
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
      </div>
    </article>
  );
};

const toneClasses: Record<string, string> = {
  primary: "bg-primary/10 text-primary hover:bg-primary/20",
  lavender: "bg-lavender-light text-lavender hover:bg-lavender/20",
  coral: "bg-coral-light text-primary hover:bg-coral-light/70",
  teal: "bg-teal-light text-accent hover:bg-teal-light/70",
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
