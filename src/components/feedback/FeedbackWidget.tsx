import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquarePlus, Send, Loader2, MapPin } from "lucide-react";
import { supabase } from "../../integrations/supabase/client";
import { parseFeedbackLocation } from "../../lib/feedback/feedbackLocation";
import {
  FEEDBACK_CATEGORIES,
  sendFeedback,
  type FeedbackCategoryId,
} from "../../lib/feedback/feedbackSignal";

export default function FeedbackWidget() {
  const location = useLocation();
  const [userId, setUserId] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategoryId>("bug");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          setUserEmail(session.user.email);
        }
      } catch (e) {
        console.warn("Supabase auth not available or failed:", e);
      }
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? undefined);
      setUserEmail(session?.user?.email ?? undefined);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loc = useMemo(() => parseFeedbackLocation(location.pathname), [location.pathname]);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const eventId = await sendFeedback({
        category,
        message: trimmed,
        sectionKey: loc.sectionKey,
        sectionLabel: loc.sectionLabel,
        route: location.pathname,
        item: loc.item,
        contactEmail: contactEmail.trim() || undefined,
        userId,
        userEmail,
      });

      if (eventId) {
        setToastMessage("Спасибо! Отзыв отправлен ✅");
      } else {
        setToastMessage("Спасибо! Отзыв сохранён в консоли ✅");
      }
      setTimeout(() => setToastMessage(null), 3500);
      
      setMessage("");
      setContactEmail("");
      setCategory("bug");
      setOpen(false);
    } catch (e) {
      setToastMessage("Не удалось отправить отзыв ❌");
      setTimeout(() => setToastMessage(null), 3500);
      console.error("[feedback] send failed", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Оставить отзыв"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <MessageSquarePlus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {toastMessage && (
        <div className="fixed bottom-32 sm:bottom-24 left-3 sm:left-6 z-[99999] max-w-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white px-4 py-3 shadow-lg flex items-center gap-2 dark:bg-white dark:border-zinc-200 dark:text-black animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          
          <div className="relative w-[calc(100%-1rem)] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex flex-col gap-1.5 text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Обратная связь
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Нашли ошибку или есть идея? Напишите — это попадёт прямо разработчику.
              </p>
            </div>
            
            <div className="space-y-4 py-1">
              <div className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Раздел: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{loc.sectionLabel}</span>
                  {loc.item && (
                    <>
                      " · "
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium break-all">{loc.item}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium">Категория</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as FeedbackCategoryId)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                >
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.labelRu}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium">Сообщение</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите, что не так или что хотелось бы улучшить…"
                  className="w-full min-h-[110px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  autoFocus
                />
              </div>

              {!userId && (
                <div className="space-y-1.5 text-left">
                  <label className="text-sm font-medium">
                    Email для ответа <span className="text-zinc-500 dark:text-zinc-400 font-normal">(необязательно)</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={sending}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-900/80 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim() || sending}
                className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Отправка…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Отправить
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
