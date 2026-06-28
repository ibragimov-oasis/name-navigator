// Auto-enrichment of names. Triggered by pg_cron every 15 min or manually.
// - Rotates across Gemini/Gemma models within free-tier daily limits.
// - Seeds from a built-in culture rotation (no Firecrawl needed).
// - LLM returns JSON batch of 10 names with full enrichment.
// - Dedups against names_enriched, auto-publishes if confidence >= 0.8.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// model id → daily request limit (per user's quota table)
const MODELS: { id: string; rpd: number; api: string }[] = [
  { id: "gemini-3.1-flash-lite", rpd: 500, api: "gemini-2.5-flash-lite" }, // fallback API name if 3.1 alias unavailable
  { id: "gemma-3-27b-it", rpd: 1500, api: "gemma-3-27b-it" },
  { id: "gemma-3-12b-it", rpd: 1500, api: "gemma-3-12b-it" },
  { id: "gemini-2.5-flash-lite", rpd: 20, api: "gemini-2.5-flash-lite" },
  { id: "gemini-2.5-flash", rpd: 20, api: "gemini-2.5-flash" },
  { id: "gemini-2.0-flash", rpd: 20, api: "gemini-2.0-flash" },
  { id: "gemini-2.5-pro", rpd: 20, api: "gemini-2.5-flash" }, // alias for "3.5 flash" experimental
];

const CULTURE_ROTATION = [
  { culture: "Арабская", religion: "Ислам", origin: "Арабский", lang: "ar" },
  { culture: "Персидская", religion: "Ислам", origin: "Персидский", lang: "fa" },
  { culture: "Турецкая", religion: "Ислам", origin: "Турецкий", lang: "tr" },
  { culture: "Таджикская", religion: "Ислам", origin: "Таджикский", lang: "tg" },
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
Только JSON, без markdown. Имена должны быть РАЗНЫЕ и реальные.`;

async function pickModel(supa: any): Promise<{ id: string; api: string } | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supa.from("llm_quota_usage").select("model,requests").eq("day", today);
  const used = new Map<string, number>((data ?? []).map((r: any) => [r.model, r.requests]));
  for (const m of MODELS) {
    if ((used.get(m.id) ?? 0) < m.rpd) return { id: m.id, api: m.api };
  }
  return null;
}

async function bumpQuota(supa: any, model: string) {
  const today = new Date().toISOString().slice(0, 10);
  await supa.rpc("exec", {}).then(() => {}, () => {}); // ignore
  // simple upsert
  const { data } = await supa
    .from("llm_quota_usage")
    .select("requests")
    .eq("model", model)
    .eq("day", today)
    .maybeSingle();
  if (data) {
    await supa
      .from("llm_quota_usage")
      .update({ requests: data.requests + 1, updated_at: new Date().toISOString() })
      .eq("model", model)
      .eq("day", today);
  } else {
    await supa.from("llm_quota_usage").insert({ model, day: today, requests: 1 });
  }
}

async function callGemini(apiModel: string, prompt: string): Promise<any[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: { role: "system", parts: [{ text: SYSTEM }] },
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`gemini ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "[]";
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : parsed?.names ?? [];
  } catch {
    return [];
  }
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

    const model = await pickModel(supa);
    if (!model) {
      await supa
        .from("enrich_runs")
        .update({ status: "skipped", finished_at: new Date().toISOString(), errors: { msg: "all models exhausted today" } })
        .eq("id", runId);
      return new Response(JSON.stringify({ ok: false, reason: "quota exhausted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // rotating culture by minute-of-hour
    const culture = CULTURE_ROTATION[new Date().getUTCMinutes() % CULTURE_ROTATION.length];
    const prompt = `Сгенерируй 10 реальных имён культуры: ${culture.culture}. Происхождение: ${culture.origin}.${culture.religion ? " Религия: " + culture.religion + "." : ""} Включи и мужские и женские. Избегай самых распространённых — давай разнообразие.`;

    const items = await callGemini(model.api, prompt);
    await bumpQuota(supa, model.id);

    let added = 0;
    let skipped = 0;
    for (const it of items) {
      if (!it?.name || !it?.gender) {
        skipped++;
        continue;
      }
      const confidence = Math.max(0, Math.min(1, Number(it.confidence) || 0.75));
      const status = confidence >= 0.8 ? "published" : "auto";
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
        source_url: `gemini:${model.id}`,
        llm_model: model.id,
        confidence,
        status,
      };
      const { error } = await supa.from("names_enriched").insert(row);
      if (error) {
        skipped++;
      } else {
        added++;
      }
    }

    await supa
      .from("enrich_runs")
      .update({
        status: "done",
        finished_at: new Date().toISOString(),
        model: model.id,
        source: `culture:${culture.culture}`,
        added,
        skipped,
      })
      .eq("id", runId);

    return new Response(JSON.stringify({ ok: true, model: model.id, culture: culture.culture, added, skipped }), {
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
