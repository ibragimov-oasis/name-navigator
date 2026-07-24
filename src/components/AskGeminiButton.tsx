import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { askGemini } from "@/lib/ai/gemini";
import ReactMarkdown from "react-markdown";

interface Props {
  name: string;
  meaning?: string;
  origin?: string;
}

const AskGeminiButton = ({ name, meaning, origin }: Props) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    setOpen(true);
    if (text || busy) return;
    setBusy(true);
    try {
      const prompt = `Имя: ${name}${origin ? `\nПроисхождение: ${origin}` : ""}${meaning ? `\nЗначение: ${meaning}` : ""}\n\nДай 3-5 коротких пунктов: (1) глубинный смысл и корень, (2) исторический/религиозный контекст, (3) известные носители, (4) уменьшительные и сочетания, (5) совет — кому подойдёт. Markdown-список.`;
      const answer = await askGemini(prompt, {
        system: "Ты эксперт по именам, мусульманской и общечеловеческой традиции. Отвечай на русском, тёплым тоном, без воды.",
      });
      setText(answer);
    } catch (e: unknown) {
      setText(`⚠️ ${e instanceof Error ? e.message : "Ошибка"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={ask}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:from-primary hover:to-accent hover:text-primary-foreground"
      >
        <Sparkles className="h-3 w-3" /> Gemini AI
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          {busy ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Gemini думает…
            </div>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AskGeminiButton;
