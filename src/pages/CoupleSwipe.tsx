import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { getChildNames } from "@/lib/namesStore";
import { Heart, X, Users, Copy, RefreshCw, Trophy, Share2 } from "lucide-react";
import { toast } from "sonner";

type Likes = Record<string, boolean>;
type Session = {
  code: string;
  names: { id: string; name: string; meaning: string; gender: string }[];
  partner_a: Likes;
  partner_b: Likes;
};

const STORAGE_KEY = "imyagen.couple.role.v1";

function genCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

export default function CoupleSwipe() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"a" | "b" | null>(null);
  const [index, setIndex] = useState(0);
  const [joinCode, setJoinCode] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [loading, setLoading] = useState(false);

  // Восстановить роль
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { code: string; role: "a" | "b" };
        if (saved.code) {
          setRole(saved.role);
          loadSession(saved.code);
        }
      }
    } catch {/* noop */}
  }, []);

  // Realtime подписка
  useEffect(() => {
    if (!session?.code) return;
    const ch = supabase
      .channel(`couple-${session.code}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "swipe_sessions", filter: `code=eq.${session.code}` },
        (payload) => {
          setSession((prev) => prev ? { ...prev, ...(payload.new as Partial<Session>) } : prev);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session?.code]);

  const loadSession = async (code: string) => {
    const { data, error } = await supabase
      .from("swipe_sessions")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error || !data) {
      toast.error("Сессия не найдена");
      return;
    }
    setSession(data as unknown as Session);
  };

  const createSession = async () => {
    setLoading(true);
    const names = getChildNames()
      .filter((n) => n.gender === gender || n.gender === "unisex")
      .sort(() => Math.random() - 0.5)
      .slice(0, 30)
      .map((n) => ({ id: n.id, name: n.name, meaning: n.meaning, gender: n.gender }));
    const code = genCode();
    const { error } = await supabase
      .from("swipe_sessions")
      .insert({ code, names, partner_a: {}, partner_b: {} });
    setLoading(false);
    if (error) {
      toast.error("Не удалось создать сессию");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, role: "a" }));
    setRole("a");
    setIndex(0);
    await loadSession(code);
    toast.success(`Код: ${code} — поделитесь с партнёром`);
  };

  const joinSession = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    await loadSession(code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, role: "b" }));
    setRole("b");
    setIndex(0);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setRole(null);
    setIndex(0);
  };

  const vote = async (liked: boolean) => {
    if (!session || !role) return;
    const current = session.names[index];
    if (!current) return;
    const field = role === "a" ? "partner_a" : "partner_b";
    const updated = { ...(session[field] || {}), [current.id]: liked };
    const { error } = await supabase
      .from("swipe_sessions")
      .update({ [field]: updated, updated_at: new Date().toISOString() })
      .eq("code", session.code);
    if (error) {
      toast.error("Не удалось сохранить голос");
      return;
    }
    setSession({ ...session, [field]: updated });
    setIndex((i) => i + 1);
  };

  const matches = useMemo(() => {
    if (!session) return [];
    return session.names.filter(
      (n) => session.partner_a?.[n.id] && session.partner_b?.[n.id],
    );
  }, [session]);

  const myProgress = useMemo(() => {
    if (!session || !role) return 0;
    const likes = role === "a" ? session.partner_a : session.partner_b;
    return Object.keys(likes || {}).length;
  }, [session, role]);

  const shareUrl = session ? `${window.location.origin}/couple?code=${session.code}` : "";

  // Авто-подхват ?code= из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c && !session) {
      setJoinCode(c);
    }
  }, [session]);

  if (!session || !role) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Breadcrumbs items={[{ label: "Вдвоём" }]} />
        <main className="container mx-auto max-w-2xl px-4 py-8">
          <div className="text-center mb-8">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-light">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold">Свайп вдвоём</h1>
            <p className="mt-2 text-muted-foreground">
              Оба родителя голосуют независимо. Совпадения покажутся обоим в реальном времени.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-foreground mb-3">Создать сессию</h3>
              <div className="flex gap-2 mb-3">
                {(["female", "male"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                      gender === g
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {g === "female" ? "♀ Дочка" : "♂ Сын"}
                  </button>
                ))}
              </div>
              <button
                onClick={createSession}
                disabled={loading}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Создаю…" : "Создать и получить код"}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold text-foreground mb-3">Войти по коду</h3>
              <input
                type="text"
                placeholder="ABCDE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-input bg-background py-2 px-3 text-sm uppercase font-mono mb-3 focus:border-accent focus:outline-none"
              />
              <button
                onClick={joinSession}
                className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Войти
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const current = session.names[index];
  const done = !current;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ label: "Вдвоём" }]} />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-4 rounded-xl bg-card border border-border p-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Код:</span>{" "}
            <span className="font-mono font-bold text-foreground">{session.code}</span>{" "}
            <span className="ml-2 text-xs text-muted-foreground">
              Вы — {role === "a" ? "партнёр A" : "партнёр B"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Ссылка скопирована");
              }}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
              title="Скопировать ссылку"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={reset}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
              title="Сброс"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          Прогресс: {myProgress} / {session.names.length} · Совпадений: {matches.length}
        </div>

        {!done && current && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Имя {index + 1} из {session.names.length}
            </p>
            <h2 className="font-display text-5xl font-bold text-foreground">{current.name}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{current.meaning}</p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => vote(false)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                title="Не нравится"
              >
                <X className="h-7 w-7" />
              </button>
              <button
                onClick={() => vote(true)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="Нравится"
              >
                <Heart className="h-7 w-7" />
              </button>
            </div>
          </div>
        )}

        {done && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mt-3 font-display text-2xl font-bold">Готово!</h2>
            <p className="text-sm text-muted-foreground">
              Ждём пока партнёр закончит — совпадения появятся ниже автоматически.
            </p>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-primary" /> Совпадения ({matches.length})
          </h3>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Пока пусто. Голосуйте оба, и понравившиеся обоим появятся здесь.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {matches.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
                >
                  <Heart className="h-3.5 w-3.5" /> {m.name}
                </span>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
