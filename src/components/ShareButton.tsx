import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

const ShareButton = ({ title, text, url, className = "" }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const finalUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const canWebShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handle = async () => {
    if (canWebShare) {
      try {
        await navigator.share({ title, text, url: finalUrl });
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary ${className}`}
      title="Поделиться"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-accent" /> Скопировано
        </>
      ) : (
        <>
          {canWebShare ? (
            <Share2 className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          Поделиться
        </>
      )}
    </button>
  );
};

export default ShareButton;
