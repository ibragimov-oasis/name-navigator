import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, Loader2 } from "lucide-react";
import { askGemini } from "@/lib/ai/gemini";
import { usePeople } from "@/lib/people";
import ReactMarkdown from "react-markdown";

interface Msg {
  role: "user" | "model";
  text: string;
}

const SYSTEM = `Ты — тёплый помощник по мусульманским и общим традициям имянаречения на сайте "ИмяГен".
Отвечай на русском, кратко и по делу (3-6 предложений), используя Markdown для списков.
Если вопрос про конкретное имя — давай значение, происхождение, исторический контекст.
Если активен профиль ребёнка/человека — учитывай его пол, возраст, культуру.
Если вопрос вне темы имён и культуры — мягко возвращай к теме.`;

const GeminiChatWidget = () => {
  const { activePerson } = usePeople();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem("gemini:chat");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("gemini:chat", JSON.stringify(messages.slice(-30)));
    } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", text }];
    setMessages(next);
    setBusy(true);
    try {
      const personLine = activePerson
        ? `\nАктивный профиль: ${activePerson.fullName} (${activePerson.relation ?? "—"}, ${activePerson.gender ?? "—"}${activePerson.birthDate ? `, дата ${activePerson.birthDate}` : ""}).`
        : "";
      const answer = await askGemini(text, {
        system: SYSTEM + personLine,
        history: next.slice(-8).map((m) => ({ role: m.role, text: m.text })),
        cache: false,
      });
      setMessages([...next, { role: "model", text: answer }]);
    } catch (e: any) {
      setMessages([...next, { role: "model", text: `⚠️ ${e?.message ?? "Ошибка"}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg transition hover:scale-105"
        aria-label="Открыть AI-чат"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 sm:p-4" onClick={() => setOpen(false)}>
          <div
            className="flex h-[85vh] w-full max-w-md flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-display font-bold">Gemini Помощник</div>
                  <div className="text-xs text-muted-foreground">Имена, традиции, культуры</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Привет! Спроси меня о значении имени, традициях, выборе для ребёнка.</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Что значит имя Юсуф?", "Как выбрать кунью?", "Имена с корнем «свет»"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs hover:border-primary"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-8 bg-primary text-primary-foreground"
                      : "mr-8 bg-secondary text-foreground"
                  }`}
                >
                  {m.role === "model" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
              ))}
              {busy && (
                <div className="mr-8 flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Думаю…
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Спросите Gemini…"
                  className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="mt-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Очистить историю
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatWidget;
