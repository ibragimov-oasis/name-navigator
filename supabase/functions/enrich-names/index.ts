// Auto-enrichment of names. Triggered by pg_cron every 15 min or manually.
// - Rotates across real Gemini/Gemma models within free-tier daily limits.
// - Reserves quota BEFORE the call; marks model exhausted on 429/403.
// - Runs multiple culture batches per invocation.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Models via Lovable AI Gateway (OpenAI-compatible /chat/completions).
const MODELS: { id: string; rpd: number }[] = [
  { id: "google/gemini-2.5-flash-lite", rpd: 5000 },
  { id: "google/gemini-2.5-flash", rpd: 2000 },
  { id: "google/gemini-2.0-flash-lite", rpd: 2000 },
  { id: "google/gemini-2.0-flash", rpd: 2000 },
];

const CULTURE_ROTATION = [
  { culture: "Арабская", religion: "Ислам", origin: "Арабский", lang: "ar" },
  { culture: "Персидская", religion: "Ислам", origin: "Персидский", lang: "fa" },
  { culture: "Турецкая", religion: "Ислам", origin: "Турецкий", lang: "tr" },
  { culture: "Таджикская", religion: "Ислам", origin: "Таджикский", lang: "tg" },
  { culture: "Узбекская", religion: "Ислам", origin: "Тюркский", lang: "uz" },
  { culture: "Казахская", religion: "Ислам", origin: "Тюркский", lang: "kk" },
  { culture: "Чеченская", religion: "Ислам", origin: "Нахский", lang: "ce" },
  { culture: "Татарская", religion: "Ислам", origin: "Тюркский", lang: "tt" },
  { culture: "Русская", religion: "Православие", origin: "Славянский", lang: "ru" },
  { culture: "Японская", origin: "Японский", lang: "ja" },
  { culture: "Китайская", origin: "Китайский", lang: "zh" },
  { culture: "Корейская", origin: "Корейский", lang: "ko" },
  { culture: "Английская", origin: "Английский", lang: "en" },
  { culture: "Французская", origin: "Французский", lang: "fr" },
  { culture: "Немецкая", origin: "Немецкий", lang: "de" },
  { culture: "Итальянская", origin: "Итальянский", lang: "it" },
  { culture: "Испанская", origin: "Испанский", lang: "es" },
  { culture: "Скандинавская", origin: "Скандинавский", lang: "no" },
  { culture: "Греческая", origin: "Греческий", lang: "el" },
  { culture: "Еврейская", religion: "Иудаизм", origin: "Иврит", lang: "he" },
  { culture: "Индийская", religion: "Индуизм", origin: "Санскрит", lang: "hi" },
  { culture: "Африканская", origin: "Африканский", lang: "sw" },
];

const SYSTEM = `Ты — эксперт по именам разных культур. Возвращай СТРОГО JSON-массив из 10 уникальных имён указанной культуры.
Каждый элемент:
{
 "name": "Имя в родной транслитерации (рус/лат)",
 "gender": "male|female|unisex",
 "meaning": "1-2 предложения о значении",
 "history": "2-4 предложения об истории/происхождении/известных носителях",
 "attributes": ["3-6 черт характера или ассоциаций"],
 "confidence": 0.0-1.0
}
Только JSON-массив, без markdown, без префиксов. Имена должны быть РАЗНЫЕ и реальные.`;

async function getUsage(supa: any): Promise<Map<string, number>> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supa.from("llm_quota_usage").select("model,requests").eq("day", today);
  return new Map<string, number>((data ?? []).map((r: any) => [r.model, r.requests]));
}

