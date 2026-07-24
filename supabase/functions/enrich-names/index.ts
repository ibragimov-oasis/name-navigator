// Auto-enrichment of names via DIRECT Google Gemini API (Lovable AI Gateway is disabled).
// - Rotates across Gemini free-tier models within daily limits.
// - Handles 402/429/403 → marks model exhausted for the day, fails over.
// - Picks 3 LEAST-covered cultures each run (backfills gaps first).
// - Pre-checks duplicates so quota isn't wasted on names we already have.
// - Requests rich fields: native script, latin transliteration, famous people, popularity.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

type Supa = SupabaseClient;

interface GeminiItem {
  name?: string;
  nameNative?: string;
  nameLatin?: string;
  gender?: string;
  meaning?: string;
  history?: string;
  attributes?: string[];
  famousPeople?: string[];
  nameDay?: string | null;
  popularity?: number | string;
  confidence?: number | string;
}

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Google Generative Language API (v1beta). Free-tier RPD is per-model.
// https://ai.google.dev/gemini-api/docs/rate-limits
const MODELS: { id: string; rpd: number }[] = [
  { id: "gemini-2.5-flash-lite", rpd: 1000 },
  { id: "gemini-2.5-flash", rpd: 250 },
  { id: "gemini-2.0-flash-lite", rpd: 1500 },
  { id: "gemini-2.0-flash", rpd: 200 },
  { id: "gemini-1.5-flash-8b", rpd: 1500 },
  { id: "gemini-1.5-flash", rpd: 50 },
];

const CULTURE_ROTATION = [
  { culture: "Арабская", religion: "Ислам", origin: "Арабский", lang: "ar" },
  { culture: "Персидская", religion: "Ислам", origin: "Персидский", lang: "fa" },
  { culture: "Турецкая", religion: "Ислам", origin: "Турецкий", lang: "tr" },
  { culture: "Таджикская", religion: "Ислам", origin: "Таджикский", lang: "tg" },
  { culture: "Узбекская", religion: "Ислам", origin: "Тюркский", lang: "uz" },
  { culture: "Казахская", religion: "Ислам", origin: "Тюркский", lang: "kk" },
  { culture: "Киргизская", religion: "Ислам", origin: "Тюркский", lang: "ky" },
  { culture: "Азербайджанская", religion: "Ислам", origin: "Тюркский", lang: "az" },
  { culture: "Башкирская", religion: "Ислам", origin: "Тюркский", lang: "ba" },
  { culture: "Чеченская", religion: "Ислам", origin: "Нахский", lang: "ce" },
  { culture: "Татарская", religion: "Ислам", origin: "Тюркский", lang: "tt" },
  { culture: "Курдская", religion: "Ислам", origin: "Курдский", lang: "ku" },
  { culture: "Пуштунская", religion: "Ислам", origin: "Пуштунский", lang: "ps" },
  { culture: "Малайская", religion: "Ислам", origin: "Малайский", lang: "ms" },
  { culture: "Индонезийская", religion: "Ислам", origin: "Индонезийский", lang: "id" },
  { culture: "Урду", religion: "Ислам", origin: "Урду", lang: "ur" },
  { culture: "Русская", religion: "Православие", origin: "Славянский", lang: "ru" },
  { culture: "Украинская", religion: "Православие", origin: "Славянский", lang: "uk" },
  { culture: "Грузинская", religion: "Православие", origin: "Картвельский", lang: "ka" },
  { culture: "Армянская", religion: "Христианство", origin: "Армянский", lang: "hy" },
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

const SYSTEM = `Ты — эксперт по именам разных культур. Возвращай СТРОГО JSON-массив из 12 уникальных имён указанной культуры.
Каждый элемент:
{
 "name": "Имя в русской транскрипции",
 "nameNative": "написание на родном алфавите (араб/иврит/кит/яп/хангыль/деванагари/грузинский/армянский; для латинских культур — латиница)",
 "nameLatin": "стандартная латинская транслитерация",
 "gender": "male|female|unisex",
 "meaning": "1-2 предложения о значении",
 "history": "2-4 предложения об истории, происхождении, культурном контексте",
 "attributes": ["3-6 черт характера или ассоциаций"],
 "famousPeople": ["1-3 известных носителя имени (исторических или современных)"],
 "nameDay": "дата именин если применимо (православные/католические/армянские), иначе null",
 "popularity": 0-100,
 "confidence": 0.0-1.0
}
Только JSON-массив, без markdown, без префиксов. Имена реальные и разнообразные, включай и мужские и женские, избегай самых очевидных.`;

async function getUsage(supa: Supa): Promise<Map<string, number>> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supa.from("llm_quota_usage").select("model,requests").eq("day", today);
  return new Map<string, number>(
    ((data ?? []) as { model: string; requests: number }[]).map((r) => [r.model, r.requests]),
  );
}

