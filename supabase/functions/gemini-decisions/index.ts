// Decision agents gateway: yes_no / choice / rubric decisions with probabilities.
// Model chain: gemini-decision-1 -> gemini-3.5-flash-lite -> gemini-3.1-flash-lite (Google API)
// -> Lovable AI Gateway fallback. Every model answers in the same strict JSON shape.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const Body = z.object({
  mode: z.enum(["yes_no", "choice", "rubric"]),
  question: z.string().min(3).max(1500),
  options: z.array(z.string().min(1).max(200)).min(2).max(8).optional(),
  context: z.string().max(4000).optional(),
});

const GOOGLE_MODELS = ["gemini-decision-1", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Out = { options: { label: string; p: number }[]; reason: string };

function normalize(raw: unknown, labels: string[]): Out | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { options?: unknown; reason?: unknown };
  if (!Array.isArray(r.options)) return null;
  const map = new Map<string, number>();
  for (const o of r.options) {
    if (o && typeof o === "object") {
      const lab = String((o as { label?: unknown }).label ?? "");
      const p = Number((o as { p?: unknown }).p);
      if (labels.includes(lab) && Number.isFinite(p)) map.set(lab, Math.max(0, p));
    }
  }
  const sum = [...map.values()].reduce((a, b) => a + b, 0);
  if (sum <= 0) return null;
  return {
    options: labels.map((l) => ({ label: l, p: +((map.get(l) ?? 0) / sum).toFixed(3) })),
    reason: String(r.reason ?? "").slice(0, 600),
  };
}

function buildPrompt(mode: string, q: string, labels: string[], ctx?: string) {
  return `You are a fast decision model. Mode: ${mode}.
Question: ${q}
${ctx ? `Context:\n${ctx}\n` : ""}Allowed options (use labels exactly): ${JSON.stringify(labels)}
Return ONLY JSON: {"options":[{"label":"<label>","p":<probability 0..1>}...],"reason":"<one or two short sentences in Russian>"}
Probabilities over all options must sum to 1.`;
}

function extract(text: string): unknown {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let parsed;
  try { parsed = Body.safeParse(await req.json()); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const { mode, question, context } = parsed.data;
  const labels = mode === "yes_no" ? ["yes", "no"]
    : mode === "rubric" ? (parsed.data.options ?? ["0", "1", "2", "3", "4"])
    : parsed.data.options;
  if (!labels) return json({ error: { options: ["required for choice"] } }, 400);

  const prompt = buildPrompt(mode, question, labels, context);
  const tried: { model: string; status: number }[] = [];

  const gem = Deno.env.get("GEMINI_API_KEY");
  if (gem) {
    for (const model of GOOGLE_MODELS) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gem}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0, responseMimeType: "application/json", maxOutputTokens: 400 },
          }),
        });
        tried.push({ model, status: r.status });
        if (!r.ok) { await r.text(); continue; }
        const d = await r.json();
        const text = d?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
        const out = normalize(extract(text), labels);
        if (out) return json(finish(out, model, tried));
      } catch (e) { tried.push({ model, status: 0 }); console.error(model, e); }
    }
  }

  const lov = Deno.env.get("LOVABLE_API_KEY");
  if (lov) {
    const model = "google/gemini-3.8-flash";
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST", headers: { Authorization: `Bearer ${lov}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
      });
      tried.push({ model, status: r.status });
      if (r.ok) {
        const d = await r.json();
        const out = normalize(extract(d?.choices?.[0]?.message?.content ?? ""), labels);
        if (out) return json(finish(out, model, tried));
      } else await r.text();
    } catch (e) { tried.push({ model, status: 0 }); console.error(e); }
  }

  const limited = tried.some((t) => t.status === 429 || t.status === 402);
  return json({ error: limited ? "Лимит ИИ исчерпан, попробуйте позже." : "ИИ недоступен", tried }, limited ? 429 : 503);
});

function finish(out: Out, model: string, tried: { model: string; status: number }[]) {
  const top = [...out.options].sort((a, b) => b.p - a.p)[0];
  return { decision: top.label, confidence: top.p, options: out.options, reason: out.reason, model, tried };
}