async function reserveQuota(supa: any, model: string): Promise<void> {
  // Optimistic increment — bumps BEFORE the API call.
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supa
    .from("llm_quota_usage")
    .select("requests")
    .eq("model", model)
    .eq("day", today)
    .maybeSingle();
  if (data) {
    await supa
      .from("llm_quota_usage")
      .update({ requests: (data.requests ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq("model", model)
      .eq("day", today);
  } else {
    await supa.from("llm_quota_usage").insert({ model, day: today, requests: 1 });
  }
}

async function markExhausted(supa: any, model: string, rpd: number) {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supa
    .from("llm_quota_usage")
    .select("requests")
    .eq("model", model)
    .eq("day", today)
    .maybeSingle();
  if (data) {
    await supa
      .from("llm_quota_usage")
      .update({ requests: Math.max(rpd, data.requests), updated_at: new Date().toISOString() })
      .eq("model", model)
      .eq("day", today);
  } else {
    await supa.from("llm_quota_usage").insert({ model, day: today, requests: rpd });
  }
}

function extractJsonArray(text: string): any[] {
  const trimmed = text.trim();
  try {
    const j = JSON.parse(trimmed);
    if (Array.isArray(j)) return j;
    if (Array.isArray(j?.names)) return j.names;
  } catch {}
  // try to find a [...] block
  const m = trimmed.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const j = JSON.parse(m[0]);
      if (Array.isArray(j)) return j;
    } catch {}
  }
  return [];
}

async function callGemini(modelId: string, prompt: string): Promise<{ items: any[]; status: number; raw: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;
  const isGemma = modelId.startsWith("gemma");
  const body: any = {
    contents: [{ role: "user", parts: [{ text: isGemma ? `${SYSTEM}\n\n${prompt}` : prompt }] }],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 2048,
    },
  };
  if (!isGemma) {
    body.systemInstruction = { role: "system", parts: [{ text: SYSTEM }] };
    body.generationConfig.responseMimeType = "application/json";
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  if (!res.ok) return { items: [], status: res.status, raw: txt.slice(0, 300) };
  let parsed: any = {};
  try { parsed = JSON.parse(txt); } catch {}
  const text = parsed?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
  return { items: extractJsonArray(text), status: 200, raw: text.slice(0, 300) };
}

async function runBatch(
  supa: any,
  culture: typeof CULTURE_ROTATION[number],
  usage: Map<string, number>,
): Promise<{ added: number; skipped: number; model: string | null; err?: string }> {
  for (const m of MODELS) {
    if ((usage.get(m.id) ?? 0) >= m.rpd) continue;
    await reserveQuota(supa, m.id);
    usage.set(m.id, (usage.get(m.id) ?? 0) + 1);

    const prompt = `Сгенерируй 10 реальных имён культуры: ${culture.culture}. Происхождение: ${culture.origin}.${culture.religion ? " Религия: " + culture.religion + "." : ""} Включи и мужские и женские. Избегай самых распространённых — давай разнообразие.`;
    const { items, status, raw } = await callGemini(m.id, prompt);

    if (status === 429 || status === 403 || status === 404) {
      await markExhausted(supa, m.id, m.rpd);
      usage.set(m.id, m.rpd);
      continue; // try next model
    }
    if (status !== 200) {
      return { added: 0, skipped: 0, model: m.id, err: `http ${status}: ${raw}` };
    }
    if (items.length === 0) {
      return { added: 0, skipped: 0, model: m.id, err: `empty parse: ${raw}` };
    }

    let added = 0, skipped = 0;
    for (const it of items) {
      if (!it?.name || !it?.gender) { skipped++; continue; }
      const confidence = Math.max(0, Math.min(1, Number(it.confidence) || 0.75));
      const status = confidence >= 0.7 ? "published" : "auto";
      const row = {
        name: String(it.name).trim().slice(0, 80),
        gender: ["male", "female", "unisex"].includes(it.gender) ? it.gender : "unisex",
        culture: culture.culture,
        origin: culture.origin,
        religion: culture.religion ?? null,
        meaning: String(it.meaning ?? "").slice(0, 500),
        history: String(it.history ?? "").slice(0, 2000),
        attributes: Array.isArray(it.attributes) ? it.attributes.slice(0, 10) : [],
        languages: [culture.lang],
        source_kind: "llm",
        source_url: `gemini:${m.id}`,
        llm_model: m.id,
        confidence,
        status,
      };
      const { error } = await supa.from("names_enriched").insert(row);
      if (error) skipped++; else added++;
    }
    return { added, skipped, model: m.id };
  }
  return { added: 0, skipped: 0, model: null, err: "all models exhausted today" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  const runRow = await supa
    .from("enrich_runs")
    .insert({ source: "auto", status: "running" })
    .select()
    .single();
  const runId = runRow.data?.id;

  try {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const usage = await getUsage(supa);

    // Run 3 batches over different cultures per invocation
    const minute = new Date().getUTCMinutes();
    const cultures = [0, 1, 2].map(
      (i) => CULTURE_ROTATION[(minute + i * 7) % CULTURE_ROTATION.length],
    );

    let totalAdded = 0, totalSkipped = 0;
    const details: any[] = [];
    let lastModel: string | null = null;
    let lastErr: string | undefined;

    for (const c of cultures) {
      const r = await runBatch(supa, c, usage);
      totalAdded += r.added;
      totalSkipped += r.skipped;
      if (r.model) lastModel = r.model;
      if (r.err) lastErr = r.err;
      details.push({ culture: c.culture, ...r });
      if (r.err === "all models exhausted today") break;
    }

    const status = totalAdded > 0 ? "done" : lastErr === "all models exhausted today" ? "skipped" : "error";

    await supa
      .from("enrich_runs")
      .update({
        status,
        finished_at: new Date().toISOString(),
        model: lastModel,
        source: `cultures:${cultures.map((c) => c.culture).join(",")}`,
        added: totalAdded,
        skipped: totalSkipped,
        errors: lastErr ? { msg: lastErr, details } : { details },
      })
      .eq("id", runId);

    return new Response(JSON.stringify({ ok: totalAdded > 0, added: totalAdded, skipped: totalSkipped, details }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    await supa
      .from("enrich_runs")
      .update({ status: "error", finished_at: new Date().toISOString(), errors: { msg: String(err) } })
      .eq("id", runId);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