async function reserveQuota(supa: Supa, model: string): Promise<void> {
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
      .update({ requests: ((data as { requests?: number }).requests ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq("model", model)
      .eq("day", today);
  } else {
    await supa.from("llm_quota_usage").insert({ model, day: today, requests: 1 });
  }
}

async function markExhausted(supa: Supa, model: string, rpd: number) {
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
      .update({ requests: Math.max(rpd, (data as { requests?: number }).requests ?? 0), updated_at: new Date().toISOString() })
      .eq("model", model)
      .eq("day", today);
  } else {
    await supa.from("llm_quota_usage").insert({ model, day: today, requests: rpd });
  }
}

function extractJsonArray(text: string): GeminiItem[] {
  const trimmed = (text ?? "").trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    const j = JSON.parse(trimmed);
    if (Array.isArray(j)) return j as GeminiItem[];
    if (Array.isArray(j?.names)) return j.names as GeminiItem[];
    if (Array.isArray(j?.items)) return j.items as GeminiItem[];
  } catch { /* fall through */ }
  const m = trimmed.match(/\[[\s\S]*\]/);
  if (m) {
    try {
      const j = JSON.parse(m[0]);
      if (Array.isArray(j)) return j as GeminiItem[];
    } catch { /* ignore */ }
  }
  return [];
}

async function callGemini(
  modelId: string,
  prompt: string,
): Promise<{ items: GeminiItem[]; status: number; raw: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });
  const txt = await res.text();
  if (!res.ok) return { items: [], status: res.status, raw: txt.slice(0, 400) };
  type GeminiResp = { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  let parsed: GeminiResp = {};
  try { parsed = JSON.parse(txt) as GeminiResp; } catch { /* ignore */ }
  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { items: extractJsonArray(text), status: 200, raw: text.slice(0, 300) };
}

async function pickLeastCoveredCultures(supa: Supa, n: number) {
  // Combine counts from names_enriched (published) with the CULTURE_ROTATION list.
  const { data } = await supa
    .from("names_enriched")
    .select("culture")
    .eq("status", "published");
  const counts = new Map<string, number>();
  for (const r of ((data ?? []) as { culture: string }[])) {
    counts.set(r.culture, (counts.get(r.culture) ?? 0) + 1);
  }
  const scored = CULTURE_ROTATION.map((c) => ({
    ...c,
    count: counts.get(c.culture) ?? 0,
  }));
  scored.sort((a, b) => a.count - b.count);
  const bottom = scored.slice(0, Math.max(n, 6));
  for (let i = bottom.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bottom[i], bottom[j]] = [bottom[j], bottom[i]];
  }
  return bottom.slice(0, n);
}

