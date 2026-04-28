import { useState } from "react";
import Header from "@/components/Header";
import PersonCard from "@/components/PersonCard";
import PersonForm from "@/components/PersonForm";
import { usePeople, Person } from "@/lib/people";
import { Link } from "react-router-dom";
import { UserPlus, Users, Inbox, Crown, GitCompare } from "lucide-react";

const Profiles = () => {
  const {
    people,
    activePersonId,
    setActivePersonId,
    addPerson,
    updatePerson,
    removePerson,
  } = usePeople();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Person | null>(null);

  const startEdit = (p: Person) => {
    setEditing(p);
    setCreating(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-light mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-black text-foreground">
              Мои профили
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Активный профиль автоматически подставляется в тафсир, нумерологию,
              ДНК, подпись, сертификат и насаб.
            </p>
          </div>
          {!creating && !editing && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                Добавить человека
              </button>
              {people.length >= 2 && (
                <Link
                  to="/people/compatibility"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <GitCompare className="h-4 w-4" />
                  Совместимость
                </Link>
              )}
              {people.length >= 1 && (
                <Link
                  to="/people/nasab"
                  className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/5 px-4 py-2.5 text-sm font-semibold text-gold hover:bg-gold/10 transition-colors"
                >
                  <Crown className="h-4 w-4" />
                  Насаб
                </Link>
              )}
            </div>
          )}
        </div>

        {creating && (
          <div className="mb-6 animate-fade-in">
            <PersonForm
              others={people}
              onSubmit={(input) => {
                const created = addPerson(input);
                setActivePersonId(created.id);
                setCreating(false);
              }}
              onCancel={() => setCreating(false)}
              submitLabel="Создать профиль"
            />
          </div>
        )}

        {editing && (
          <div className="mb-6 animate-fade-in">
            <PersonForm
              initial={editing}
              others={people.filter((p) => p.id !== editing.id)}
              onSubmit={(input) => {
                // If main name changed, log into history.
                if (input.fullName !== editing.fullName) {
                  const stamp = new Date().toISOString().slice(0, 10);
                  const next = [
                    ...(editing.nameHistory ?? []),
                    { name: editing.fullName, reason: "прежнее имя", date: stamp },
                  ];
                  updatePerson(editing.id, { ...input, nameHistory: next });
                } else {
                  updatePerson(editing.id, input);
                }
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
              submitLabel="Сохранить изменения"
            />
          </div>
        )}

        {people.length === 0 && !creating && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Пока нет ни одного профиля
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Добавьте себя, ребёнка, супруга или персонажа книги — и инструменты
              сайта будут работать персонально.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Создать первый профиль
            </button>
          </div>
        )}

        {people.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {people.map((p) => (
              <PersonCard
                key={p.id}
                person={p}
                active={activePersonId === p.id}
                onActivate={() =>
                  setActivePersonId(activePersonId === p.id ? null : p.id)
                }
                onEdit={() => startEdit(p)}
                onDelete={() => {
                  if (confirm(`Удалить профиль "${p.fullName}"?`)) {
                    removePerson(p.id);
                  }
                }}
              />
            ))}
          </div>
        )}

        {people.length > 0 && (
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Профили хранятся локально на вашем устройстве. Никто, кроме вас, их
            не видит.
          </p>
        )}
      </main>
    </div>
  );
};

export default Profiles;
