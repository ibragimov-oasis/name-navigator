// Auto-enrichment of the names catalog. Called by pg_cron.
// Providers are tried in order: Lovable AI Gateway -> Gemini -> Pollinations (free).
// Stops early (records status) when every provider is rate-limited / out of credits.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const CULTURES = [
  "Русская", "Украинская", "Польская", "Чешская", "Сербская", "Болгарская",
  "Английская", "Французская", "Немецкая", "Итальянская", "Испанская", "Скандинавская", "Греческая",
  "Арабская", "Персидская", "Таджикская", "Узбекская", "Казахская", "Киргизская", "Татарская",
  "Башкирская", "Турецкая", "Азербайджанская", "Чеченская", "Китайская", "Японская", "Корейская",
];
const BATCH = 20;

type Gen = {
  name: string; gender: "male" | "female" | "unisex"; origin?: string; religion?: string;
  meaning?: string; history?: string; attributes?: string[]; famous_people?: string[];
  name_latin?: string; name_native?: string; popularity?: number; name_day?: string;
};
type Provider = { id: string; call: (prompt: string) => Promise<Response> };

function providers(): Provider[] {
  const list: Provider[] = [];
  const lov = Deno.env.get("LOVABLE_API_KEY");
  if (lov) list.push({
    id: "lovable:google/gemini-2.5-flash",
    call: (p) => fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${lov}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "user", content: p }] }),
    }),
  });
  const gem = Deno.env.get("GEMINI_API_KEY");
  if (gem) list.push({
    id: "gemini:gemini-2.5-flash",
    call: (p) => fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${gem}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemini-2.5-flash", messages: [{ role: "user", content: p }] }),
    }),
  });
  list.push({
    id: "pollinations:openai",
    call: (p) => fetch("https://text.pollinations.ai/openai", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai", messages: [{ role: "user", content: p }] }),
    }),
  });
  return list;
}

function parse(text: string): Gen[] {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try {
    const arr: unknown = JSON.parse(m[0]);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is Gen =>
      !!x && typeof x === "object" && typeof (x as Gen).name === "string" &&
      ["male", "female", "unisex"].includes((x as Gen).gender));
  } catch { return []; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const started = new Date().toISOString();

  // Least-covered culture first
  const { data: rows } = await db.from("names_enriched").select("culture");
  const counts = new Map<string, number>(CULTURES.map((c) => [c, 0]));
  for (const r of rows ?? []) if (counts.has(r.culture)) counts.set(r.culture, counts.get(r.culture)! + 1);
  const culture = [...counts.entries()].sort((a, b) => a[1] - b[1])[0][0];

  const { data: existing } = await db.from("names_enriched").select("name_lower").eq("culture", culture);
  const known = new Set((existing ?? []).map((e) => e.name_lower));
  const exclude = [...known].slice(0, 300).join(", ");

  const prompt = `Сгенерируй JSON-массив из ${BATCH} реальных, исторически существующих имён культуры «${culture}» (мужских и женских поровну). Не включай: ${exclude || "—"}.
Каждый объект: {"name": имя кириллицей, "name_latin", "name_native": в родной письменности, "gender": "male"|"female"|"unisex", "origin", "religion", "meaning": значение на русском, "history": 1-2 предложения о происхождении на русском, "attributes": 3 качества на русском, "famous_people": до 3 известных носителей, "popularity": 1-100, "name_day": строка или null}.
Ответь ТОЛЬКО JSON-массивом, без пояснений.`;

  const errors: { provider: string; status: number }[] = [];
  let names: Gen[] = []; let used = "";
  for (const p of providers()) {
    try {
      const res = await p.call(prompt);
      if (!res.ok) { errors.push({ provider: p.id, status: res.status }); await res.text(); continue; }
      const j = await res.json();
      names = parse(j?.choices?.[0]?.message?.content ?? "");
      if (names.length) { used = p.id; break; }
      errors.push({ provider: p.id, status: 0 });
    } catch { errors.push({ provider: p.id, status: -1 }); }
  }

  let added = 0, skipped = 0;
  for (const n of names) {
    const lower = n.name.trim().toLowerCase();
    if (!lower || known.has(lower)) { skipped++; continue; }
    const { error } = await db.from("names_enriched").insert({
      name: n.name.trim(), name_lower: lower, gender: n.gender, culture,
      origin: n.origin ?? culture, religion: n.religion ?? null, meaning: n.meaning ?? null,
      history: n.history ?? null, attributes: n.attributes ?? [], famous_people: n.famous_people ?? [],
      name_latin: n.name_latin ?? null, name_native: n.name_native ?? null,
      popularity: Math.max(1, Math.min(100, Math.round(n.popularity ?? 50))), name_day: n.name_day ?? null,
      languages: [], llm_model: used, source_kind: "llm", status: "published", confidence: 0.7,
    });
    if (error) skipped++; else { added++; known.add(lower); }
  }

  const status = added > 0 ? "ok" : names.length ? "duplicates" : "all_providers_failed";
  await db.from("enrich_runs").insert({
    started_at: started, finished_at: new Date().toISOString(), model: used || null,
    source: culture, added, skipped, errors: { providers: errors }, status,
  });
  return new Response(JSON.stringify({ culture, added, skipped, status, errors }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