async function runBatch(
  supa: Supa,
  culture: typeof CULTURE_ROTATION[number],
  usage: Map<string, number>,
): Promise<{ added: number; skipped: number; model: string | null; err?: string; reason?: string }> {
  for (const m of MODELS) {
    if ((usage.get(m.id) ?? 0) >= m.rpd) continue;
    await reserveQuota(supa, m.id);
    usage.set(m.id, (usage.get(m.id) ?? 0) + 1);

    const prompt = `Сгенерируй 12 реальных имён культуры: ${culture.culture}. Происхождение: ${culture.origin}.${culture.religion ? " Религия: " + culture.religion + "." : ""} Обязательно включи и мужские, и женские. Избегай самых распространённых — давай разнообразие, редкие традиционные и современные варианты.`;
    const { items, status, raw } = await callGemini(m.id, prompt);

    if (status === 429 || status === 402 || status === 403) {
      await markExhausted(supa, m.id, m.rpd);
      usage.set(m.id, m.rpd);
      continue; // fail over to next model
    }
    if (status === 404) {
      await markExhausted(supa, m.id, m.rpd);
      usage.set(m.id, m.rpd);
      continue;
    }
    if (status !== 200) {
      return { added: 0, skipped: 0, model: m.id, err: `http ${status}: ${raw}` };
    }
    if (items.length === 0) {
      return { added: 0, skipped: 0, model: m.id, err: `empty parse: ${raw}` };
    }

    // Pre-filter duplicates so we don't lean on unique index errors.
    const wanted = items
      .filter((it) => it?.name && it?.gender)
      .map((it) => ({
        it,
        key: String(it.name).trim().toLowerCase(),
      }));
    const { data: existing } = await supa
      .from("names_enriched")
      .select("name,gender,culture")
      .in("name", wanted.map((w) => String(w.it.name).trim()))
      .eq("culture", culture.culture);
    const existSet = new Set(
      ((existing ?? []) as { name: string; gender: string }[]).map(
        (r) => `${String(r.name).toLowerCase()}|${r.gender}`,
      ),
    );

    let added = 0, skipped = 0;
    for (const w of wanted) {
      const it = w.it;
      const gender = it.gender && ["male", "female", "unisex"].includes(it.gender) ? it.gender : "unisex";
      if (existSet.has(`${w.key}|${gender}`)) { skipped++; continue; }
      const confidence = Math.max(0, Math.min(1, Number(it.confidence) || 0.75));
      const rowStatus = confidence >= 0.7 ? "published" : "auto";
      const popularity = Number.isFinite(Number(it.popularity))
        ? Math.max(0, Math.min(100, Math.round(Number(it.popularity))))
        : null;
      const row = {
        name: String(it.name).trim().slice(0, 80),
        name_native: it.nameNative ? String(it.nameNative).slice(0, 80) : null,
        name_latin: it.nameLatin ? String(it.nameLatin).slice(0, 80) : null,
        gender,
        culture: culture.culture,
        origin: culture.origin,
        religion: culture.religion ?? null,
        meaning: String(it.meaning ?? "").slice(0, 500),
        history: String(it.history ?? "").slice(0, 2000),
        attributes: Array.isArray(it.attributes) ? it.attributes.slice(0, 10) : [],
        famous_people: Array.isArray(it.famousPeople) ? it.famousPeople.slice(0, 5) : [],
        name_day: it.nameDay ? String(it.nameDay).slice(0, 60) : null,
        popularity,
        languages: [culture.lang],
        source_kind: "llm",
        source_url: `gemini:${m.id}`,
        llm_model: m.id,
        confidence,
        status: rowStatus,
      };
      const { error } = await supa.from("names_enriched").insert(row);
      if (error) {
        // Unique constraint or other conflict — count as skipped, don't fail the batch.
        skipped++;
      } else {
        added++;
      }
    }
    return { added, skipped, model: m.id };
  }
  return { added: 0, skipped: 0, model: null, reason: "all_models_exhausted" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Parse optional { batches: number } — for the admin "Boost" button.
  let batches = 3;
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (Number.isFinite(Number(body?.batches))) {
        batches = Math.max(1, Math.min(10, Math.floor(Number(body.batches))));
      }
    }
  } catch {}

  const runRow = await supa
    .from("enrich_runs")
    .insert({ source: "auto", status: "running" })
    .select()
    .single();
  const runId = runRow.data?.id;

  try {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    const usage = await getUsage(supa);
    const cultures = await pickLeastCoveredCultures(supa, batches);

    let totalAdded = 0, totalSkipped = 0;
    const details: Record<string, unknown>[] = [];
    let lastModel: string | null = null;
    let lastErr: string | undefined;
    let exhausted = false;

    for (const c of cultures) {
      const r = await runBatch(supa, c, usage);
      totalAdded += r.added;
      totalSkipped += r.skipped;
      if (r.model) lastModel = r.model;
      if (r.err) lastErr = r.err;
      details.push({ culture: c.culture, ...r });
      if (r.reason === "all_models_exhausted") {
        exhausted = true;
        break;
      }
    }

    const status =
      totalAdded > 0
        ? "done"
        : exhausted
        ? "skipped"
        : lastErr
        ? "error"
        : "skipped";

    await supa
      .from("enrich_runs")
      .update({
        status,
        finished_at: new Date().toISOString(),
        model: lastModel,
        source: `cultures:${cultures.map((c) => c.culture).join(",")}`,
        added: totalAdded,
        skipped: totalSkipped,
        errors: {
          reason: exhausted ? "no_quota_left" : lastErr ? "http" : "ok",
          msg: lastErr ?? null,
          details,
        },
      })
      .eq("id", runId);

    return new Response(
      JSON.stringify({
        ok: totalAdded > 0,
        added: totalAdded,
        skipped: totalSkipped,
        exhausted,
        details,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    await supa
      .from("enrich_runs")
      .update({
        status: "error",
        finished_at: new Date().toISOString(),
        errors: { reason: "exception", msg: String(err) },
      })
      .eq("id", runId);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
