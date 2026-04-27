import { useState, FormEvent } from "react";
import {
  Person,
  PersonInput,
  PersonGender,
  PersonRelation,
  RELATION_LABELS,
} from "@/lib/people";
import { Input } from "@/components/ui/input";
import { Save, X } from "lucide-react";

interface PersonFormProps {
  initial?: Person;
  onSubmit: (input: PersonInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const RELATIONS: PersonRelation[] = [
  "self",
  "child",
  "spouse",
  "parent",
  "friend",
  "character",
  "historical",
];

const PersonForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Сохранить",
}: PersonFormProps) => {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [surname, setSurname] = useState(initial?.surname ?? "");
  const [patronymic, setPatronymic] = useState(initial?.patronymic ?? "");
  const [kunya, setKunya] = useState(initial?.kunya ?? "");
  const [nisba, setNisba] = useState(initial?.nisba ?? "");
  const [laqab, setLaqab] = useState(initial?.laqab ?? "");
  const [gender, setGender] = useState<PersonGender>(initial?.gender ?? "male");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [relation, setRelation] = useState<PersonRelation>(
    initial?.relation ?? "self"
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) return;
    onSubmit({
      fullName: trimmed,
      surname: surname.trim() || undefined,
      patronymic: patronymic.trim() || undefined,
      kunya: kunya.trim() || undefined,
      nisba: nisba.trim() || undefined,
      laqab: laqab.trim() || undefined,
      gender,
      birthDate: birthDate || undefined,
      relation,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Имя *">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Мухаммад"
            required
            autoFocus
          />
        </Field>
        <Field label="Фамилия">
          <Input
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Иванов"
          />
        </Field>
        <Field label="Отчество / насаб">
          <Input
            value={patronymic}
            onChange={(e) => setPatronymic(e.target.value)}
            placeholder="Абдуллах"
          />
        </Field>
        <Field label="Кунья (Абу/Умм)">
          <Input
            value={kunya}
            onChange={(e) => setKunya(e.target.value)}
            placeholder="Абу Бакр"
          />
        </Field>
        <Field label="Нисба">
          <Input
            value={nisba}
            onChange={(e) => setNisba(e.target.value)}
            placeholder="Бухари"
          />
        </Field>
        <Field label="Лакаб (прозвище)">
          <Input
            value={laqab}
            onChange={(e) => setLaqab(e.target.value)}
            placeholder="ас-Сиддик"
          />
        </Field>
        <Field label="Дата рождения">
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </Field>
        <Field label="Пол">
          <div className="flex gap-2">
            {(["male", "female"] as PersonGender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  gender === g
                    ? g === "female"
                      ? "border-rose bg-rose-light text-rose"
                      : "border-primary bg-coral-light text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-foreground"
                }`}
              >
                {g === "male" ? "Мужской" : "Женский"}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Кто это для вас">
        <div className="flex flex-wrap gap-2">
          {RELATIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRelation(r)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                relation === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground"
              }`}
            >
              {RELATION_LABELS[r]}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Заметки">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Например: ищу имя для смены / новообращённый…"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
            Отмена
          </button>
        )}
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={!fullName.trim()}
        >
          <Save className="h-4 w-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    {children}
  </label>
);

export default PersonForm;
