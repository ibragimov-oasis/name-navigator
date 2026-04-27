import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import { calculateNumerology, DESTINY_TRAITS } from "@/lib/numerology";
import { childNames } from "@/data/childNames";
import { duas } from "@/data/duas";

/**
 * Printable name certificate. Use ?name=... and optional &date= &person=
 * Hit "Print" or Ctrl+P → "Save as PDF".
 */
const Certificate = () => {
  const [params] = useSearchParams();
  const name = params.get("name")?.trim() || "—";
  const personLine = params.get("person")?.trim() || "";
  const date = params.get("date")?.trim() || "";

  const numerology = useMemo(() => calculateNumerology(name), [name]);
  const destiny = DESTINY_TRAITS[numerology.destinyNumber];
  const nameInfo = useMemo(
    () => childNames.find((n) => n.name.toLowerCase() === name.toLowerCase()),
    [name]
  );
  const akika = useMemo(() => duas.find((d) => /акика|рожден/i.test(d.title)) ?? duas[0], []);

  useEffect(() => {
    // small UX hint
  }, []);

  return (
    <>
      <SEO
        title={`Сертификат имени ${name} — Имяген`}
        description={`Именной сертификат для ${name}: значение, тафсир, нумерология и дуа. Готов к печати.`}
      />
      <div className="min-h-screen bg-muted/30 print:bg-white">
        <div className="container mx-auto max-w-3xl px-4 py-6 print:hidden">
          <div className="flex items-center justify-between">
            <Link
              to={-1 as any}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Назад
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Printer className="h-4 w-4" /> Печать / Сохранить PDF
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-12 print:max-w-none print:px-0 print:pb-0">
          <div className="relative overflow-hidden rounded-3xl border-4 border-double border-primary/30 bg-card p-10 shadow-xl print:rounded-none print:border-2 print:shadow-none">
            {/* Decorative corner */}
            <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-gold/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-coral-light" />

            <div className="relative text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Именной сертификат
              </div>
              <div className="mt-2 font-display text-sm text-muted-foreground">
                بسم الله الرحمن الرحيم
              </div>
              <h1 className="mt-6 font-display text-5xl font-black text-foreground sm:text-6xl">
                {name}
              </h1>
              {personLine && (
                <div className="mt-2 text-sm text-muted-foreground">для {personLine}</div>
              )}
              {nameInfo?.meaning && (
                <p className="mx-auto mt-4 max-w-xl text-base italic text-foreground/80">
                  «{nameInfo.meaning}»
                </p>
              )}
            </div>

            <div className="relative mt-10 grid gap-6 sm:grid-cols-2">
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Значение и происхождение
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {nameInfo?.history ||
                    nameInfo?.meaning ||
                    "Имя несёт глубокий смысл и культурную традицию."}
                </p>
                {nameInfo?.origin && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Происхождение: {nameInfo.origin}
                    {nameInfo.culture ? ` · ${nameInfo.culture}` : ""}
                  </p>
                )}
              </section>

              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Нумерология
                </h2>
                <div className="mt-2 text-sm text-foreground">
                  <div>
                    Число судьбы:{" "}
                    <span className="font-display text-2xl font-bold text-primary">
                      {numerology.destinyNumber}
                    </span>{" "}
                    {destiny && <span className="ml-1 text-muted-foreground">— {destiny.title}</span>}
                  </div>
                  {destiny && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {destiny.traits.join(" · ")}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Абджад: {numerology.abjadTotal} · Пифагор: {numerology.pythagoreanTotal}
                  </p>
                </div>
              </section>

              {nameInfo?.attributes?.length ? (
                <section className="sm:col-span-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Атрибуты
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {nameInfo.attributes.map((a) => (
                      <span
                        key={a}
                        className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="sm:col-span-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Дуа
                </h2>
                <p
                  className="mt-2 text-right font-display text-lg leading-loose text-foreground"
                  dir="rtl"
                  lang="ar"
                >
                  {akika.arabic}
                </p>
                <p className="mt-1 text-xs italic text-muted-foreground">
                  {akika.transliteration}
                </p>
                <p className="mt-1 text-sm text-foreground">{akika.translation}</p>
              </section>
            </div>

            <div className="relative mt-10 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>{date || new Date().toLocaleDateString("ru-RU")}</span>
              <span className="font-display italic">imyagen · имя с глубиной</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
};

export default Certificate;
